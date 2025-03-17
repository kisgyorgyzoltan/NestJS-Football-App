export const NotificationEventPrefix = "notification";

export const enum NotificationEvents {
  LIVE_MATCH_UPDATED = `${NotificationEventPrefix}.liveMatchUpdate`,
  SUBSCRIBE_TO_MATCH = `${NotificationEventPrefix}.subscribeToMatch`,
  UNSUBSCRIBE_FROM_MATCH = `${NotificationEventPrefix}.unsubscribeFromMatch`,
}
