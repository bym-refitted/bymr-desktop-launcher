<script lang="ts">
  import { launchError } from "$lib/stores/launchStore";
  import AlertDialog from "$lib/components/AlertDialog.svelte";
  import Form from "$lib/components/ui/form/Form.svelte";
  import TownHall from "../assets/images/townhall.png";
  import { WarningDiamond } from "phosphor-svelte";
</script>

<div
  class="grid grid-cols-1 [@media(min-width:1500px)]:grid-cols-2 gap-x-8 px-6 py-12"
>
  <!-- Left Column -->
  <div
    class="flex flex-col justify-start [@media(min-width:1500px)]:p-16 [@media(min-width:1500px)]:pr-32"
  >
    <img src={TownHall} alt="townhall" width="150" />
    <div class="py-6">
      <h1 class="font-title leading-snug text-5xl whitespace-nowrap">
        Backyard Monsters Refitted
      </h1>
      <div class="text-md font-medium text-muted-foreground pt-4">
        <div class="mb-6">
          The official Backyard Monsters Refitted server. A 1:1 preservation of
          the original Adobe Flash game, with the adoption of Map Room 2. All
          buildings, monsters and gameplay mechanics on this server are from the
          classic vanilla version of the game. Just how you remember it! Join us
          now and relive the nostalgia.
        </div>
        <div class="mb-6">
          <div class="text-primary font-bold mb-2">Rules:</div>
          This server has strict monitoring for cheating to ensure a fair and enjoyable
          experience for all players. Any form of cheating or exploits will result
          in a permanent ban.
        </div>
        <div class="mb-6">
          <div class="text-primary font-bold mb-2">
            Verified Discord account:
          </div>
          Requires a verified Discord account to play on the server. Visit our discord
          to verify your account in the<code>#claim-account</code> channel.
        </div>
      </div>
    </div>
  </div>

  <!-- Right Column -->
  <div
    class="flex flex-col items-start [@media(min-width:1500px)]:mt-24 [@media(min-width:1500px)]:pb-0 [@media(min-width:1500px)]:justify-center"
  >
    <Form />
  </div>
</div>

<AlertDialog
  bind:open={$launchError.show}
  error={$launchError.code}
  Icon={WarningDiamond}
/>
