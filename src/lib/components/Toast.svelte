<script lang="ts">
  import { hasErrors } from "$lib/stores/debugLogStore";
  import { hasLoaded } from "$lib/stores/loadState";
  import { Plug, XCircle, SealCheck } from "phosphor-svelte";
  import DebugLogs from "./DebugLogs.svelte";

  export let launcherVersion = "";
  let viewLogs = false;
  const toggleLogs = () => (viewLogs = !viewLogs);
</script>

{#if viewLogs}
  <DebugLogs {launcherVersion} />
{/if}
<div
  role="button"
  class="absolute bottom-10 right-10 z-30 lg:w-full max-w-[280px] rounded-[12px] border border-dark-10 bg-background p-4"
  on:click={toggleLogs}
  on:keydown={toggleLogs}
  tabindex="0"
>
  <div class="flex items-center">
    <div
      class="flex size-12 items-center justify-center rounded-full bg-muted lg:mr-3"
    >
      {#if !$hasLoaded}
        <Plug size={26} color="orange" weight="bold" />
      {:else if $hasErrors}
        <XCircle size={26} color="red" weight="bold" />
      {:else}
        <SealCheck size={26} color="green" weight="bold" />
      {/if}
    </div>
    <div class="flex flex-col hidden lg:block">
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
