import type { Match } from "./football.types";

export type NotificationContext = {
  subscribeToNotifications(match: Match): void;
  unsubscribeFromNotifications(match: Match): void;
  handleClick(match: Match): void;
  notifications: { [key: string]: boolean };
};
