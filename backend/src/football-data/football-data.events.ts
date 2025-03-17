import { Standing } from 'src/types/football.types';
import { Round as RoundEntity } from './model/round.entity';
import { Match as MatchEntity } from './model/match.entity';

export const footballEventPrefix = 'footballData';

export const enum FootballEvents {
  STANDING_UPDATED = `${footballEventPrefix}.standingUpdate`,
  LIVE_ROUND_UPDATED = `${footballEventPrefix}.liveRoundUpdate`,
  CURRENT_ROUND_UPDATED = `${footballEventPrefix}.currentRoundUpdate`,
  NUM_LIVE_MATCHES_UPDATED = `${footballEventPrefix}.numLiveMatchesUpdate`,
  LIVE_MATCH_ADDED = `${footballEventPrefix}.liveMatchAdded`,
  LIVE_MATCH_REMOVED = `${footballEventPrefix}.liveMatchRemoved`,
}

export const enum ServerFootballEvents {
  INIT_LIVE_MATCHES = `initLiveMatches`,
}

export type FootballEventData =
  | {
      round: RoundEntity;
      updatedMatches: MatchEntity[];
    }
  | {
      numLiveMatches: number;
      liveMatches: MatchEntity[];
    }
  | Standing
  | number;

export type FootballEvent = {
  event: FootballEvents;
  data: FootballEventData;
};
