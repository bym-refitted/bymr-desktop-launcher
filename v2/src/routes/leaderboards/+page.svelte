<script lang="ts">
  import { onMount } from "svelte";
  import Clock from "@lucide/svelte/icons/clock";
  import Users from "@lucide/svelte/icons/users";
  import { toErrorMessage } from "#lib/api/errors.js";
  import { getLeaderboard, getWorlds, MapRoom } from "#lib/api/leaderboards.js";
  import LeaderboardTable from "#lib/components/leaderboards/LeaderboardTable.svelte";
  import WorldList from "#lib/components/leaderboards/WorldList.svelte";
  import Segmented from "#lib/components/ui/Segmented.svelte";
  import type { LeaderboardEntry, World } from "#lib/schemas.js";
  import { logs } from "#lib/state/logs.svelte.js";

  const mapRooms = [
    { value: MapRoom.v2, label: "Map Room 2" },
    { value: MapRoom.v3, label: "Map Room 3" },
  ];

  let mapRoom = $state<MapRoom>(MapRoom.v2);
  let worlds = $state<World[]>([]);
  let worldId = $state("");
  let entries = $state<LeaderboardEntry[]>([]);
  let loadingWorlds = $state(true);
  let loadingEntries = $state(false);
  let worldsError = $state("");
  let entriesError = $state("");

  const roomWorlds = $derived(worlds.filter((world) => world.map_version === Number(mapRoom)));
  const world = $derived(roomWorlds.find((candidate) => candidate.uuid === worldId));

  /**
   * Fetches the selected world's rankings, dropping the answer if the player has picked another world meanwhile.
   *
   * @returns {Promise<void>} Resolves once the rankings are shown or the request failed.
   */
  const loadEntries = async () => {
    const requested = { worldId, mapRoom };
    const isCurrent = () => requested.worldId === worldId && requested.mapRoom === mapRoom;

    entries = [];
    entriesError = "";

    if (!worldId) return;

    loadingEntries = true;

    try {
      const result = await getLeaderboard(requested.worldId, requested.mapRoom);
      if (isCurrent()) entries = result;
    } catch (failure) {
      if (!isCurrent()) return;

      entriesError = toErrorMessage(failure);
      logs.error(`Could not load the leaderboard: ${entriesError}`);
    } finally {
      if (isCurrent()) loadingEntries = false;
    }
  };

  /**
   * Shows a world's rankings.
   *
   * @param {string} id - The world to show.
   */
  const selectWorld = (id: string) => {
    worldId = id;
    loadEntries();
  };

  /**
   * Switches Map Room and shows the rankings of its first world.
   *
   * @param {MapRoom} room - The Map Room to show.
   */
  const selectMapRoom = (room: MapRoom) => {
    mapRoom = room;
    selectWorld(roomWorlds[0]?.uuid ?? "");
  };

  /**
   * Fetches the world list, then shows the first world of the selected Map Room.
   *
   * @returns {Promise<void>} Resolves once the worlds are shown or the request failed.
   */
  const loadWorlds = async () => {
    loadingWorlds = true;
    worldsError = "";

    try {
      worlds = await getWorlds();
      selectMapRoom(mapRoom);
    } catch (failure) {
      worldsError = toErrorMessage(failure);
      logs.error(`Could not load the worlds: ${worldsError}`);
    } finally {
      loadingWorlds = false;
    }
  };

  onMount(loadWorlds);
</script>

<div class="grid h-full grid-cols-[300px_1fr] max-[1100px]:grid-cols-[260px_1fr]">
  <aside class="flex min-h-0 flex-col border-r bg-card">
    <div class="border-b px-7 pt-6 pb-5">
      <p class="eyebrow text-primary">Rankings</p>
      <h1 class="mt-3 mb-4 display text-[40px] leading-[1.1]">Top of<br /><em>the map.</em></h1>
      <p class="text-[13px] leading-relaxed text-muted-foreground">
        Who holds the most ground on each world. Worlds are named after whoever holds hex 0x0.
      </p>
    </div>

    <div class="border-b px-7 py-4">
      <Segmented options={mapRooms} bind:value={() => mapRoom, selectMapRoom} />
    </div>

    <WorldList
      worlds={roomWorlds}
      bind:selected={() => worldId, selectWorld}
      loading={loadingWorlds}
      error={worldsError}
      onretry={loadWorlds}
    />
  </aside>

  <section class="flex min-h-0 min-w-0 flex-col">
    <header class="flex h-[72px] shrink-0 items-center justify-between gap-4 border-b px-7">
      <div class="min-w-0">
        <p class="eyebrow">Map Room {mapRoom}</p>
        <h2 class="truncate display text-[26px]">{world?.name || "No world selected"}</h2>
      </div>
      <div class="flex shrink-0 items-center gap-5 text-[12.5px] text-muted-foreground">
        {#if world}
          <span class="flex items-center gap-1.5"><Users class="size-4" />{world.playerCount.toLocaleString()} players</span>
        {/if}
        <span class="flex items-center gap-1.5"><Clock class="size-4" />Refreshes every 2 hours</span>
      </div>
    </header>

    {#if loadingWorlds || world}
      <LeaderboardTable
        {entries}
        {mapRoom}
        loading={loadingWorlds || loadingEntries}
        error={entriesError}
        onretry={loadEntries}
      />
    {:else if !worldsError}
      <p class="px-7 py-12 text-center text-muted-foreground">Pick a world to see who's on top.</p>
    {/if}
  </section>
</div>
