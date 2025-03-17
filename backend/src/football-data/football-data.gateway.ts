import { OnEvent } from '@nestjs/event-emitter';
import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { FootballEvent, footballEventPrefix } from './football-data.events';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/football',
  transports: ['websocket'],
})
export class FootballGateway {
  @WebSocketServer() server: Server;

  @OnEvent(`${footballEventPrefix}.*`)
  handleFootballEvent(event: FootballEvent) {
    this.server.emit(event.event, event.data);
  }
}
