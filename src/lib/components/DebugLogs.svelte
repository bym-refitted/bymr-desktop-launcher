<script lang="ts">
  type LogEntry = string | { class: string; msg: string };
  export let debugLogs: LogEntry[] = [];
</script>

<div class="grow rounded bg-secondary font-mono p-3">
  {#each debugLogs as log}
    {#if typeof log === 'string'}
      {#each log.split('\n') as line}
        <p><small class="font-mono">{line}</small></p>
      {/each}
    {:else}
      {#each log.msg.split('\n') as line}
        <p class={`font-mono ${log.class}`}><small>{line}</small></p>
      {/each}
    {/if}
  {/each}
</div>
