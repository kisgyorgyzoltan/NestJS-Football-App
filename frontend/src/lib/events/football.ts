export const footballEventPrefix = "footballData";

export const enum FootballEvents {
  STANDING_UPDATED = `${footballEventPrefix}.standingUpdate`,
  LIVE_ROUND_UPDATED = `${footballEventPrefix}.liveRoundUpdate`,
  CURRENT_ROUND_UPDATED = `${footballEventPrefix}.currentRoundUpdate`,
  NUM_LIVE_MATCHES_UPDATED = `${footballEventPrefix}.numLiveMatchesUpdate`,
  LIVE_MATCH_ADDED = `${footballEventPrefix}.liveMatchAdded`,
  LIVE_MATCH_REMOVED = `${footballEventPrefix}.liveMatchRemoved`,
}
