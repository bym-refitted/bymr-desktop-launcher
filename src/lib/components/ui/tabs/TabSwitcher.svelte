<script lang="ts">
  import { Tabs } from 'bits-ui';
  export let tabs: { label: string; content: string }[] = [];
</script>

<Tabs.Root class="flex flex-col border border-gray-300 rounded-lg overflow-hidden">
  <Tabs.List class="flex list-none m-0 p-0 bg-gray-100">
    {#each tabs as { label }}
      <Tabs.Trigger
        class="flex-1 px-4 py-2 cursor-pointer text-center bg-gray-100 border-b border-gray-300 focus:outline-none hover:bg-gray-200"
        value={label}
      >
        {label}
      </Tabs.Trigger>
    {/each}
  </Tabs.List>
  {#each tabs as { content }}
    <Tabs.Content class="p-4 border-t border-gray-300" value={content}>
      <div>{content}</div>
    </Tabs.Content>
  {/each}
</Tabs.Root>
