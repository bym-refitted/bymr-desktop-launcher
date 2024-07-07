<script lang="ts">
  import { latestLog, platform } from '$lib/stores/debugLogStore';
  import DebugLogs from './DebugLogs.svelte';
  export let launcherVersion = '';
  let viewLogs = false;
  const toggleLogs = () => {
    viewLogs = !viewLogs;
  };
</script>

{#if viewLogs}
  <DebugLogs />
{/if}
<footer class="bg-black px-4 py-1 flex-none flex bg-opacity-25 mt-2 justify-between relative">
  <div class="flex space-x-2">
    {#if typeof $latestLog === 'string'}
      <p class="inline-block"><small class="font-mono">{latestLog}</small></p>
    {:else if $latestLog !== null}
      <p class={`font-mono ${$latestLog.class}`}><small>{$latestLog.msg}</small></p>
    {/if}
    <small><button on:click={toggleLogs}>{viewLogs ? 'Hide' : 'View'} logs</button></small>
  </div>
  <p><small>{$platform?.msg} | v{launcherVersion}</small></p>
</footer>
