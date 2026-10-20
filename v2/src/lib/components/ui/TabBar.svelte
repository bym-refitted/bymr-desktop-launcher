<script lang="ts" generics="T extends string">
  import { Tabs } from "bits-ui";

  interface Option {
    value: T;
    label: string;
    count?: number;
  }

  interface Props {
    options: Option[];
    value: T;
    class?: string;
  }

  let { options, value = $bindable(), class: className }: Props = $props();

  /**
   * Selects the clicked tab.
   *
   * @param {string} next - The value of the tab that was clicked.
   */
  const select = (next: string) => {
    const option = options.find((candidate) => candidate.value === next);

    if (option) value = option.value;
  };
</script>

<Tabs.Root {value} onValueChange={select}>
  <Tabs.List class="flex gap-6 {className}">
    {#each options as option (option.value)}
      <Tabs.Trigger
        value={option.value}
        class="-mb-px border-b-2 border-transparent text-[13.5px] font-semibold text-muted-foreground transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
      >
        {option.label}
        {#if option.count}
          <span class="ml-1.5 rounded-full bg-primary px-1.5 py-px text-[11px] font-semibold text-primary-foreground tabular-nums">
            {option.count}
          </span>
        {/if}
      </Tabs.Trigger>
    {/each}
  </Tabs.List>
</Tabs.Root>
