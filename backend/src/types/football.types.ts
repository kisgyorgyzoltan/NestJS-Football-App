import { Round as RoundEntity } from 'src/football-data/model/round.entity';

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
};

export type Rounds = Record<string, Match[]>;

export type FootballData = {
  standing: Standing;
  rounds: RoundEntity[];
  currentRound: number;
  numLiveMatches: number;
};
