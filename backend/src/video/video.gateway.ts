import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SignalData } from 'simple-peer';
import { VideoEvents } from './video.events';

const MAX_USERS = 4;

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/video',
  transports: ['websocket'],
})
export class VideoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  users: { [key: string]: string[] } = {};

  socketToRoom = {};

  handleConnection(client: Socket) {
    Logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    Logger.debug(`Client disconnected: ${client.id}`);
    const roomID: string = this.socketToRoom[client.id];
    let room = this.users[roomID];
    if (room) {
      this.server.emit(VideoEvents.USER_LEFT, client.id);
      room = room.filter((id: string) => id !== client.id);
      this.users[roomID] = room;
    }
  }

  @SubscribeMessage(VideoEvents.JOIN_ROOM)
  handleJoinRoom(client: Socket, roomID: string) {
    Logger.debug(`Client ${client.id} joined room ${roomID}`);
    if (this.users[roomID]) {
      const length = this.users[roomID].length;
      if (length === MAX_USERS) {
        Logger.debug(`Room ${roomID} is full`);
        client.emit(VideoEvents.ROOM_FULL);
        return;
      }
      this.users[roomID].push(client.id);
    } else {
      this.users[roomID] = [client.id];
    }
    this.socketToRoom[client.id] = roomID;
    const usersInThisRoom = this.users[roomID].filter(
      (id: string) => id !== client.id,
    );

    client.emit(VideoEvents.ALL_USERS, usersInThisRoom);
    Logger.debug(`Emitted all users to ${client.id}`);
  }

  @SubscribeMessage(VideoEvents.SENDING_SIGNAL)
  handleSendSignal(
    client: Socket,
    payload: {
      userToSignal: string;
      signal: SignalData;
      callerID: string;
    },
  ) {
    Logger.debug(`Sending signal to ${payload.userToSignal}`);
    this.server.to(payload.userToSignal).emit(VideoEvents.USER_JOINED, {
      signal: payload.signal,
      callerID: payload.callerID,
    });
  }

  @SubscribeMessage(VideoEvents.RETURNING_SIGNAL)
  handleReturnSignal(client: Socket, payload: any) {
    Logger.debug(`Returning signal to ${payload.callerID}`);
    this.server
      .to(payload.callerID)
      .emit(VideoEvents.RECEIVED_RETURNED_SIGNAL, {
        signal: payload.signal,
        id: client.id,
      });
  }
}
