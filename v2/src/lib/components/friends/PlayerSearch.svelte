<script lang="ts">
  import { onDestroy } from "svelte";
  import Check from "@lucide/svelte/icons/check";
  import Clock from "@lucide/svelte/icons/clock";
  import Search from "@lucide/svelte/icons/search";
  import UserPlus from "@lucide/svelte/icons/user-plus";
  import Users from "@lucide/svelte/icons/users";
  import { FriendRelation } from "#lib/api/friends.js";
  import PlayerRow from "#lib/components/friends/PlayerRow.svelte";
  import Button from "#lib/components/ui/Button.svelte";
  import { SEARCH_MIN_LENGTH, friends } from "#lib/state/friends.svelte.js";

  const SEARCH_DELAY_MS = 300;

  let timer: ReturnType<typeof setTimeout>;

  /**
   * Searches once the player stops typing, rather than on every key.
   */
  const queueSearch = () => {
    clearTimeout(timer);
    timer = setTimeout(() => friends.search(), SEARCH_DELAY_MS);
  };

  onDestroy(() => clearTimeout(timer));
</script>

<div class="border-b px-7 py-4">
  <label class="relative block max-w-[420px]">
    <Search class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
    <input
      type="search"
      bind:value={friends.term}
      oninput={queueSearch}
      placeholder="Search players by name"
      aria-label="Search players by name"
      class="h-10 w-full rounded-lg border border-border-strong bg-sunken pr-3 pl-9 transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground/50 focus:border-primary focus:ring-3 focus:ring-primary/20"
    />
  </label>
  <p class="mt-2 text-[12.5px] text-muted-foreground">
    Type at least {SEARCH_MIN_LENGTH} characters. Players who have never played aren't listed.
  </p>
</div>

{#if friends.searching}
  {#each { length: 4 }, index (index)}
    <div class="flex h-16 items-center gap-4 border-b px-7">
      <div class="size-10 animate-pulse rounded-lg bg-accent"></div>
      <div class="grid gap-2">
        <div class="h-3 w-32 animate-pulse rounded bg-accent"></div>
        <div class="h-3 w-16 animate-pulse rounded bg-accent"></div>
      </div>
    </div>
  {/each}
{:else if friends.results.length > 0}
  {#each friends.results as player, index (player.user_id)}
    <PlayerRow {player} {index} note={player.online ? "Online now" : ""}>
      {#if player.relation === FriendRelation.friends}
        <span class="flex items-center gap-1.5 px-3 text-[12.5px] font-medium text-primary"><Users class="size-3.5" />Friends</span>
      {:else if player.relation === FriendRelation.pendingOutgoing}
        <span class="flex items-center gap-1.5 px-3 text-[12.5px] text-muted-foreground"><Clock class="size-3.5" />Requested</span>
      {:else if player.relation === FriendRelation.pendingIncoming}
        <Button size="sm" disabled={friends.isBusy(player.user_id)} onclick={() => friends.respond(player, true)}>
          <Check />Accept
        </Button>
      {:else}
        <Button variant="soft" size="sm" disabled={friends.isBusy(player.user_id)} onclick={() => friends.add(player)}>
          <UserPlus />Add friend
        </Button>
      {/if}
    </PlayerRow>
  {/each}
{:else if friends.searched}
  <div class="grid justify-items-center gap-1 px-7 py-12 text-center">
    <p class="font-semibold">No players found</p>
    <p class="text-muted-foreground">Nobody matched "{friends.term.trim()}". Check the spelling, or try part of the name.</p>
  </div>
{:else}
  <div class="grid justify-items-center gap-1 px-7 py-12 text-center">
    <p class="font-semibold">Find your friends</p>
    <p class="text-muted-foreground">Search for a player by name to send them a request.</p>
  </div>
{/if}
