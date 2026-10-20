<script lang="ts">
  import Check from "@lucide/svelte/icons/check";
  import X from "@lucide/svelte/icons/x";
  import PlayerRow from "#lib/components/friends/PlayerRow.svelte";
  import Button from "#lib/components/ui/Button.svelte";
  import { timeAgo } from "#lib/format.js";
  import { friends } from "#lib/state/friends.svelte.js";
</script>

{#if friends.incoming.length === 0 && friends.outgoing.length === 0}
  <div class="grid justify-items-center gap-1 px-7 py-12 text-center">
    <p class="font-semibold">Nothing waiting</p>
    <p class="text-muted-foreground">Requests you send or receive show up here.</p>
  </div>
{/if}

{#if friends.incoming.length > 0}
  <p class="eyebrow flex h-10 items-center border-b px-7">Waiting on you</p>
  {#each friends.incoming as request, index (request.request_id)}
    <PlayerRow player={request} {index} note="Asked {timeAgo(request.sent_at)}">
      <Button size="sm" disabled={friends.isBusy(request.user_id)} onclick={() => friends.respond(request, true)}>
        <Check />Accept
      </Button>
      <Button variant="ghost" size="sm" disabled={friends.isBusy(request.user_id)} onclick={() => friends.respond(request, false)}>
        <X />Decline
      </Button>
    </PlayerRow>
  {/each}
{/if}

{#if friends.outgoing.length > 0}
  <p class="eyebrow flex h-10 items-center border-b px-7">Waiting on them</p>
  {#each friends.outgoing as request, index (request.request_id)}
    <PlayerRow player={request} {index} note="Sent {timeAgo(request.sent_at)}">
      <Button variant="ghost" size="sm" disabled={friends.isBusy(request.user_id)} onclick={() => friends.remove(request)}>
        <X />Cancel
      </Button>
    </PlayerRow>
  {/each}
{/if}
