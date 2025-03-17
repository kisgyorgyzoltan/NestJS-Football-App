import { FootballEvents } from "$lib/events/football";
import type { Round, Match, Standing } from "$lib/types/football.types";
import { io } from "socket.io-client";

export class FootballSocket {
  private footballSocket;

  constructor() {
    this.footballSocket = this.connectToServer();
  }

  connectToServer() {
    return io("http://localhost:8080/football", {
      transports: ["websocket"],
    });
  }

  onLiveRoundUpdated(
    callback: (data: { round: Round; updatedMatches: Match[] }) => void
  ) {
    this.footballSocket.on(FootballEvents.LIVE_ROUND_UPDATED, callback);
  }

  onCurrentRoundUpdated(callback: (data: number) => void) {
    this.footballSocket.on(FootballEvents.CURRENT_ROUND_UPDATED, callback);
  }

  onStandingUpdated(callback: (data: Standing) => void) {
    this.footballSocket.on(FootballEvents.STANDING_UPDATED, callback);
  }

  disconnect() {
    this.footballSocket.removeAllListeners();
    this.footballSocket.disconnect();
  }
}
