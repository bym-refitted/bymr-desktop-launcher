<script lang="ts">
  import { launchError, launchSwf } from "$lib/stores/launchStore";
  import AlertDialog from "$lib/components/AlertDialog.svelte";
  import TownHall from "../../assets/images/pokey.png";
  import PrimaryButton from "$lib/components/ui/button/PrimaryButton.svelte";
  import { WarningDiamond } from "phosphor-svelte";
  import { fly } from "svelte/transition";
  import { platform } from "@tauri-apps/plugin-os";
  import { Platform } from "$lib/enums";
  
  const isMobile = platform() === Platform.Android;
</script>

<div class="grid grid-cols-1 gap-x-8 lg:grid-cols-2 lg:grid-rows-[800px] {isMobile ? 'px-6 pt-8 pb-32' : ''}">
  <div 
    class="grid-item flex flex-col lg:p-16 lg:justify-center"
    in:fly={{ y: 30, duration: 600, delay: 100 }}
  >
    <img src={TownHall} alt="townhall" width="200" />
    <div class="py-6">
      <h1 class="font-title leading-snug {isMobile ? 'text-4xl' : 'text-6xl'}">Attack of the Pokies:</h1>
      <p class="text-md font-medium text-muted-foreground pt-4">
        The original minigame for Backyard Monsters, which could only be seen
        when the game was under maintenance.
        <br />
        <br />
        <b class="text-primary">How to Play: </b> Guide the worker to the
        mushrooms while avoiding Pokies! For every 20 mushrooms you collect, a
        golden mushroom power-up will appear. Eat it to become invincible and
        kill Pokies by smashing them with your body for a short amount of time.
        Can you get the score to 0?
      </p>
      <div class="mt-6">
        <PrimaryButton
          on:click={() => { launchSwf("pokies") }}
          buttonText="Play Now"
          width="w-40"
          color="bg-secondary"
        />
      </div>
    </div>
  </div>
</div>

<AlertDialog
  bind:open={$launchError.show}
  error={$launchError.code}
  Icon={WarningDiamond}
></AlertDialog>
