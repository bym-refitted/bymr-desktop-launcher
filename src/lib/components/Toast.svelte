<script lang="ts">
  import { hasErrors, latestLog, platform } from "$lib/stores/debugLogStore";
  import { hasLoaded } from "$lib/stores/loadState";
  import DebugLogs from "./DebugLogs.svelte";
  import SealCheck from "phosphor-svelte/lib/SealCheck";
  import XCircle from "phosphor-svelte/lib/XCircle";
  import Plug from "phosphor-svelte/lib/Plug";

  export let launcherVersion = "";
  let viewLogs = false;
  const toggleLogs = () => (viewLogs = !viewLogs);
</script>

{#if viewLogs}
  <DebugLogs {launcherVersion} />
{/if}
<div
  role="button"
  class="absolute bottom-10 right-10 z-30 w-full max-w-[328px] rounded-[12px] border border-dark-10 bg-background p-4 shadow-popover"
  on:click={toggleLogs}
  on:keydown={toggleLogs}
  tabindex="0"
>
  <div class="flex items-center">
    <div
      class="mr-3 flex size-12 items-center justify-center rounded-full bg-muted"
    >
      {#if !$hasLoaded}
        <Plug size={26} color="orange" weight="bold" />
      {:else if $hasErrors}
        <XCircle size={26} color="red" weight="bold" />
      {:else}
        <SealCheck size={26} color="green" weight="bold" />
      {/if}
    </div>
    <div class="flex flex-col">
      <h4 class="text-[17px] font-display leading-5 tracking-[-0.01em]">
        {#if !$hasLoaded}
          Connecting
        {:else if $hasErrors}
          Launcher Failed
        {:else}
          Connected
        {/if}
      </h4>
      <p class="text-sm font-medium text-muted-foreground">
        {#if !$hasLoaded}
          Housing the pokeys...
        {:else if $hasErrors}
          Click to view logs
        {:else}
          You're all set!
        {/if}
      </p>
    </div>
  </div>
</div>
