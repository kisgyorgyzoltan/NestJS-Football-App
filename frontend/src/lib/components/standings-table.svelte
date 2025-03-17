<script lang="ts">
  import * as Table from "$lib/components/ui/table/index.js";
  import type { Standing, TeamStanding } from "$lib/types/football.types";

  const { standing = $bindable() }: { standing: Standing } = $props();

  const imageOnError = (standing: TeamStanding) => {
    console.error("imageError", standing.teamId);
    standing.imageError = true;
  };

  const imageOnLoad = (standing: TeamStanding) => {
    // console.log("imageOnLoad", standing.teamId);
    standing.imageError = false;
  };

  const CHAMPIONSHIP_ROUND = 6;
</script>

<Table.Root class="select-none">
  <Table.Header>
    <Table.Row>
      <Table.Head class="w-[100px]">Position</Table.Head>
      <Table.Head>Name</Table.Head>
      <Table.Head>M</Table.Head>
      <Table.Head>W</Table.Head>
      <Table.Head>D</Table.Head>
      <Table.Head>L</Table.Head>
      <Table.Head>P</Table.Head>
      <Table.Head>Diff</Table.Head>
      <Table.Head>Goals</Table.Head>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {#each standing as teamStanding}
      <Table.Row>
        <Table.Cell class="font-medium">
          <div class="flex items-center gap-2">
            <div
              class:relegation={teamStanding.position > CHAMPIONSHIP_ROUND}
              class:topSix={teamStanding.position <= CHAMPIONSHIP_ROUND}
              class="position w-6 h-6 flex items-center justify-center"
            >
              {teamStanding.position}
            </div>
            <div>
              {#if !teamStanding.imageError}
                <img
                  src={`https://api.sofascore.app/api/v1/team/${teamStanding.teamId}/image`}
                  alt=""
                  width="32"
                  height="32"
                  onload={() => imageOnLoad(teamStanding)}
                  onerror={() => imageOnError(teamStanding)}
                />
              {:else}
                <svg
                  height="24"
                  width="24"
                  viewBox="0 0 256 256"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#000000"
                >
                  <path
                    d="M207.99463,39.99512h-160a16.018,16.018,0,0,0-16,16v58.667c0,89.458,75.82617,119.125,91.02588,124.16406a15.48947,15.48947,0,0,0,9.94775,0c15.2002-5.03906,91.02637-34.70605,91.02637-124.16406v-58.667A16.018,16.018,0,0,0,207.99463,39.99512Zm0,74.667A130.11069,130.11069,0,0,1,207.31592,128H128v95.61548l-.00781.00268C115.27393,219.38965,55.67285,196.00488,48.67383,128H128V55.99512h79.99463Z"
                  />
                </svg>
              {/if}
            </div>
          </div></Table.Cell
        >
        <Table.Cell>{teamStanding.teamName}</Table.Cell>
        <Table.Cell>{teamStanding.played}</Table.Cell>
        <Table.Cell>{teamStanding.wins}</Table.Cell>
        <Table.Cell>{teamStanding.draws}</Table.Cell>
        <Table.Cell>{teamStanding.losses}</Table.Cell>
        <Table.Cell><b>{teamStanding.points}</b></Table.Cell>
        <Table.Cell>{teamStanding.diff}</Table.Cell>
        <Table.Cell>{teamStanding.goals}</Table.Cell>
      </Table.Row>
    {/each}
  </Table.Body>
</Table.Root>

<style>
  .topSix {
    background-color: rgb(120, 181, 28);
  }
  .relegation {
    background-color: red;
  }

  .position {
    border-radius: 50%;
    color: white;
  }
</style>
