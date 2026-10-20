<script lang="ts">
  import Cloud from "@lucide/svelte/icons/cloud";
  import Server from "@lucide/svelte/icons/server";
  import Segmented from "#lib/components/ui/Segmented.svelte";
  import { Build, build } from "#lib/state/build.svelte.js";

  const options = [
    { value: Build.stable, label: "Online", icon: Cloud },
    { value: Build.local, label: "Custom", icon: Server },
  ];
</script>

<div class="grid gap-1.5">
  <span class="text-[12.5px] font-medium text-muted-foreground">Server</span>
  <Segmented {options} bind:value={build.selected} />
</div>
