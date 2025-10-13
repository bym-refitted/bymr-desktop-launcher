<script lang="ts">
  import { Select, Tooltip } from "bits-ui";
  import { flyAndScale } from "$lib/utils";
  import { invokeApiRequest } from "$lib/utils/invokeApiRequest";
  import { Method } from "$lib/enums/Method";
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import {
    CaretDown,
    Hexagon,
    ImageBroken,
    MapTrifold,
    ChartBar,
  } from "phosphor-svelte";
  import { platform } from "@tauri-apps/plugin-os";
  import { Platform } from "$lib/enums";
  
  const isMobile = platform() === Platform.Android;

  interface WorldDetails {
    uuid: string;
    name: string;
    playerCount: number;
    createdAt: Date;
    lastupdateAt: Date;
  }

  interface Worlds {
    worlds: WorldDetails[];
    count: number;
  }

  interface UserLeaderboardEntry {
    username: string;
    discord_tag: string;
    outpost_count: number;
  }

  interface Leaderboard {
    leaderboard: UserLeaderboardEntry[];
    total: number;
  }

  interface SelectItem {
    value: string;
    label: string;
    playerCount?: number;
  }

  $: mapVersion = "Map Version";
  $: worldName = "World";
  $: worldUuid = "";

  const mapVersions: SelectItem[] = [
    { value: "Map Room 2", label: "Map Room 2" },
  ];
  const worldNames: SelectItem[] = [];

  let leaderboardUser: UserLeaderboardEntry[] = [];
  let imageError = false;

  onMount(async () => {
    try {
      // Fetch available worlds
      const { data } = await invokeApiRequest<Worlds>(
        "/worlds",
        null,
        Method.GET
      );

      if (data.worlds && data.worlds.length > 0) {
        // Sort worlds by createdAt timestamp (oldest first)
        const sortedWorlds = [...data.worlds].sort((a, b) => {
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });

        // Populate world names array with sorted worlds
        sortedWorlds.forEach((world: WorldDetails) => {
          worldNames.push({
            value: world.uuid,
            label: world.name,
            playerCount: world.playerCount,
          });
        });

        // Select the first (oldest) world
        const oldestWorld = sortedWorlds[0];
        worldName = oldestWorld.name;
        worldUuid = oldestWorld.uuid;

        // Fetch leaderboards for the first world
        fetchLeaderboards(oldestWorld.uuid);
      }
    } catch (err) {
      console.error("Error fetching available worlds");
    }
  });

  const fetchLeaderboards = async (worldId: string) => {
    if (!worldId) return;

    try {
      const { data } = await invokeApiRequest<Leaderboard>(
        `/leaderboards?worldid=${worldId}`,
        null,
        Method.GET
      );

      leaderboardUser = data.leaderboard;
    } catch (err) {
      console.error("Error fetching leaderboard data:", err);
    }
  };
</script>

<svelte:head>
  <title>Leaderboards</title>
</svelte:head>

