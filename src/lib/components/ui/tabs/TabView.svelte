<script lang="ts">
  import { Play, Ranking, Sword, Terminal } from "phosphor-svelte";
  import { Menubar } from "bits-ui";
  import TabItem from "./TabItem.svelte";
  import { platform } from "@tauri-apps/plugin-os";
  import { Platform } from "$lib/enums";
  import { onMount } from "svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  
  const isMobile = platform() === Platform.Android;
  
  const navItems = [
    { path: "/", Icon: Play, label: "Play" },
    { path: "/minigame", Icon: Sword, label: "Minigame" },
    { path: "/leaderboards", Icon: Ranking, label: "Ranks" },
    { path: "/logs", Icon: Terminal, label: "Logs" },
  ];
  
  let currentPath = "/";
  
  onMount(() => {
    currentPath = window.location.pathname;
    
    // Update on navigation
    const updatePath = () => {
      currentPath = window.location.pathname;
    };
    
    window.addEventListener("popstate", updatePath);
    
    return () => {
      window.removeEventListener("popstate", updatePath);
    };
  });
</script>

<div class="flex {isMobile ? 'flex-col h-screen' : ''}">
  <!-- Desktop Sidebar -->
  {#if !isMobile}
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
      </div>
    </Menubar.Root>
  {:else}
    <!-- Mobile Header -->
    <div class="flex items-center justify-between px-4 pt-16 pb-4">
      <a href="/">
        <h1 class="text-foreground font-bold font-title text-3xl">
          BYM<span class="text-primary">R</span>
        </h1>
      </a>
      <!-- Social Icons on Mobile -->
      <Navbar />
    </div>
  {/if}

  <!-- Content Area -->
  <div class="flex-1 flex flex-col w-full">
    <slot />
  </div>

  <!-- Mobile Bottom Navigation - Floating Pill Style -->
  {#if isMobile}
    <div class="absolute bottom-0 left-0 right-0 p-4 pb-8 pointer-events-none z-50">
      <nav class="bg-background backdrop-blur-lg border border-white/10 rounded-2xl shadow-lg mx-auto max-w-md pointer-events-auto">
        <div class="flex justify-around items-center h-16 px-2">
          {#each navItems as { path, Icon, label }}
            {@const isActive = currentPath === path}
            <a
              href={path}
              class="flex items-center justify-center flex-1 h-full transition-colors duration-200"
              on:click={() => currentPath = path}
            >
              <Icon size={28} weight={isActive ? 'fill' : 'regular'} class={isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'} />
            </a>
          {/each}
        </div>
      </nav>
    </div>
  {/if}
</div>
