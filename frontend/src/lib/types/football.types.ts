export type TeamStanding = {
  position: number;
  href: string;
  teamId: number;
  teamName: string;
  smallImageSrc: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  diff: string;
  goals: string;
  points: number;
  imageError?: boolean;
};

export type Standing = TeamStanding[];

export type Match = {
  eventId: number;
  homeTeamImageUrl: string;
  awayTeamImageUrl: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  matchStatus: string;
  timeDate: string;
  imageError?: boolean;
};

export type Round = {
  id: number;
  roundId: string;
  matches: Match[];
};
