import type {
  ChatContext,
} from "$lib/types/chat.types";


export function exitWindow(chatContext: ChatContext) {
  if (chatContext.match) {
    chatContext.chatButton(chatContext.match);
  }
}
