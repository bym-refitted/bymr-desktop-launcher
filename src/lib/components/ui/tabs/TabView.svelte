<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import Toast from '$lib/components/Toast.svelte';
  import { Tabs } from 'bits-ui';
  import Controller from 'phosphor-svelte/lib/GameController';
  import Plugs from 'phosphor-svelte/lib/Plugs';
</script>

<div>
  <Tabs.Root orientation="vertical" value="servers" class="flex">
    <!-- Drawer -->
    <div class="flex flex-col h-full w-[380px] py-12 pl-3 pr-16">
      <h1 class="text-foreground text-center font-bold font-title text-6xl">
        BYM
        <span class="text-header">R</span>
      </h1>
      <Tabs.List class="my-12">
        <Tabs.Trigger
          value="servers"
          class="flex items-center w-full h-16 pl-6 gap-4 rounded-[7px] text-unselected bg-transparent py-2 data-[state=active]:bg-white/10 data-[state=active]:text-header"
        >
          <Controller weight="bold" size="26" />
          <h4 class="font-display">Offical Servers</h4>
        </Tabs.Trigger>
        <Tabs.Trigger
          value="local"
          class="flex items-center w-full h-16 pl-6 gap-4 rounded-[7px] text-unselected bg-transparent py-2 data-[state=active]:bg-white/10 data-[state=active]:text-header"
        >
          <Plugs weight="bold" size="26" />
          <h4 class="font-display">Local</h4>
        </Tabs.Trigger>
      </Tabs.List>
    </div>
    <!-- Tab Content -->
    <div class="flex flex-grow flex-col">
      <Navbar />
      <!-- Server Page -->
      <Tabs.Content value="servers">
        <div class="text-left">
          <h1 class="font-display text-3xl">Servers...</h1>
        </div>
      </Tabs.Content>
      <!-- Local Page -->
      <Tabs.Content value="local">
        <div class="text-left">
          <h1 class="font-display text-3xl">Local...</h1>
        </div>
      </Tabs.Content>
    </div>
  </Tabs.Root>
</div>
<div></div>
