<script lang="ts">
  import { Play, Ranking, Sword } from "phosphor-svelte";
  import { Menubar } from "bits-ui";
  import TabItem from "./TabItem.svelte";
</script>

<div class="flex">
  <Menubar.Root class="flex flex-col h-screen py-12 pl-3 pr-16 w-[380px]">
    <div>
      <a href="/">
        <h1
          class="text-foreground text-center font-bold font-title text-6xl my-4"
        >
          BYM<span class="text-primary">R</span>
        </h1>
      </a>
      <div class="pt-8">
        <TabItem path="/" Icon={Play} text="BYM Refitted" />
        <TabItem
          path="/minigame"
          Icon={Sword}
          text="Attack of the Pokies"
        />
        <TabItem path="/leaderboards" Icon={Ranking} text="Leaderboards" />
      </div>
    </div></Menubar.Root
  >
  <div class="w-full flex flex-col">
    <slot />
  </div>
</div>
