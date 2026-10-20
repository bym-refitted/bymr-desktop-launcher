<script lang="ts">
  import { DropdownMenu } from "bits-ui";
  import { fade } from "svelte/transition";
  import Clock from "@lucide/svelte/icons/clock";
  import Ellipsis from "@lucide/svelte/icons/ellipsis";
  import Gift from "@lucide/svelte/icons/gift";
  import UserMinus from "@lucide/svelte/icons/user-minus";
  import Avatar from "#lib/components/ui/Avatar.svelte";
  import Button from "#lib/components/ui/Button.svelte";
  import { DURATION_MS } from "#lib/motion.js";
  import type { Friend } from "#lib/schemas.js";
  import { friends } from "#lib/state/friends.svelte.js";

  interface Props {
    friend: Friend;
    onremove: (friend: Friend) => void;
  }

  let { friend, onremove }: Props = $props();

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

  const cooldown = $derived(readyIn(friend.gift_ready_at));
  const busy = $derived(friends.isBusy(friend.user_id));
  const onlineRing = $derived(friend.online ? "ring-2 ring-success ring-offset-2 ring-offset-card" : "");
</script>

<article class="relative flex flex-col items-center rounded-xl border bg-card px-4 pt-6 pb-4 text-center transition-colors hover:border-border-strong">
  <DropdownMenu.Root>
    <DropdownMenu.Trigger
      class="absolute top-2 right-2 grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50 data-[state=open]:bg-accent"
      aria-label="More for {friend.username}"
      disabled={busy}
    >
      <Ellipsis class="size-4" />
    </DropdownMenu.Trigger>
    <DropdownMenu.Portal>
      <DropdownMenu.Content align="end" sideOffset={4} class="z-50 min-w-40 rounded-lg border border-border-strong bg-card p-1 shadow-xl outline-none">
        <DropdownMenu.Item
          class="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-destructive outline-none data-highlighted:bg-destructive/10"
          onSelect={() => onremove(friend)}
        >
          <UserMinus class="size-4" />Remove friend
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>

  <Avatar src={friend.pic_square} class="size-16 rounded-xl {onlineRing}" />
  <p class="mt-3 w-full truncate font-semibold">{friend.username}</p>
  <span class="mt-1 rounded-full bg-accent px-2 py-0.5 text-[11.5px] font-semibold text-muted-foreground">Level {friend.level}</span>

  {#if friend.online}
    <p class="mt-2 flex items-center gap-1.5 text-[12.5px] text-success"><span class="size-1.5 rounded-full bg-success"></span>Online now</p>
  {:else if friend.since}
    <p class="mt-2 text-[12.5px] text-muted-foreground">Friends since {monthYear.format(friend.since)}</p>
  {:else}
    <p class="mt-2 text-[12.5px] text-muted-foreground">Offline</p>
  {/if}

  <div class="mt-4 w-full">
    {#if cooldown}
      <p class="flex h-8 items-center justify-center gap-1.5 text-[12.5px] text-muted-foreground" title="One mystery sack per friend each day" in:fade={{ duration: DURATION_MS }}>
        <Clock class="size-3.5" />Sack ready in {cooldown}
      </p>
    {:else}
      <Button variant="soft" size="sm" class="w-full" disabled={busy} onclick={() => friends.gift(friend)}>
        <Gift />Send sack
      </Button>
    {/if}
  </div>
</article>
