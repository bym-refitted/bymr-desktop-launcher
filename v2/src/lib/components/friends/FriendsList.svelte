<script lang="ts">
  import Clock from "@lucide/svelte/icons/clock";
  import Gift from "@lucide/svelte/icons/gift";
  import UserMinus from "@lucide/svelte/icons/user-minus";
  import PlayerRow from "#lib/components/friends/PlayerRow.svelte";
  import Button from "#lib/components/ui/Button.svelte";
  import type { Friend } from "#lib/schemas.js";
  import { friends } from "#lib/state/friends.svelte.js";

  interface Props {
    onfind: () => void;
    onremove: (friend: Friend) => void;
  }

  let { onfind, onremove }: Props = $props();

  const monthYear = new Intl.DateTimeFormat(undefined, { month: "short", year: "numeric" });

  /**
   * How long until another sack can be sent, for the cooldown label.
   *
   * @param {number | null} readyAt - When the cooldown ends, in epoch seconds.
   * @returns {string} e.g. "45m" or "5h", or an empty string once a sack can be sent.
   */
  const readyIn = (readyAt: number | null) => {
    if (!readyAt) return "";

    const minutes = Math.ceil((readyAt * 1000 - Date.now()) / 60_000);

    if (minutes <= 0) return "";

    return minutes < 60 ? `${minutes}m` : `${Math.ceil(minutes / 60)}h`;
  };

  /**
   * The context line under a friend's name.
   *
   * @param {Friend} friend - The friend to describe.
   * @returns {string} "Online now", how long they've been friends, or nothing.
   */
  const noteFor = (friend: Friend) => {
    if (friend.online) return "Online now";
    if (friend.since) return `Friends since ${monthYear.format(friend.since)}`;

    return "";
  };
</script>

{#each friends.friends as friend (friend.user_id)}
  {@const cooldown = readyIn(friend.gift_ready_at)}
  <PlayerRow player={friend} note={noteFor(friend)}>
    {#if cooldown}
      <span class="flex items-center gap-1.5 px-3 text-[12.5px] text-muted-foreground" title="One mystery sack per friend each day">
        <Clock class="size-3.5" />Sack ready in {cooldown}
      </span>
    {:else}
      <Button variant="soft" size="sm" disabled={friends.isBusy(friend.user_id)} onclick={() => friends.gift(friend)}>
        <Gift />Send sack
      </Button>
    {/if}
    <Button variant="ghost" size="sm" disabled={friends.isBusy(friend.user_id)} onclick={() => onremove(friend)}>
      <UserMinus />Remove
    </Button>
  </PlayerRow>
{:else}
  <div class="grid justify-items-center gap-1 px-7 py-12 text-center">
    <p class="font-semibold">No friends yet</p>
    <p class="text-muted-foreground">Find players by name and send them a request.</p>
    <Button class="mt-3" onclick={onfind}>Find players</Button>
  </div>
{/each}
