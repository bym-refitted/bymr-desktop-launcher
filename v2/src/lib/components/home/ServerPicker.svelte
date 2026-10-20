<script lang="ts">
  import Globe from "@lucide/svelte/icons/globe";
  import Server from "@lucide/svelte/icons/server";
  import Segmented from "#lib/components/ui/Segmented.svelte";
  import { Build, build } from "#lib/state/build.svelte.js";

  const options = [
    { value: Build.stable, label: "Online", icon: Globe },
    { value: Build.local, label: "Custom", icon: Server },
  ];
</script>

<div class="grid gap-1.5">
  <span class="text-[12.5px] font-medium text-muted-foreground">Server</span>
  <Segmented {options} bind:value={build.selected} />
</div>
