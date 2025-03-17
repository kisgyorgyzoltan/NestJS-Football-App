export type VoteResponse = {
  matchId: number;
  home: number;
  away: number;
  draw: number;
};

export enum VoteOption {
  HOME = 'home',
  DRAW = 'draw',
  AWAY = 'away',
}

export type ChatMessageDto = {
  userId: number;
  username: string;
  content: string;
  createdAt: Date;
  matchId: number;
};

export type VoteDto = {
  userId: number;
  username: string;
  content: VoteOption;
  createdAt: string;
  matchId: number;
};
