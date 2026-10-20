<script lang="ts">
  import { fly } from "svelte/transition";
  import Users from "@lucide/svelte/icons/users";
  import Button from "#lib/components/ui/Button.svelte";
  import { rowIn } from "#lib/motion.js";
  import type { World } from "#lib/schemas.js";

  interface Props {
    worlds: World[];
    selected: string;
    loading: boolean;
    error: string;
    onretry: () => void;
  }

  let { worlds, selected = $bindable(), loading, error, onretry }: Props = $props();
</script>

<div class="flex min-h-0 flex-1 flex-col">
  <p class="eyebrow flex h-10 shrink-0 items-center justify-between border-b px-7">
    Worlds
    {#if !loading && !error}<span class="num">{worlds.length}</span>{/if}
  </p>

  <div class="min-h-0 flex-1 overflow-auto">
    {#if loading}
      {#each { length: 4 }, index (index)}
        <div class="flex h-12 items-center justify-between border-b px-7">
          <div class="h-3 w-28 animate-pulse rounded bg-accent"></div>
          <div class="h-3 w-8 animate-pulse rounded bg-accent"></div>
        </div>
      {/each}
    {:else if error}
      <div class="grid gap-3 px-7 py-5">
        <p class="text-[13px] text-muted-foreground">{error}</p>
        <Button variant="outline" class="w-fit" onclick={onretry}>Try again</Button>
      </div>
    {:else if worlds.length === 0}
      <p class="px-7 py-5 text-[13px] text-muted-foreground">No worlds are open on this Map Room yet.</p>
    {:else}
      {#each worlds as world, index (world.uuid)}
        <button
          type="button"
          aria-current={world.uuid === selected ? "true" : undefined}
          onclick={() => (selected = world.uuid)}
          in:fly|global={rowIn(index)}
          class="flex h-12 w-full items-center justify-between gap-3 border-b px-7 text-left text-muted-foreground transition-colors hover:bg-accent hover:text-foreground aria-[current=true]:bg-accent aria-[current=true]:text-foreground aria-[current=true]:shadow-[inset_2px_0_0_var(--primary)]"
        >
          <span class="truncate font-medium">{world.name || "Unnamed world"}</span>
          <span class="flex shrink-0 items-center gap-1.5 text-[12px] tabular-nums">
            <Users class="size-3.5" />{world.playerCount.toLocaleString()}
          </span>
        </button>
      {/each}
    {/if}
  </div>
</div>
