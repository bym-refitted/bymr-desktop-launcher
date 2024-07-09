<script lang="ts">
  import { hasErrors, latestLog, platform } from '$lib/stores/debugLogStore';
  import { hasLoaded } from '$lib/stores/loadState';
  import DebugLogs from './DebugLogs.svelte';
  import SealCheck from 'phosphor-svelte/lib/SealCheck';
  import XCircle from 'phosphor-svelte/lib/XCircle';
  import Plug from 'phosphor-svelte/lib/Plug';

  export let launcherVersion = '';
  let viewLogs = false;
  const toggleLogs = () => {
    viewLogs = !viewLogs;
  };
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
    <div class="mr-3 flex size-12 items-center justify-center rounded-full bg-muted">
      {#if !$hasLoaded}
        <Plug weight="bold" size={26} color="orange" />
      {:else if $hasErrors}
        <XCircle weight="bold" size={26} color="red" />
      {:else}
        <SealCheck weight="bold" size={26} color="green" />
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
          Herding Zafreetis back into their pens...
        {:else if $hasErrors}
          Click to view logs
        {:else}
          You're all set!
        {/if}
      </p>
    </div>
  </div>
</div>

<!-- {#if viewLogs}
<DebugLogs />
{/if}
<footer class="bg-black px-4 py-1 flex-none flex bg-opacity-25 justify-between relative">
  <div class="flex space-x-2">
    {#if typeof $latestLog === 'string'}
    <p class="inline-block"><small class="font-mono">{latestLog}</small></p>
    {:else if $latestLog !== null}
    <p class={`font-mono ${$latestLog.class}`}><small>{$latestLog.msg}</small></p>
    {/if}
    <small><button on:click={toggleLogs}>{viewLogs ? 'Hide' : 'View'} logs</button></small>
    </div>
    <p><small>{$platform?.msg} | v{launcherVersion}</small></p>
    </footer> -->
