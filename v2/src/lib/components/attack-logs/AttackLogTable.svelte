<script lang="ts">
  import { fly } from "svelte/transition";
  import Shield from "@lucide/svelte/icons/shield";
  import Swords from "@lucide/svelte/icons/swords";
  import Avatar from "#lib/components/ui/Avatar.svelte";
  import Button from "#lib/components/ui/Button.svelte";
  import { timeAgo } from "#lib/format.js";
  import { rowIn } from "#lib/motion.js";
  import type { AttackLog } from "#lib/schemas.js";
  import { user } from "#lib/state/user.svelte.js";

  interface Props {
    battles: AttackLog[];
    loading: boolean;
    error: string;
    onretry: () => void;
  }

  interface BattleRow {
    log: AttackLog;
    count: number;
  }

  let { battles, loading, error, onretry }: Props = $props();

  const yardNames: Record<string, string> = {
    main: "Main yard",
    outpost: "Outpost",
    inferno: "Inferno yard",
    tribe: "Wild monsters",
    iwm: "Inferno wild monsters",
  };

  const battleKinds = {
    attack: { label: "Attack", icon: Swords, dot: "bg-primary", badge: "bg-primary text-primary-foreground" },
    defence: { label: "Defence", icon: Shield, dot: "bg-secondary", badge: "bg-secondary text-secondary-foreground" },
  };

  /**
   * Whether two battles are the same raid repeated: the same players, yard and location, at the same time.
   *
   * @param {AttackLog} previous - The battle already in the table.
   * @param {AttackLog} next - The battle that follows it.
   * @returns {boolean} True when the next battle can be folded into the previous one.
   */
  const isRepeatBattle = (previous: AttackLog, next: AttackLog) => {
    const sameAttacker = previous.attacker_userid === next.attacker_userid;
    const sameDefender = previous.defender_userid === next.defender_userid;

    const sameYard = previous.type === next.type && previous.x === next.x && previous.y === next.y;
    const sameTime = timeAgo(previous.attacktime) === timeAgo(next.attacktime);

    return sameAttacker && sameDefender && sameYard && sameTime;
  };

  const rows = $derived.by(() => {
    const battle: BattleRow[] = [];

    for (const log of battles) {
      const previous = battle.at(-1);

      if (previous && isRepeatBattle(previous.log, log)) {
        previous.count++;
      } else {
        battle.push({ log, count: 1 });
      }
    }

    return battle;
  });
</script>

<div class="min-h-0 flex-1 overflow-auto">
  <table class="w-full text-[13px]">
    <thead class="sticky top-0 z-10 bg-background shadow-[inset_0_-1px_0_var(--border)]">
      <tr class="h-12 text-left">
        <th class="pl-7 eyebrow">Battle</th>
        <th class="w-36 eyebrow">Type</th>
        <th class="w-48 eyebrow">Yard</th>
        <th class="w-36 pr-7 text-right eyebrow">When</th>
      </tr>
    </thead>

    <tbody>
      {#if loading}
        {#each { length: 8 }, index (index)}
          <tr class="h-14 border-b">
            <td class="pl-7">
              <div class="flex items-center gap-3">
                <div class="size-9 animate-pulse rounded-lg bg-accent"></div>
                <div class="h-3 w-40 animate-pulse rounded bg-accent"></div>
              </div>
            </td>
            <td><div class="h-3 w-16 animate-pulse rounded bg-accent"></div></td>
            <td><div class="h-3 w-20 animate-pulse rounded bg-accent"></div></td>
            <td class="pr-7"><div class="ml-auto h-3 w-16 animate-pulse rounded bg-accent"></div></td>
          </tr>
        {/each}
      {:else}
        {#each rows as { log, count }, index (log.id)}
          {@const isAttack = log.attacker_userid === user.userId}
          {@const kind = isAttack ? battleKinds.attack : battleKinds.defence}
          {@const opponentPic = isAttack ? log.defender_pic_square : log.attacker_pic_square}
          <tr class="h-14 border-b transition-colors hover:bg-accent/60" in:fly|global={rowIn(index)}>
            <td class="pl-7">
              <div class="flex min-w-0 items-center gap-4">
                <span class="relative shrink-0">
                  <Avatar src={opponentPic} class="size-9 rounded-lg" />
                  <span
                    class="absolute -right-1.5 -bottom-1.5 grid size-[18px] place-items-center rounded-full ring-2 ring-background {kind.badge}"
                    title={kind.label}
                  >
                    <kind.icon class="size-2.5" strokeWidth={3} />
                  </span>
                </span>
                <p class="truncate text-muted-foreground">
                  {#if isAttack}
                    You raided <b class="font-semibold text-foreground">{log.defender_username}</b>
                  {:else}
                    <b class="font-semibold text-foreground">{log.attacker_username}</b> raided you
                  {/if}
                </p>
                {#if count > 1}
                  <span class="shrink-0 rounded bg-accent px-1.5 py-px text-[11px] font-semibold tabular-nums text-muted-foreground">
                    ×{count}
                  </span>
                {/if}
              </div>
            </td>
            <td>
              <span class="inline-flex items-center gap-2">
                <span class="size-2 rounded-full {kind.dot}"></span>
                {kind.label}
              </span>
            </td>
            <td>
              <p>{yardNames[log.type] ?? log.type}</p>
              {#if log.x && log.y}
                <p class="text-[12px] tabular-nums text-muted-foreground">{log.x}, {log.y}</p>
              {/if}
            </td>
            <td class="pr-7 text-right text-muted-foreground" title={log.attacktime.toLocaleString()}>
              {timeAgo(log.attacktime)}
            </td>
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
  {:else if !loading && battles.length === 0}
    <div class="grid justify-items-center gap-1 px-7 py-12 text-center">
      <p class="font-semibold">No battles yet</p>
      <p class="text-muted-foreground">Raid someone, or wait for someone to raid you. They'll show up here.</p>
    </div>
  {/if}
</div>
