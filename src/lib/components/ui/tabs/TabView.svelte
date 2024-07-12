<script lang="ts">
  import Form from "$lib/components/Form.svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import { Tabs } from "bits-ui";
  import Controller from "phosphor-svelte/lib/GameController";
  import Plugs from "phosphor-svelte/lib/Plugs";
</script>

<div>
  <Tabs.Root orientation="vertical" value="servers" class="flex">
    <!-- Drawer -->
    <div class="flex flex-col h-screen w-[380px] py-12 pl-3 pr-16">
      <h1 class="text-foreground text-center font-bold font-title text-6xl">
        BYM<span class="text-primary">R</span>
      </h1>
      <Tabs.List class="my-12">
        <Tabs.Trigger
          value="servers"
          class="flex items-center w-full h-16 pl-6 gap-4 rounded-md text-unselected bg-transparent py-2 data-[state=active]:bg-white/10 data-[state=active]:text-primary"
        >
          <Controller weight="bold" size="26" />
          <h4 class="font-display">Refitted Servers</h4>
        </Tabs.Trigger>
        <Tabs.Trigger
          value="local"
          class="flex items-center w-full h-16 pl-6 gap-4 rounded-md text-unselected bg-transparent py-2 data-[state=active]:bg-white/10 data-[state=active]:text-primary"
        >
          <Plugs weight="bold" size="26" />
          <h4 class="font-display">Local</h4>
        </Tabs.Trigger>
      </Tabs.List>
    </div>
    <!-- Tab Content -->
    <div class="w-full flex flex-col">
      <Navbar />
      <Tabs.Content value="servers">
        <div
          class="grid grid-cols-1 gap-x-8 minWindowSize:grid-cols-2"
          style="grid-template-rows: 800px;"
        >
          <div class="grid-item flex flex-col justify-center p-16">
            <h1 class="text-4xl font-display py-4">
              Official Refitted Servers:
            </h1>
            <p class="text-md font-medium text-muted-foreground">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </div>
          <div class="grid-item flex flex-col justify-center mt-36">
            <Form />
          </div>
        </div>
      </Tabs.Content>
      <Tabs.Content value="local">
        <div class="text-left">
          <h1 class="font-display text-3xl">Local...</h1>
        </div>
      </Tabs.Content>
    </div>
  </Tabs.Root>
</div>
