import { Inject, Injectable, Logger } from '@nestjs/common';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Vote } from './model/vote.entity';
import { ChatMessage } from './model/chat-message.entity';
import { VoteOption, VoteResponse } from 'src/types/chat.types';

@Injectable()
export class ChatService {
  constructor(
    @Inject('CHAT_MESSAGE_REPOSITORY')
    private chatMessageRepository: Repository<ChatMessage>,
    @Inject('VOTE_REPOSITORY')
    private voteRepository: Repository<Vote>,
  ) {}

  async createChatMessage(chatMessage: ChatMessage): Promise<ChatMessage> {
    // Logger.debug(`Creating chat message: ${JSON.stringify(chatMessage)}`);
    return this.chatMessageRepository.save(chatMessage);
  }

  async createVote(vote: Vote): Promise<Vote> {
    return this.voteRepository.save(vote);
  }

  async getMessagesByMatchId(matchId: number): Promise<ChatMessage[]> {
    return this.chatMessageRepository.find({
      where: { match: { eventId: matchId } },
    });
  }

  async getMessagesByMatchIdAndThreshold(
    matchId: number,
    threshold: Date,
  ): Promise<ChatMessage[]> {
    return this.chatMessageRepository.find({
      where: {
        match: { eventId: matchId },
        createdAt: MoreThanOrEqual(threshold),
      },
    });
  }

  async getVotesByMatchId(matchId: number): Promise<VoteResponse> {
    const homeVotes = await this.voteRepository.count({
      where: { match: { eventId: matchId }, content: VoteOption.HOME },
      relations: ['match'],
    });

    const awayVotes = await this.voteRepository.count({
      where: { match: { eventId: matchId }, content: VoteOption.AWAY },
      relations: ['match'],
    });

    const drawVotes = await this.voteRepository.count({
      where: { match: { eventId: matchId }, content: VoteOption.DRAW },
      relations: ['match'],
    });

    return {
      matchId,
      home: homeVotes,
      away: awayVotes,
      draw: drawVotes,
    };
  }
}
