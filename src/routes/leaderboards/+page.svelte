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

  import outpostIcon from '../../assets/images/icons/outpost_cell.png';
  import resourceIcon from '../../assets/images/icons/resource_cell.png';
  import strongholdIcon from '../../assets/images/icons/stronghold_cell.png';

  interface WorldDetails {
    uuid: string;
    name: string;
    playerCount: number;
    createdAt: Date;
    lastupdateAt: Date;
    map_version: number;
  }

  interface Worlds {
    worlds: WorldDetails[];
    count: number;
  }

  interface UserLeaderboardEntry {
    username: string;
    discord_tag: string;
    pic_square: string;
    outpost_count: number;
    stronghold_count?: number;
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

  let selectedMapVersion = '2';
  let worldName = 'World';
  let worldUuid = '';

  const mapVersions: SelectItem[] = [
    { value: '2', label: 'Map Room 2' },
    { value: '3', label: 'Map Room 3' },
  ];

  let allWorlds: WorldDetails[] = [];
  $: worldNames = allWorlds
    .filter((w) => w.map_version === Number(selectedMapVersion))
    .map((w) => ({ value: w.uuid, label: w.name, playerCount: w.playerCount }));

  let leaderboardUser: UserLeaderboardEntry[] = [];
  let imageErrors = new Set<number>();

  const loadFirstWorld = (mapVersion: string) => {
    const first = allWorlds.find((w) => w.map_version === Number(mapVersion));
    if (first) {
      worldName = first.name;
      worldUuid = first.uuid;
      fetchLeaderboards(first.uuid);
    } else {
      worldName = 'World';
      worldUuid = '';
      leaderboardUser = [];
    }
  };

  onMount(async () => {
    try {
      const { data } = await invokeApiRequest<Worlds>(
        "/worlds",
        null,
        Method.GET
      );
      allWorlds = data.worlds ?? [];
      loadFirstWorld(selectedMapVersion);
    } catch (err) {
      console.error("Error fetching available worlds");
    }
  });

  const fetchLeaderboards = async (worldId: string) => {
    if (!worldId) return;

    try {
      const { data } = await invokeApiRequest<Leaderboard>(
        `/leaderboards?worldid=${worldId}&mapversion=${selectedMapVersion}`,
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
<div class="mb-16 flex justify-start items-start lg:py-16 lg:mt-[6%] lg:py-0">
  <div class="w-full lg:w-3/5 mx-4 lg:ml-[12%] lg:mr-0">
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
      <div class="flex flex-col sm:flex-row gap-4 lg:gap-2">
        <!-- Map Room version select -->
        <Select.Root
          items={mapVersions}
          selected={mapVersions.find((v) => v.value === selectedMapVersion)}
          onSelectedChange={(e) => {
            selectedMapVersion = e.value;
            loadFirstWorld(e.value);
          }}
        >
          <Select.Trigger
            class="flex items-center justify-between bg-white/10 h-10 text-left rounded-md px-6 focus:outline-none min-w-0 cursor-pointer"
            aria-label="Map Version"
          >
            <div class="flex items-center min-w-0">
              <MapTrifold size={20} weight="bold" class="text-primary mr-3 flex-shrink-0" />
              <Select.Value
                class="text-md placeholder-unselected text-unselected truncate"
                placeholder={mapVersions.find((v) => v.value === selectedMapVersion)?.label}
              />
            </div>
            <CaretDown size={16} weight="bold" class="text-unselected ml-8 flex-shrink-0" />
          </Select.Trigger>
          <Select.Content
            class="w-full rounded-xl border border-white/10 bg-background px-1 py-3 outline-none cursor-pointer"
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
            if (worldUuid) fetchLeaderboards(worldUuid);
          }}
        >
          <Select.Trigger
            class="flex items-center justify-between bg-white/10 h-10 text-left rounded-md px-6 focus:outline-none min-w-0 cursor-pointer"
            aria-label="Worlds"
          >
            <div class="flex items-center min-w-0">
              <Hexagon size={20} weight="bold" class="text-primary mr-3 flex-shrink-0" />
              <Select.Value
                class="text-md placeholder-unselected text-unselected truncate"
                placeholder={worldName}
              />
            </div>
            <CaretDown size={16} weight="bold" class="text-unselected ml-8 flex-shrink-0" />
          </Select.Trigger>
          <Select.Content
            class="w-full rounded-xl border border-white/10 bg-background px-1 py-3 outline-none cursor-pointer"
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
        <div class="hidden sm:block ml-auto">
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
      <div class="mt-4 bg-gray-800 rounded-lg overflow-hidden">
        <!-- Population -->
        <div class="px-6 py-4 border-b border-gray-700">
          <p class="font-title text-center text-white text-2xl">
            Population: <span class="text-primary font-bold">
              {worldNames.find((w) => w.value === worldUuid)?.playerCount ?? 0}
            </span>
          </p>
        </div>

        {#if leaderboardUser.length === 0}
          <div class="flex justify-center items-center py-12">
            <p class="text-muted-foreground">No leaderboard data found for this world</p>
          </div>
        {:else}
          <div class="overflow-x-auto">
            <table class="w-full min-w-[580px]">
              <thead class="bg-white/5 border-b border-gray-700">
                <tr>
                  <th class="text-left px-6 py-3">
                    <span class="font-title text-muted-foreground text-xl pl-[3.25rem]">Player</span>
                  </th>
                  {#if selectedMapVersion === '3'}
                    <th class="px-6 py-3 w-28 min-w-[7rem] align-middle"><img src={strongholdIcon} alt="Strongholds" class="w-16 h-16 mx-auto flex-shrink-0" /></th>
                    <th class="px-6 py-3 w-28 min-w-[7rem] align-middle"><img src={resourceIcon} alt="Resource Outposts" class="w-16 h-16 mx-auto flex-shrink-0" /></th>
                  {:else}
                    <th class="px-6 py-3 w-28 min-w-[7rem] align-middle"><img src={outpostIcon} alt="Outposts" class="w-16 h-16 mx-auto flex-shrink-0" /></th>
                  {/if}
                </tr>
              </thead>
              <tbody>
                {#each leaderboardUser as user, i}
                  <tr class="border-b border-gray-700/50 last:border-0 {i < 3 ? 'border-l-2 border-l-primary' : ''}">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-5">
                        <span class="font-title text-2xl w-8 text-right text-muted-foreground flex-shrink-0">{i + 1}</span>
                        {#if !imageErrors.has(i)}
                          <img
                            src={user.pic_square}
                            alt={`${user.username}'s avatar`}
                            class="w-14 h-14 rounded-md bg-gray-700 flex-shrink-0"
                            on:error={() => { 
                              imageErrors.add(i); 
                              imageErrors = imageErrors; 
                              }}
                          />
                        {:else}
                          <div class="w-14 h-14 rounded-md bg-gray-700 flex items-center justify-center flex-shrink-0">
                            <ImageBroken size={24} class="text-white/60" />
                          </div>
                        {/if}
                        <div>
                          <p class="font-display text-white text-lg lg:text-xl leading-tight">{user.username}</p>
                          <p class="text-sm text-primary">@{user.discord_tag}</p>
                        </div>
                      </div>
                    </td>
                    {#if selectedMapVersion === '3'}
                      <td class="px-6 py-4 text-center font-display text-white font-bold text-xl lg:text-2xl">{user.stronghold_count}</td>
                      <td class="px-6 py-4 text-center font-display text-white font-bold text-xl lg:text-2xl">{user.outpost_count}</td>
                    {:else}
                      <td class="px-6 py-4 text-center font-display text-white font-bold text-xl lg:text-2xl">{user.outpost_count}</td>
                    {/if}
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
