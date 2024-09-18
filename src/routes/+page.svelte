<script lang="ts">
  import { launchError } from "$lib/stores/launchStore";
  import AlertDialog from "$lib/components/AlertDialog.svelte";
  import Form from "$lib/components/ui/form/Form.svelte";
  import TownHall from "../assets/images/townhall.png";
</script>

<div class="grid grid-cols-1 gap-x-8 lg:grid-cols-2 lg:grid-rows-[800px]">
  <div class="grid-item flex flex-col lg:p-16 lg:justify-center">
    <img src={TownHall} alt="townhall" width="150" />
    <div class="py-6">
      <h1 class="text-4xl font-display">Official Refitted Servers:</h1>
      <p class="text-md font-medium text-muted-foreground pt-4">
        The official Backyard Monsters Refitted server. A 1:1 preservation of
        the original Adobe Flash game, with the adoption of Map Room 2. All
        buildings, monsters and gameplay mechanics on this server are from the
        classic vanilla version of the game. Just how you remember it! Join us
        now and relive the nostalgia.
        <br />
        <br />
        <b class="text-primary">Rules:</b> This server has strict monitoring for
        cheating to ensure a fair and enjoyable experience for all players.
      </p>
    </div>
    <div class="flex flex-col items-end"></div>
  </div>
  <div
    class="grid-item flex flex-col justify-center md:mt-8 md:pb-16 lg:items-start lg:mt-36 lg:pb-0"
  >
    <Form />
  </div>
</div>

<AlertDialog bind:open={$launchError.show} error={$launchError.code}
></AlertDialog>
