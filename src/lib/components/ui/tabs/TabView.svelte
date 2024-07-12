<script lang="ts">
  import Form from "$lib/components/Form.svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import { Tabs } from "bits-ui";
  import Controller from "phosphor-svelte/lib/GameController";
  import Plugs from "phosphor-svelte/lib/Plugs";
  import TownHall from "../../../../assets/images/townhall.png";
  import SniperTower from "../../../../assets/images/snipertower.png";
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
          <div class="grid-item flex flex-col justify-center p-16 bg-red minWindowSize:p-0">
            <img src={TownHall} alt="townhall" width="150" />
            <div class="py-6">
              <h1 class="text-4xl font-display">Official Refitted Servers:</h1>
              <p class="text-md font-medium text-muted-foreground pt-4">
                The official Backyard Monsters Refitted servers. A 1:1
                preservation of the original Adobe Flash game, with the adoption
                of Map Room 2. All buildings, monsters and gameplay mechanics on
                this server are from the classic vanilla version of the game.
                Just how you remember it! Join us now and relive the nostalgia.
                <br />
                <br />
                <b class="text-primary">Rules:</b> This server has strict cheating
                rules to ensure a fair gameplay experience for all players.
              </p>
            </div>
            <div class="flex flex-col items-end">
            </div>
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
