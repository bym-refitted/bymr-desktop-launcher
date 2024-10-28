<script lang="ts">
  import { debugLogs } from "$lib/stores/debugLogStore";
  export let launcherVersion = "";
</script>

<div
  class="absolute bottom-0 w-full py-12 px-8 rounded bg-accent font-mono p-3"
>
  <h1 class="text-2xl font-display">Launcher version: <span class="text-primary">v{launcherVersion}</span></h1>
  <div class="mt-8">
    {#each $debugLogs as log}
      {#each log.msg.split("\n") as line}
        <p class={`text-[20px] font-medium ${log.class}`}>
          <small>{line}</small>
        </p>
      {/each}
    {/each}
  </div>
</div>