<!-- Main Container -->
<div class="flex justify-start items-start lg:py-16 lg:mt-[6%] lg:py-0 {isMobile ? 'px-6 pt-8 pb-32' : 'mb-16'}">
  <div class="w-full lg:w-3/5 {isMobile ? '' : 'mx-4 lg:ml-[12%] lg:mr-0'}">
    <!-- Header Section -->
    <div 
      class="flex flex-col items-center text-muted-foreground"
      in:fly={{ y: 30, duration: 600, delay: 100 }}
    >
      <h1
        class="text-white font-title leading-snug pt-12 text-5xl lg:text-7xl lg:pt-0"
      >
        Leaderboards
      </h1>
      <p class="text-center pt-4">
        An overview of the leaderboard players.<br />Servers are named based on
        the player who occupies hex 0x0 on the given world.
      </p>
    </div>

    <div 
      id="leaderboard" 
      class="mt-16"
      in:fly={{ y: 30, duration: 600, delay: 200 }}
    >
      <div class="flex flex-col gap-4 lg:gap-2 lg:flex-row">
        <!-- Map Room version select -->
        <Select.Root
          items={mapVersions}
          selected={{ value: mapVersion, label: mapVersion }}
          onSelectedChange={(e) => {
            mapVersion = e.label;
          }}
        >
          <Select.Trigger
            class="focus:outline-secondary flex items-center justify-between bg-white/10 h-10 text-left rounded-md px-6 focus:outline-none focus:bg-transparent focus:text-white min-w-0"
            aria-label="Map Version"
          >
            <div class="flex items-center min-w-0">
              <MapTrifold size={20} weight="bold" class="text-primary mr-3 flex-shrink-0" />
              <Select.Value
                class="text-md placeholder-unselected text-unselected truncate"
              />
            </div>
            <CaretDown size={16} weight="bold" class="text-unselected ml-2 flex-shrink-0" />
          </Select.Trigger>
          <Select.Content
            class="w-full rounded-xl border border-white/10 bg-background px-1 py-3 outline-none"
            transition={flyAndScale}
            sideOffset={8}
          >
            {#each mapVersions as versions}
              <Select.Item
                class="data-[highlighted]:bg-secondary flex h-10 w-full select-none items-center rounded-button py-3 pl-5 pr-1.5 text-sm outline-none transition-all duration-75"
                value={versions.value}
                label={versions.label}
              >
                {versions.label}
                <Select.ItemIndicator class="ml-auto" asChild={false}
                ></Select.ItemIndicator>
              </Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>

        <!-- Worlds select -->
        <Select.Root
          items={worldNames}
          selected={{ value: worldUuid, label: worldName }}
          onSelectedChange={(e) => {
            worldName = e.label;
            worldUuid = e.value;

            if (worldUuid) {
              fetchLeaderboards(worldUuid);
            }
          }}
        >
          <Select.Trigger
            class="focus:outline-secondary flex items-center justify-between bg-white/10 h-10 text-left rounded-md px-6 focus:outline-none focus:bg-transparent focus:text-white min-w-0"
            aria-label="Worlds"
          >
            <div class="flex items-center min-w-0">
              <Hexagon size={20} weight="bold" class="text-primary mr-3 flex-shrink-0" />
              <Select.Value
                class="text-md placeholder-unselected text-unselected truncate"
                placeholder={worldName}
              />
            </div>
            <CaretDown size={16} weight="bold" class="text-unselected ml-2 flex-shrink-0" />
          </Select.Trigger>
          <Select.Content
            class="w-full rounded-xl border border-white/10 bg-background px-1 py-3 outline-none"
            transition={flyAndScale}
            sideOffset={8}
          >
            {#each worldNames as world}
              <Select.Item
                class="data-[highlighted]:bg-secondary flex h-10 w-full select-none items-center rounded-button py-3 pl-5 pr-1.5 text-sm outline-none transition-all duration-75"
                value={world.value}
                label={world.label}
              >
                {world.label}
                <Select.ItemIndicator class="ml-auto" asChild={false}
                ></Select.ItemIndicator>
              </Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>

        <!-- Tooltip -->
        <div class="hidden lg:block ml-auto">
          <Tooltip.Root openDelay={0}>
            <Tooltip.Trigger>
              <div
                class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/30 transition-all"
              >
                <ChartBar size={20} weight="bold" class="text-primary" />
              </div>
            </Tooltip.Trigger>
            <Tooltip.Content side="top" sideOffset={5}>
              <div class="">
                <Tooltip.Arrow class="rounded-[2px]" />
              </div>
              <div
                class="flex items-center justify-center rounded-input bg-white/10 rounded-md p-3 text-sm font-medium outline-none"
              >
                Leaderboards are updated every 2 hours
              </div>
            </Tooltip.Content>
          </Tooltip.Root>
        </div>
      </div>

      <!-- Leaderboard -->
      <div class="grid grid-cols-1 mt-4">
        <div
          class="h-full bg-gray-800 p-5 relative flex flex-col overflow-hidden rounded-lg"
        >
          <h2 class="font-title text-center text-white text-2xl">
            Population: <span class="text-primary font-bold">
              {#if worldUuid && worldNames.length > 0}
                {worldNames.find((world) => world.value === worldUuid)
                  ?.playerCount || 0}
              {:else}
                0
              {/if}
            </span>
          </h2>
          <!-- Header -->
          <div
            class="flex flex-row items-center justify-between bg-white/5 rounded-full px-8 py-2 my-4"
          >
            <div class="flex flex-row items-center">
              <h3 class="font-title text-muted-foreground text-2xl">User</h3>
            </div>
            <div class="flex flex-row items-center">
              <h3 class="font-title text-muted-foreground text-2xl">
                Outposts
              </h3>
            </div>
          </div>
          {#if leaderboardUser.length === 0}
            <div class="flex justify-center items-center py-8">
              <p class="text-muted-foreground">
                No leaderboard data found for this world
              </p>
            </div>
          {:else}
            {#each leaderboardUser as user}
              <!-- User Card -->
              <div
                class="flex flex-row items-center justify-between border-b-2 border-gray-700 pb-4 my-4"
              >
                <div class="flex flex-row items-center">
                  {#if !imageError}
                    <img
                      src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user.username}&size=50`}
                      alt={`${user.username}'s avatar`}
                      class="w-50 h-50 rounded-[4px] mr-3 bg-gray-700"
                      on:error={() => (imageError = true)}
                    />
                  {:else}
                    <div
                      class="w-50 h-50 rounded-full mr-3 flex items-center justify-center bg-gray-700"
                    >
                      <ImageBroken size={50} class="text-white/60" />
                    </div>
                  {/if}
                  <div class="flex flex-col">
                    <h2
                      class="font-display text-1xl text-white tracking-wide lg:text-2xl"
                    >
                      {user.username}
                    </h2>
                    <p class="text-sm text-primary">@{user.discord_tag}</p>
                  </div>
                </div>
                <h1
                  class="font-display text-white text-1xl font-bold pr-4 tracking-widest lg:pr-12 lg:text-2xl"
                >
                  {user.outpost_count}
                </h1>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
