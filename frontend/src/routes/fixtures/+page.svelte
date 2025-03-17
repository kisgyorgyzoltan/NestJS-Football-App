<script lang="ts">
  import EventsTable from "$lib/components/events-table.svelte";
  import type { PageData } from "./$types";
  import type { Round, Match } from "$lib/types/football.types";
  import type { ChatContext, VotesContext } from "$lib/types/chat.types";
  import { getContext, setContext } from "svelte";
  import type { UserContext } from "$lib/types/user.types";
  import { Contexts } from "$lib/contexts";

  import { FootballSocket } from "$lib/sockets/football-socket";
  import { ChatSocket } from "$lib/sockets/chat-socket";

  let { data }: { data: PageData } = $props();
  let rounds: Round[] = $state(data.rounds ?? []);
  let currentRoundNum: number = $state(data.currentRound ?? 1);

  let voteContext: VotesContext = $state({
    votes: {
      matchId: 0,
      home: 0,
      draw: 0,
      away: 0,
    },
    totalVotes: 0,
  });
  setContext(Contexts.Votes, voteContext);

  let user: UserContext = getContext(Contexts.User);
  let chat: ChatContext = $state({
    isOpen: false,
    match: null,
    content: [],
    chatButton: async (match: Match) => {
      if (chat.isOpen) {
        chat.isOpen = false;
        chat.match = null;
        chat.content = [];
        chat.hasVoted = false;

        const payload = {
          matchId: match.eventId,
          username: user.username,
        };
        chatSocket.leaveMatch(payload);
      } else {
        chatSocket.checkConnection();

        chat.isOpen = true;
        chat.match = match;
        chat.content = [];

        chatSocket.joinMatch({
          matchId: match.eventId,
          username: user.username,
        });
      }
    },
    votes: null,
    hasVoted: false,
    socketError: false,
  });
  setContext(Contexts.Chat, chat);

  let chatSocket: ChatSocket = $state(new ChatSocket(chat, user, voteContext));
  setContext(Contexts.ChatSocket, chatSocket);

  let footballSocket: FootballSocket = $state(new FootballSocket());

  $effect(() => {
    footballSocket.onLiveRoundUpdated(
      (data: { round: Round; updatedMatches: Match[] }) => {
        const updatedRoundId = data.round.roundId;
        const roundIndex = rounds.findIndex(
          (round) => round.roundId === updatedRoundId
        );
        if (roundIndex !== -1) {
          rounds[roundIndex] = data.round;
        }
      }
    );

    footballSocket.onCurrentRoundUpdated((data: number) => {
      currentRoundNum = data;
    });

    chatSocket.onMessage();
    chatSocket.onVote();

    return () => {
      footballSocket.disconnect();
      chatSocket.disconnect();
    };
  });
</script>

<EventsTable bind:rounds bind:currentRound={currentRoundNum} />
