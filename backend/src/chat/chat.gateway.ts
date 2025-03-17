import { OnEvent } from '@nestjs/event-emitter';
import {
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Match as MatchEntity } from '../football-data/model/match.entity';
import {
  FootballEvents,
  ServerFootballEvents,
} from 'src/football-data/football-data.events';
import { Inject, Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Repository } from 'typeorm';
import { ChatMessage } from './model/chat-message.entity';
import { User } from 'src/users/user.entity';
import { Vote } from './model/vote.entity';
import { ChatMessageDto, VoteDto } from 'src/types/chat.types';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/chat',
  transports: ['websocket'],
})
export class ChatGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private activeMatches = new Set<number>(); // Track active match rooms

  constructor(
    private readonly chatService: ChatService,
    // private readonly footballDataService: FootballDataService,
    @Inject('MATCH_REPOSITORY')
    private matchRepository: Repository<MatchEntity>,
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}

  async afterInit() {
    this.addMatch({ eventId: 12489689 } as MatchEntity); // Add some initial matches
    // const liveMatches = await this.footballDataService.getLiveMatches();
    // liveMatches.forEach((match) => this.addMatch(match));
  }

  @OnEvent(ServerFootballEvents.INIT_LIVE_MATCHES)
  initLiveMatches(payload: {
    numLiveMatches: number;
    liveMatches: MatchEntity[];
  }) {
    // Logger.debug(`Initializing live matches: ${payload.liveMatches.length}`);
    payload.liveMatches.forEach((match) => this.addMatch(match));
  }

  @SubscribeMessage('joinMatch')
  joinMatchChat(
    client: Socket,
    payload: { matchId: number; username: string },
  ) {
    Logger.debug(`Client ${client.id} joining match ${payload.matchId}`);
    if (!this.activeMatches.has(payload.matchId)) {
      Logger.debug(
        `Match ${payload.matchId} is not active, ignoring join request`,
      );
      client.emit('error', { message: 'Match is not active' });
      return;
    }
    client.join(`match-${payload.matchId}`);
  }

  @SubscribeMessage('leaveMatch')
  leaveMatchChat(
    client: Socket,
    payload: { matchId: number; username: string },
  ) {
    Logger.debug(`Client ${client.id} leaving match ${payload.matchId}`);
    client.leave(`match-${payload.matchId}`);
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, chatMessageDto: ChatMessageDto) {
    const matchId = chatMessageDto.matchId;
    if (!this.activeMatches.has(matchId)) {
      Logger.debug(
        `Match ${matchId} is not active, ignoring message from ${chatMessageDto.username}`,
      );
      return;
    }
    Logger.debug(
      `Received message for match ${matchId}, content: ${chatMessageDto.content}, from: ${chatMessageDto.username}`,
    );
    this.server.to(`match-${matchId}`).emit('message', chatMessageDto);

    const match = await this.matchRepository.findOne({
      where: { eventId: matchId },
    });

    if (!match) {
      Logger.error(`Match ${matchId} not found`);
      return;
    }

    const user = await this.userRepository.findOne({
      where: { id: chatMessageDto.userId },
    });

    if (!user) {
      Logger.error(`User ${chatMessageDto.userId} not found`);
      return;
    }

    const chatMessage: ChatMessage = Object.assign(
      new ChatMessage(),
      chatMessageDto,
    );
    chatMessage.match = match;
    chatMessage.user = user;

    await this.chatService.createChatMessage(chatMessage);
  }

  @OnEvent(FootballEvents.LIVE_MATCH_ADDED)
  addMatch(match: MatchEntity) {
    Logger.debug(`Adding match ${match.eventId}`);
    this.activeMatches.add(match.eventId);
  }

  @OnEvent(FootballEvents.LIVE_MATCH_REMOVED)
  removeMatch(match: MatchEntity) {
    Logger.debug(`Removing match ${match.eventId}`);
    this.activeMatches.delete(match.eventId);
    this.server
      .to(`match-${match.eventId}`)
      .emit('matchEnded', { matchId: match.eventId });
  }

  @SubscribeMessage('vote')
  async handleVote(client: Socket, voteDto: VoteDto) {
    Logger.debug(`Received vote: ${JSON.stringify(voteDto)}`);

    const matchId = voteDto.matchId;
    if (!this.activeMatches.has(matchId)) {
      Logger.debug(
        `Match ${matchId} is not active, ignoring vote from ${voteDto.username}`,
      );
      return;
    }
    this.server.to(`match-${matchId}`).emit('vote', voteDto); //

    const match = await this.matchRepository.findOne({
      where: { eventId: matchId },
    });
    if (!match) {
      Logger.error(`Match ${matchId} not found`);
      return;
    }

    const user = await this.userRepository.findOne({
      where: { id: voteDto.userId },
    });
    if (!user) {
      Logger.error(`User ${voteDto.userId} not found`);
      return;
    }

    const vote = new Vote();
    vote.match = match;
    vote.user = user;
    vote.content = voteDto.content;
    vote.createdAt = new Date(voteDto.createdAt);
    const newVote = await this.chatService.createVote(vote);
  }
}
