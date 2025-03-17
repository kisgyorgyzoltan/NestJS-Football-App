import { OnEvent } from '@nestjs/event-emitter';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import {
  NotificationEventData,
  NotificationEvents,
} from './notification.events';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/notification',
  transports: ['websocket'],
})
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  @OnEvent(NotificationEvents.LIVE_MATCH_UPDATED)
  handleLiveMatchUpdate(data: NotificationEventData) {
    const matchId = data.eventId;
    this.server
      .to(`match-${matchId}`)
      .emit(NotificationEvents.LIVE_MATCH_UPDATED, data);
  }

  @SubscribeMessage(NotificationEvents.SUBSCRIBE_TO_MATCH)
  handleSubscribeToMatch(client: Socket, matchId: string) {
    Logger.debug(`Client ${client.id} subscribing to match ${matchId}`);
    client.join(`match-${matchId}`);
  }

  @SubscribeMessage(NotificationEvents.UNSUBSCRIBE_FROM_MATCH)
  handleUnsubscribeFromMatch(client: Socket, matchId: string) {
    Logger.debug(`Client ${client.id} unsubscribing from match ${matchId}`);
    client.leave(`match-${matchId}`);
  }
}
