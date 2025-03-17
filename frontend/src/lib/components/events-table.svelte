<script lang="ts">
  import { type CarouselAPI } from "$lib/components/ui/carousel/context.js";
  import * as Carousel from "$lib/components/ui/carousel/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import type { Match, Round } from "$lib/types/football.types";
  import { getContext } from "svelte";
  import Button from "./ui/button/button.svelte";
  import type {
    ChatContext,
    ChatInitialQuery,
    VotesContext,
  } from "$lib/types/chat.types";
  import ChatWindow from "./chat-window.svelte";
  import { Bell, BellOff, MessageSquare } from "lucide-svelte";
  import { enhance } from "$app/forms";
  import { Contexts } from "$lib/contexts";
  import type { NotificationContext } from "$lib/types/notification.types";

  const {
    rounds = $bindable(),
    currentRound = $bindable(),
  }: { rounds: Round[]; currentRound: number } = $props();

  let chat: ChatContext = getContext(Contexts.Chat);
  let notificationContext: NotificationContext = getContext(
    Contexts.Notification
  );
  let votesContext: VotesContext = getContext(Contexts.Votes);
  let api = $state<CarouselAPI>();

  $effect(() => {
    if (api) {
      api?.scrollTo(currentRound - 1, true);
    }
  });

  const imageOnError = (match: Match) => {
    // match.imageError = true;
  };

  const imageOnLoad = (match: Match) => {
    // match.imageError = false;
  };
</script>

<div class="flex flex-row gap-20 ml-20 flex-nowrap justify-start items-start">
  <Carousel.Root
    setApi={(emblaApi) => (api = emblaApi)}
    class="max-w-96 h-fit select-none rounded-lg shadow-2xl shadow-slate-300 scale-95 border-1 border-slate-10"
  >
    <Carousel.Content>
      {#each rounds as round}
        <Carousel.Item class="bg-slate-10">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head class="text-center">{round.roundId}</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each round.matches as match}
                <Table.Row>
                  <Table.Cell>
                    <div class="flex items-start gap-1 justify-center">
                      {#if !match.imageError}
                        <img
                          src={match.homeTeamImageUrl}
                          alt=""
                          width="25"
                          height="25"
                          onload={() => imageOnLoad(match)}
                          onerror={() => imageOnError(match)}
                        />
                      {:else}
                        <svg
                          height="25"
                          width="25"
                          viewBox="0 0 256 256"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="#000000"
                        >
                          <path
                            d="M207.99463,39.99512h-160a16.018,16.018,0,0,0-16,16v58.667c0,89.458,75.82617,119.125,91.02588,124.16406a15.48947,15.48947,0,0,0,9.94775,0c15.2002-5.03906,91.02637-34.70605,91.02637-124.16406v-58.667A16.018,16.018,0,0,0,207.99463,39.99512Zm0,74.667A130.11069,130.11069,0,0,1,207.31592,128H128v95.61548l-.00781.00268C115.27393,219.38965,55.67285,196.00488,48.67383,128H128V55.99512h79.99463Z"
                          />
                        </svg>
                      {/if}
                      <div>{match.homeTeamName}</div>
                      <div class="flex items-center gap-1 justify-center">
                        <div
                          class="score"
                          class:winnerScore={match.homeScore > match.awayScore}
                          class:loserScore={match.homeScore < match.awayScore}
                        >
                          {match.homeScore}
                        </div>
                        <div>-</div>
                        <div
                          class="score"
                          class:winnerScore={match.homeScore < match.awayScore}
                          class:loserScore={match.homeScore > match.awayScore}
                        >
                          {match.awayScore}
                        </div>
                      </div>
                      <div>{match.awayTeamName}</div>
                      {#if !match.imageError}
                        <img
                          src={match.awayTeamImageUrl}
                          alt=""
                          width="25"
                          height="32"
                          onload={() => imageOnLoad(match)}
                          onerror={() => imageOnError(match)}
                        />
                      {:else}
                        <svg
                          height="25"
                          width="25"
                          viewBox="0 0 256 256"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="#000000"
                        >
                          <path
                            d="M207.99463,39.99512h-160a16.018,16.018,0,0,0-16,16v58.667c0,89.458,75.82617,119.125,91.02588,124.16406a15.48947,15.48947,0,0,0,9.94775,0c15.2002-5.03906,91.02637-34.70605,91.02637-124.16406v-58.667A16.018,16.018,0,0,0,207.99463,39.99512Zm0,74.667A130.11069,130.11069,0,0,1,207.31592,128H128v95.61548l-.00781.00268C115.27393,219.38965,55.67285,196.00488,48.67383,128H128V55.99512h79.99463Z"
                          />
                        </svg>
                      {/if}
                      {#if match.matchStatus.match("[0-9]{2}:[0-9]{2}") || match.matchStatus == "-"}
                        <div>
                          {match.timeDate}
                        </div>
                      {:else}
                        <div
                          class:live={match.matchStatus !== "FT" &&
                            match.matchStatus !== "Postponed"}
                        >
                          {match.matchStatus}
                        </div>
                        {#if match.matchStatus !== "FT" && match.matchStatus !== "Postponed"}
                          <form
                            method="POST"
                            action="?/chat"
                            use:enhance={({
                              formElement,
                              formData,
                              action,
                              cancel,
                              submitter,
                            }) => {
                              if (!chat.isOpen) {
                                cancel();
                              }

                              formData.set("matchId", match.eventId.toString());
                              return async ({ result, update }) => {
                                if (result.type === "success" && result.data) {
                                  const { votes, messages } =
                                    result.data as ChatInitialQuery;
                                  messages.forEach((message) => {
                                    message.createdAt = new Date(
                                      message.createdAt
                                    );
                                  });

                                  votesContext.votes = votes;
                                  votesContext.totalVotes =
                                    votes.away + votes.draw + votes.home;
                                  chat.content = [...messages, ...chat.content];
                                }
                              };
                            }}
                          >
                            <Button
                              onclick={() => chat.chatButton(match)}
                              class="text-xs"
                              variant="secondary"
                              type="submit"
                            >
                              <MessageSquare />
                            </Button>
                          </form>
                          <Button
                            onclick={() =>
                              notificationContext.handleClick(match)}
                          >
                            {#if !notificationContext.notifications[match.eventId]}
                              <Bell />
                            {:else}
                              <BellOff />
                            {/if}
                          </Button>
                        {/if}
                      {/if}
                    </div>
                  </Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        </Carousel.Item>
      {/each}
    </Carousel.Content>
    <Carousel.Previous />
    <Carousel.Next />
  </Carousel.Root>
  <ChatWindow />
</div>

<style>
  .score {
    font-weight: bold;
  }
  .winnerScore {
    color: rgb(0, 128, 0);
  }
  .loserScore {
    color: rgb(128, 0, 0);
  }

  .live {
    color: red;
  }
</style>
