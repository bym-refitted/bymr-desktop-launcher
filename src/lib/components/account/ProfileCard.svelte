<script lang="ts">
  import BadgeCheck from "@lucide/svelte/icons/badge-check";
  import Clock from "@lucide/svelte/icons/clock";
  import MonitorCheck from "@lucide/svelte/icons/monitor-check";
  import Avatar from "#lib/components/ui/Avatar.svelte";
  import type { AccountDetails } from "#lib/schemas.js";
  import { user } from "#lib/state/user.svelte.js";

  interface Props {
    details: AccountDetails;
  }

  let { details }: Props = $props();
</script>

<div class="grid content-start gap-5">
  <Avatar src={details.pic_square} class="size-20 rounded-2xl" />

  <div class="min-w-0">
    <p class="truncate display text-[28px]">{details.username}</p>
    <p class="mt-1 truncate text-[13px] text-muted-foreground">{details.email}</p>
  </div>

  <div class="grid justify-items-start gap-2 text-[12.5px] font-medium">
    {#if details.discord_verified}
      <span class="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-primary">
        <BadgeCheck class="size-3.5" />Discord verified
      </span>
    {/if}
    {#if user.remembered}
      <span class="inline-flex items-center gap-1.5 rounded-md bg-accent px-2 py-1 text-muted-foreground">
        <MonitorCheck class="size-3.5" />Remembered on this device
      </span>
    {:else}
      <span class="inline-flex items-center gap-1.5 rounded-md bg-accent px-2 py-1 text-muted-foreground">
        <Clock class="size-3.5" />Signed in for this session
      </span>
    {/if}
  </div>
</div>
