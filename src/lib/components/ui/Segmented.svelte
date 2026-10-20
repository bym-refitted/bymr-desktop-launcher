<script lang="ts" generics="T extends string">
  import { ToggleGroup } from "bits-ui";
  import type { LucideIcon } from "@lucide/svelte";

  interface Option {
    value: T;
    label: string;
    icon?: LucideIcon;
  }

  interface Props {
    options: Option[];
    value: T;
  }

  let { options, value = $bindable() }: Props = $props();

  /**
   * Selects the clicked option, ignoring the empty value a toggle group sends when its selected item is clicked again.
   *
   * @param {string} next - The value of the item that was clicked.
   */
  const select = (next: string) => {
    const option = options.find((candidate) => candidate.value === next);

    if (option) value = option.value;
  };
</script>

<ToggleGroup.Root
  type="single"
  {value}
  onValueChange={select}
  class="grid h-10 auto-cols-fr grid-flow-col gap-[3px] rounded-lg border border-border-strong bg-sunken p-[3px]"
>
  {#each options as option (option.value)}
    <ToggleGroup.Item
      value={option.value}
      class="flex items-center justify-center gap-1.5 rounded-md border border-transparent text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=on]:border-border-strong data-[state=on]:bg-accent data-[state=on]:text-foreground data-[state=on]:shadow-sm data-[state=on]:[&_svg]:text-primary"
    >
      {#if option.icon}<option.icon class="size-3.5" />{/if}{option.label}
    </ToggleGroup.Item>
  {/each}
</ToggleGroup.Root>
