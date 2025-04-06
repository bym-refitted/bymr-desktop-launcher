<script lang="ts">
  import { SketchLogo } from "phosphor-svelte";

  import { Tooltip } from "bits-ui";
  import type { Component } from "svelte";
  import type { IconComponentProps } from "phosphor-svelte/lib/shared";

  export let url = "";
  export let Icon: Component<IconComponentProps> = SketchLogo;
  export let tooltipText = "";
  export let side: "top" | "bottom" | "left" | "right" = "bottom";
  export let style = "text-primary hover:text-white";
  export let tipColor = "bg-primary";
  export let error = false;
</script>

<Tooltip.Root openDelay={0}>
  <Tooltip.Trigger>
    <a href={url} target="_tauri">
      <svelte:component this={Icon} weight="bold" size="30" class={style} />
    </a>
  </Tooltip.Trigger>
  <Tooltip.Content
    transitionConfig={{ y: 8, duration: 150 }}
    {side}
    sideOffset={8}
  >
    <div class={tipColor}>
      <Tooltip.Arrow class="rounded-[2px]" />
    </div>
    <div
      class={`flex items-center ${error ? "w-[200px] pl-4" : ""} justify-center rounded-input bg-white/10 rounded-md p-3 text-sm font-medium outline-none`}
    >
      {tooltipText}
    </div>
  </Tooltip.Content>
</Tooltip.Root>
