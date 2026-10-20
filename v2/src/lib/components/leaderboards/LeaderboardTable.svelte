<script lang="ts">
  import Crown from "@lucide/svelte/icons/crown";
  import { MapRoom } from "#lib/api/leaderboards.js";
  import outpost from "#lib/assets/art/outpost.png";
  import resource from "#lib/assets/art/resource.png";
  import stronghold from "#lib/assets/art/stronghold.png";
  import Avatar from "#lib/components/ui/Avatar.svelte";
  import Button from "#lib/components/ui/Button.svelte";
  import type { LeaderboardEntry } from "#lib/schemas.js";
  import { user } from "#lib/state/user.svelte.js";

  interface Props {
    entries: LeaderboardEntry[];
    mapRoom: MapRoom;
    loading: boolean;
    error: string;
    onretry: () => void;
  }

  let { entries, mapRoom, loading, error, onretry }: Props = $props();

  const crownColours = ["text-gold", "text-silver", "text-bronze"];

  interface Column {
    label: string;
    icon: string;
    count: (entry: LeaderboardEntry) => number;
  }

  const outposts: Column = { label: "Outposts", icon: outpost, count: (entry) => entry.outpost_count };
  const strongholds: Column = { label: "Strongholds", icon: stronghold, count: (entry) => entry.stronghold_count ?? 0 };
  const resourceOutposts: Column = { label: "Resource outposts", icon: resource, count: (entry) => entry.outpost_count };

  const columns = $derived(mapRoom === MapRoom.v3 ? [strongholds, resourceOutposts] : [outposts]);
</script>

<div class="min-h-0 flex-1 overflow-auto">
  <table class="w-full text-[13px]">
    <thead class="sticky top-0 z-10 bg-background shadow-[inset_0_-1px_0_var(--border)]">
      <tr class="h-12 text-left">
        <th class="w-20 pl-7 eyebrow">Rank</th>
        <th class="eyebrow">Player</th>
        {#each columns as column (column.label)}
          <th class="w-48 pr-7 text-right whitespace-nowrap">
            <span class="eyebrow inline-flex items-center gap-2">
              <img src={column.icon} alt="" class="h-7 w-auto" />{column.label}
            </span>
          </th>
        {/each}
      </tr>
    </thead>

    <tbody>
      {#if loading}
        {#each { length: 8 }, index (index)}
          <tr class="h-14 border-b">
            <td class="pl-7"><div class="h-3 w-5 animate-pulse rounded bg-accent"></div></td>
            <td>
              <div class="flex items-center gap-3">
                <div class="size-9 animate-pulse rounded-lg bg-accent"></div>
                <div class="h-3 w-32 animate-pulse rounded bg-accent"></div>
              </div>
            </td>
            {#each columns as column (column.label)}
              <td class="pr-7"><div class="ml-auto h-3 w-10 animate-pulse rounded bg-accent"></div></td>
            {/each}
          </tr>
        {/each}
      {:else}
        {#each entries as entry, index (entry.username)}
          {@const isYou = entry.username === user.username}
          {@const crownColour = crownColours[index]}
          <tr class={["h-14 border-b transition-colors hover:bg-accent/60", isYou && "bg-primary/5"]}>
            <td class="pl-7">
              <span class="text-[15px] font-semibold tabular-nums {index < 3 ? 'text-primary' : 'text-muted-foreground'}">
                {index + 1}
              </span>
            </td>
            <td>
              <div class="flex min-w-0 items-center gap-3">
                <span class="relative shrink-0">
                  <Avatar src={entry.pic_square} class="size-9 rounded-lg" />
                  {#if crownColour}
                    <Crown class="absolute -top-2.5 -left-2 size-4 -rotate-[25deg] fill-current drop-shadow-[0_1px_1px_rgb(0_0_0/0.45)] {crownColour}" />
                  {/if}
                </span>
                <div class="min-w-0">
                  <p class="flex items-center gap-2 font-semibold">
                    <span class="truncate">{entry.username}</span>
                    {#if isYou}
                      <span class="rounded bg-primary/15 px-1.5 py-px text-[11px] font-semibold text-primary">You</span>
                    {/if}
                  </p>
                  {#if entry.discord_tag}
                    <p class="truncate text-[12px] text-muted-foreground">@{entry.discord_tag}</p>
                  {/if}
                </div>
              </div>
            </td>
            {#each columns as column (column.label)}
              <td class="pr-7 text-right text-[15px] font-semibold tabular-nums">{column.count(entry).toLocaleString()}</td>
            {/each}
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>

  {#if !loading && error}
    <div class="grid justify-items-center gap-3 px-7 py-12 text-center">
      <p class="text-muted-foreground">{error}</p>
      <Button variant="outline" onclick={onretry}>Try again</Button>
    </div>
  {:else if !loading && entries.length === 0}
    <p class="px-7 py-12 text-center text-muted-foreground">Nobody has claimed any ground here yet.</p>
  {/if}
</div>
