import { NotificationEvents } from "$lib/events/notification";
import type { Match } from "$lib/types/football.types";
import { io } from "socket.io-client";

export class NotificationSocket {
  private notificationSocket;

  constructor() {
    this.notificationSocket = this.connectToServer();
  }

  connectToServer() {
    return io("http://localhost:8080/notification", {
      transports: ["websocket"],
    });
  }

  subscribeToNotifications(match: Match) {
    const matchId = match.eventId.toString();
    this.notificationSocket.emit(
      NotificationEvents.SUBSCRIBE_TO_MATCH,
      matchId
    );
  }

  unsubscribeFromNotifications(match: Match) {
    const matchId = match.eventId.toString();
    this.notificationSocket.emit(
      NotificationEvents.UNSUBSCRIBE_FROM_MATCH,
      matchId
    );
  }

  onNotification(callback: (data: Match) => void) {
    this.notificationSocket.on(NotificationEvents.LIVE_MATCH_UPDATED, callback);
  }

  disconnect() {
    this.notificationSocket.removeAllListeners();
    this.notificationSocket.disconnect();
  }
}
