<script lang="ts">
  import { Tooltip } from "bits-ui";
  import SketchLogo from "phosphor-svelte/lib/SketchLogo";
  import type { IconProps, SvelteComponent } from "phosphor-svelte/lib/shared";

  export let url = "";
  export let Icon: typeof SvelteComponent<IconProps> = SketchLogo;
  export let tooltipText = "";
</script>

<Tooltip.Root openDelay={0}>
  <Tooltip.Trigger>
    <a href={url} target="_tauri">
      <Icon weight="bold" class="text-primary hover:text-white" size="30" />
    </a>
  </Tooltip.Trigger>
  <Tooltip.Content transitionConfig={{ y: 8, duration: 150 }} sideOffset={8}>
    <div class="bg-primary">
      <Tooltip.Arrow class="rounded-[2px]" />
    </div>
    <div
      class="flex items-center justify-center rounded-input bg-white/10 rounded-md p-3 text-sm font-medium outline-none"
    >
      {tooltipText}
    </div>
  </Tooltip.Content>
</Tooltip.Root>
