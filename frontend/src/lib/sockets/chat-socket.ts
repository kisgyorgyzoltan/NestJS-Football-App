import {
  VoteOption,
  type ChatContext,
  type ChatMessage,
  type VoteDto,
  type VotesContext,
} from "$lib/types/chat.types";
import type { UserContext } from "$lib/types/user.types";
import { Volleyball } from "lucide-svelte";
import { Socket, io } from "socket.io-client";
import { toast } from "svelte-sonner";

export class ChatSocket {
  private chatSocket: Socket;
  private chatContext: ChatContext;
  private userContext: UserContext;
  private voteContext: VotesContext;

  constructor(chat: ChatContext, user: UserContext, vote: VotesContext) {
    this.chatContext = chat;
    this.userContext = user;
    this.voteContext = vote;
    this.chatSocket = this.connectToServer();
  }

  connectToServer() {
    return io("http://localhost:8080/chat", {
      transports: ["websocket"],
    });
  }

  leaveMatch(payload: { matchId: number; username: string | null }) {
    this.chatSocket.emit("leaveMatch", payload);
  }

  joinMatch(payload: { matchId: number; username: string | null }) {
    this.chatSocket.emit("joinMatch", payload);
  }

  checkConnection() {
    if (!this.chatSocket || !this.chatSocket?.connected) {
      this.chatSocket = this.connectToServer();
      if (!this.getConnectionStatus()) {
        console.error("Failed to connect to chat server");
        toast.error("Failed to connect to chat server", {
          duration: 5000,
          icon: Volleyball,
        });
        return false;
      }
    }
    return true;
  }

  onMessage() {
    this.chatSocket.on("message", (message: ChatMessage) => {
      if (message.username !== this.userContext?.username) {
        console.log("received message", message);
        this.chatContext.content = [...this.chatContext.content, message];
      }
    });
  }

  onVote() {
    this.chatSocket.on("vote", (voteDto: VoteDto) => {
      console.log("received vote", voteDto);
      if (this.voteContext) {
        if (voteDto.username === this.userContext.username) {
          this.chatContext.hasVoted = true;
        } else {
          switch (voteDto.content) {
            case VoteOption.HOME:
              this.voteContext.votes.home++;
              break;
            case VoteOption.DRAW:
              this.voteContext.votes.draw++;
              break;
            case VoteOption.AWAY:
              this.voteContext.votes.away++;
              break;
          }
        }
        this.voteContext.totalVotes++;
      }
    });
  }

  getConnectionStatus() {
    return this.chatSocket.connected;
  }

  sendVote(voteDto: VoteDto) {
    this.chatSocket.emit("vote", voteDto);
  }

  sendChatMessage(message: ChatMessage) {
    this.chatSocket.emit("message", message);
  }

  disconnect() {
    this.chatSocket.removeAllListeners();
    this.chatSocket.disconnect();
  }
}
