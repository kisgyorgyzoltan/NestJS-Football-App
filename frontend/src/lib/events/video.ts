export const VideoEventPrefix = "video";

export const enum VideoEvents {
  JOIN_ROOM = `${VideoEventPrefix}.joinRoom`,
  ROOM_FULL = `${VideoEventPrefix}.roomFull`,
  ALL_USERS = `${VideoEventPrefix}.allUsers`,
  USER_JOINED = `${VideoEventPrefix}.userJoined`,
  USER_LEFT = `${VideoEventPrefix}.userLeft`,
  SENDING_SIGNAL = `${VideoEventPrefix}.sendingSignal`,
    RETURNING_SIGNAL = `${VideoEventPrefix}.returningSignal`,
    RECEIVED_RETURNED_SIGNAL = `${VideoEventPrefix}.receivedReturnedSignal`,

}
