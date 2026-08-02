<script lang="ts">
  import { Play, Ranking, Sword, Shield, UserCircle } from "phosphor-svelte";
  import { Menubar } from "bits-ui";
  import TabItem from "./TabItem.svelte";
  import { user } from "$lib/stores/userStore";
</script>

<div class="flex">
  <Menubar.Root class="flex flex-col h-screen py-12 pl-3 pr-16 w-[380px]">
    <div class="flex-1">
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
        {#if $user.token}
          <TabItem path="/attacklogs" Icon={Shield} text="Attack Logs" />
        {/if}
      </div>
    </div>

    <!-- Identity sits apart from the content tabs, and doubles as the only
         indication of which account a remembered session is signed in as. -->
    {#if $user.token}
      <div class="border-t border-white/10 pt-2">
        <TabItem
          path="/account"
          Icon={UserCircle}
          text={$user.username || "Account"}
        />
      </div>
    {/if}</Menubar.Root
  >
  <div class="w-full flex flex-col">
    <slot />
  </div>
</div>
