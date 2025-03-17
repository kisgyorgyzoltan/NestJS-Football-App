import type { Match } from "./football.types";

export type VotesContext = {
  votes: Votes;
  totalVotes: number;
};

export type Votes = {
  matchId: number;
  home: number;
  away: number;
  draw: number;
};

export type VoteState = {
  votes: {
    home: number;
    draw: number;
    away: number;
  };
  totalVotes: number;
};

export type ChatContext = {
  isOpen: boolean;
  match: Match | null;
  content: ChatMessage[];
  hasVoted: boolean;
  chatButton: (match: Match) => void;
};

export type ChatMessage = {
  userId: number;
  username: string;
  content: string;
  createdAt: Date;
  matchId: number;
};

export type ChatMessageDto = {
  userId: number;
  username: string;
  content: string;
  createdAt: string;
  matchId: number;
};

export type VoteDto = {
  userId: number;
  username: string;
  content: VoteOption;
  createdAt: string;
  matchId: number;
};

export enum VoteOption {
  HOME = "home",
  DRAW = "draw",
  AWAY = "away",
}

export type ChatInitialQuery = {
  votes: Votes;
  messages: ChatMessage[];
};
