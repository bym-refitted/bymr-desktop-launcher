<script lang="ts">
  import { flip } from "svelte/animate";
  import { fade, fly } from "svelte/transition";
  import FriendCard from "#lib/components/friends/FriendCard.svelte";
  import Avatar from "#lib/components/ui/Avatar.svelte";
  import Button from "#lib/components/ui/Button.svelte";
  import { countOf } from "#lib/format.js";
  import { collapse, DURATION_MS, reflow, rowIn } from "#lib/motion.js";
  import type { Friend } from "#lib/schemas.js";
  import { friends } from "#lib/state/friends.svelte.js";

  interface Props {
    onfind: () => void;
    onreview: () => void;
    onremove: (friend: Friend) => void;
  }

  let { onfind, onreview, onremove }: Props = $props();

  const ASKERS_SHOWN = 3;

  const askers = $derived(friends.incoming.slice(0, ASKERS_SHOWN));

  const askLabel = $derived.by(() => {
    if (friends.incoming.length === 1) {
      return `${friends.incoming[0].username} wants to be friends`;
    } else {
      return `${countOf(friends.incoming.length, "player")} want to be friends`;
    }
  });
</script>

{#if friends.incoming.length > 0}
  <div transition:collapse>
    <div class="mx-7 mt-6 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
      <span class="flex">
        {#each askers as asker (asker.request_id)}
          <Avatar src={asker.pic_square} class="size-8 rounded-lg ring-2 ring-background not-first:-ml-2" />
        {/each}
      </span>
      <p class="flex-1 truncate text-[13px] font-semibold">{askLabel}</p>
      <Button variant="soft" size="sm" onclick={onreview}>Review</Button>
    </div>
  </div>
{/if}

{#if friends.friends.length > 0}
  <div class="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4 p-7">
    {#each friends.onlineFirst as friend, index (friend.user_id)}
      <div animate:flip={reflow()} in:fly|global={rowIn(index)} out:fade={{ duration: DURATION_MS }}>
        <FriendCard {friend} {onremove} />
      </div>
    {/each}
  </div>
{:else}
  <div class="grid justify-items-center gap-1 px-7 py-12 text-center">
    <p class="font-semibold">No friends yet</p>
    <p class="text-muted-foreground">Find players by name and send them a request.</p>
    <Button class="mt-3" onclick={onfind}>Find players</Button>
  </div>
{/if}
