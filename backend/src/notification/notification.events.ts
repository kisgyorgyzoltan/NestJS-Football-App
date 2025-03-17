import { Match } from 'src/football-data/model/match.entity';

export const NotificationEventPrefix = 'notification';

export const enum NotificationEvents {
  LIVE_MATCH_UPDATED = `${NotificationEventPrefix}.liveMatchUpdate`,
  SUBSCRIBE_TO_MATCH = `${NotificationEventPrefix}.subscribeToMatch`,
  UNSUBSCRIBE_FROM_MATCH = `${NotificationEventPrefix}.unsubscribeFromMatch`,
}

export type NotificationEventData = Match;

export type NotificationEvent = {
  event: NotificationEvents;
  data: NotificationEventData;
};
