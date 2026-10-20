<script lang="ts">
  import { ToggleGroup } from "bits-ui";
  import Globe from "@lucide/svelte/icons/globe";
  import Laptop from "@lucide/svelte/icons/laptop";
  import TextField from "#lib/components/ui/TextField.svelte";
  import { Build, build } from "#lib/state/build.svelte.js";

  const options = [
    { value: Build.stable, label: "Online", icon: Globe },
    { value: Build.local, label: "Local", icon: Laptop },
  ];

  /**
   * Switches the server, ignoring the empty value a toggle group sends when its selected item is clicked again.
   *
   * @param {string} value - The value of the item that was clicked.
   */
  const select = (value: string) => {
    if (value === Build.stable || value === Build.local) build.selected = value;
  };
</script>

<div class="grid gap-1.5">
  <span class="text-[12.5px] font-medium text-muted-foreground">Server</span>
  <ToggleGroup.Root
    type="single"
    value={build.selected}
    onValueChange={select}
    class="grid h-10 grid-cols-2 gap-[3px] rounded-lg border border-border-strong bg-sunken p-[3px]"
  >
    {#each options as { value, label, icon: Icon } (value)}
      <ToggleGroup.Item
        {value}
        class="flex items-center justify-center gap-1.5 rounded-md border border-transparent text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=on]:border-border-strong data-[state=on]:bg-accent data-[state=on]:text-foreground data-[state=on]:shadow-sm data-[state=on]:[&_svg]:text-primary"
      >
        <Icon class="size-3.5" />{label}
      </ToggleGroup.Item>
    {/each}
  </ToggleGroup.Root>
</div>

{#if build.selected === Build.local}
  <div class="grid grid-cols-[1fr_96px] gap-2.5">
    <TextField label="Host" bind:value={build.host} placeholder="localhost" />
    <TextField label="Port" type="number" min="1" max="65535" bind:value={build.port} placeholder="3001" />
  </div>
{/if}
