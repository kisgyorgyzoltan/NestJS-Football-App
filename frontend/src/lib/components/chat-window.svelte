<script lang="ts">
  import {
    VoteOption,
    type ChatContext,
    type ChatMessage,
    type VoteDto,
    type VotesContext,
  } from "$lib/types/chat.types";
  import { getContext } from "svelte";
  import * as Card from "$lib/components/ui/card/index.js";
  import type { UserContext } from "$lib/types/user.types";
  import { Button } from "./ui/button";
  import { Input } from "./ui/input";
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
  import { Video, X } from "lucide-svelte";
  import { Contexts } from "$lib/contexts";

  import { exitWindow } from "$lib/hooks/chat";
  import type { ChatSocket } from "$lib/sockets/chat-socket";
  import { toast } from "svelte-sonner";

  const MAX_CHAT_LENGTH = 50;

  let chatSocket: ChatSocket = getContext(Contexts.ChatSocket);
  let chat: ChatContext = getContext(Contexts.Chat);
  let user: UserContext = getContext(Contexts.User);
  let voteContext: VotesContext = getContext(Contexts.Votes);

  let chatField = $state("");
  let remainingChatLength = $derived(MAX_CHAT_LENGTH - chatField.length);

  async function handleSubmit() {
    console.log("handleSubmit", chatField);
    try {
      if (chatField.trim() === "" || chatField.length > 50) {
        toast.error("Message must be between 1 and 50 characters", {
          duration: 2000,
        });
        return;
      }

      if (
        user.username !== null &&
        user.userId !== null &&
        chat.match?.eventId !== undefined
      ) {
        const message: ChatMessage = {
          userId: user.userId,
          username: user.username,
          content: chatField,
          createdAt: new Date(),
          matchId: chat.match?.eventId,
        };

        console.log("Emitting message", message);
        chatSocket.sendChatMessage(message);

        chat.content = [...chat.content, message];
      }
      chatField = "";
      console.log("chatField", chatField);
    } catch (error) {
      console.error("handleSubmit", error);
    }
  }

  function handleVote(option: VoteOption) {
    voteContext.votes[option]++;
    voteContext.totalVotes++;
    chat.hasVoted = true;
    if (!user.userId || !user.username || !chat.match?.eventId) {
      console.error("User not logged in");
      return;
    }
    const voteDto: VoteDto = {
      userId: user.userId,
      username: user.username,
      content: option,
      createdAt: new Date().toString(),
      matchId: chat.match?.eventId,
    };

    chatSocket.sendVote(voteDto);
  }
</script>

{#if chat.isOpen}
  <div class="relative flex scale-75">
    <Card.Root
      class="absolute top-0 bg-white w-96 h-min flex flex-col justify-between p-4 rounded-lg shadow-lg
    "
    >
      <Card.Header>
        <div class="absolute top-2 right-2 flex gap-2">
          <a href={`/video/${chat.match?.eventId}`}>
            <Button>
              <Video />
            </Button>
          </a>
          <Button onclick={() => exitWindow(chat)}>
            <X />
          </Button>
        </div>
        <div
          class="pt-5"
          id="istok
        "
        >
          <Card.Title class="text-lg font-semibold"
            >{chat.match?.homeTeamName} vs {chat.match?.awayTeamName} Chat</Card.Title
          >
          <Card.Description
            >Current score: {chat.match?.homeScore}:{chat.match
              ?.awayScore}</Card.Description
          >
        </div>
      </Card.Header>
      <Card.Content>
        <ScrollArea class="h-96 border border-gray-200">
          {#each chat.content as message}
            <div
              id="chat-message"
              class="flex p-2 text-lg max-w-sm"
              class:left={message.username !== user.username}
              class:right={message.username === user.username}
            >
              <div
                class="flex p-3 border border-gray-400 rounded-full bg-gray-100"
              >
                <div class="flex flex-col gap-1">
                  <span class="text-sm font-semibold flex max-w-min"
                    >{message.username}{":"}</span
                  >
                  <span class="text-xs text-gray-500"
                    >{new Date(message.createdAt).toLocaleDateString()}</span
                  >
                </div>
                <div class="flex flex-col gap-1 text-wrap">
                  <span class="text-sm">{message.content}</span>
                </div>
              </div>
            </div>
          {/each}
        </ScrollArea>
      </Card.Content>
      <Card.Footer>
        <div>
          <div class="voting-container">
            <button
              disabled={chat.hasVoted}
              onclick={() => handleVote(VoteOption.HOME)}
              class="flex flex-col gap-1 justify-center items-center"
              ><span>1 (Home)</span><span
                >{voteContext.votes.home}
              </span></button
            >
            <button
              disabled={chat.hasVoted}
              onclick={() => handleVote(VoteOption.DRAW)}
              class="flex flex-col gap-1 justify-center items-center"
              ><span>X (Draw)</span><span>{voteContext.votes.draw}</span
              ></button
            >
            <button
              disabled={chat.hasVoted}
              onclick={() => handleVote(VoteOption.AWAY)}
              class="flex flex-col gap-1 justify-center items-center"
              ><span>2 (Away)</span><span>{voteContext.votes.away}</span
              ></button
            >
          </div>

          <div class="flex justify-between gap-4">
            <div class="relative">
              <Input
                bind:value={chatField}
                placeholder={"Type your message here"}
                onkeydown={(e) => e.key === "Enter" && handleSubmit()}
                maxlength={MAX_CHAT_LENGTH}
                class="text-md "
              ></Input>
              <span
                id="remainingLength"
                class="absolute top-0 right-0 text-xs text-gray-500"
                >({remainingChatLength})</span
              >
            </div>
            <Button onclick={() => handleSubmit()} class="w-20">Send</Button>
          </div>
        </div></Card.Footer
      >
    </Card.Root>
  </div>
{/if}

<style>
  .left {
    flex-direction: row;
  }
  .right {
    flex-direction: row-reverse;
  }

  .voting-container {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  button {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    cursor: pointer;
    border: 1px solid #ccc;
    border-radius: 5px;
    transition: background-color 0.3s ease;
  }

  button:hover {
    background-color: #ddd;
  }
</style>
