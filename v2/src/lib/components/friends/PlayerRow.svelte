<script lang="ts">
  import type { Snippet } from "svelte";
  import { fly } from "svelte/transition";
  import Avatar from "#lib/components/ui/Avatar.svelte";
  import { collapse, rowIn } from "#lib/motion.js";
  import type { FriendPlayer } from "#lib/schemas.js";

  interface Props {
    player: FriendPlayer;
    index: number;
    note?: string;
    children: Snippet;
  }

  let { player, index, note, children }: Props = $props();
</script>

<div class="flex h-16 items-center gap-4 border-b px-7 transition-colors hover:bg-accent/40" in:fly|global={rowIn(index)} out:collapse>
  <span class="relative shrink-0">
    <Avatar src={player.pic_square} class="size-10 rounded-lg" />
    {#if player.online}
      <span class="absolute -right-1 -bottom-1 size-3 rounded-full bg-success ring-2 ring-background" title="Online"></span>
    {/if}
  </span>
  <div class="min-w-0 flex-1">
    <p class="truncate font-semibold">{player.username}</p>
    <p class="truncate text-[12.5px] text-muted-foreground">
      Level {player.level}{#if note}<span class="mx-1.5 opacity-40">·</span>{note}{/if}
    </p>
  </div>
  <div class="flex shrink-0 items-center gap-2">
    {@render children()}
  </div>
</div>
