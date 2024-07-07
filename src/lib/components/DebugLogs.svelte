<script lang="ts">
  import { debugLogs } from '$lib/stores/debugLogStore';
</script>

<div class="grow rounded bg-secondary font-mono p-3">
  {#each $debugLogs as log}
    {#each log.msg.split('\n') as line}
      <p class={`font-mono ${log.class}`}><small>{line}</small></p>
    {/each}
  {/each}
</div>
