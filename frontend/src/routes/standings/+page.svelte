<script lang="ts">
  import StandingsTable from "$lib/components/standings-table.svelte";
  import type { PageData } from "./$types";
  import type { Standing } from "$lib/types/football.types";
  import { FootballSocket } from "$lib/sockets/football-socket";

  let { data }: { data: PageData } = $props();
  let standing: Standing = $state(data.standing ?? []);
  let footballSocket: FootballSocket = $state(new FootballSocket());

  $effect(() => {
    footballSocket.onStandingUpdated((data: Standing) => {
      standing = data;
    });
  });
</script>

<StandingsTable bind:standing />
