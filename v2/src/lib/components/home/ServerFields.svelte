<script lang="ts">
  import Globe from "@lucide/svelte/icons/globe";
  import Laptop from "@lucide/svelte/icons/laptop";
  import Segmented from "#lib/components/ui/Segmented.svelte";
  import TextField from "#lib/components/ui/TextField.svelte";
  import { Build, build } from "#lib/state/build.svelte.js";

  const options = [
    { value: Build.stable, label: "Online", icon: Globe },
    { value: Build.local, label: "Local", icon: Laptop },
  ];
</script>

<div class="grid gap-1.5">
  <span class="text-[12.5px] font-medium text-muted-foreground">Server</span>
  <Segmented {options} bind:value={build.selected} />
</div>

{#if build.selected === Build.local}
  <div class="grid grid-cols-[1fr_96px] gap-2.5">
    <TextField label="Host" bind:value={build.host} placeholder="localhost" />
    <TextField label="Port" type="number" min="1" max="65535" bind:value={build.port} placeholder="3001" />
  </div>
{/if}
