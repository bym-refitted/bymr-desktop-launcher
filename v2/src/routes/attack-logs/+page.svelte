<script lang="ts">
  import { onMount } from "svelte";
  import Clock from "@lucide/svelte/icons/clock";
  import { AttackLogFilter, getAttackLogs } from "#lib/api/attackLogs.js";
  import { toErrorMessage } from "#lib/api/errors.js";
  import snipertower from "#lib/assets/art/snipertower.png";
  import AttackLogTable from "#lib/components/attack-logs/AttackLogTable.svelte";
  import SignInPrompt from "#lib/components/ui/SignInPrompt.svelte";
  import TabBar from "#lib/components/ui/TabBar.svelte";
  import type { AttackLog } from "#lib/schemas.js";
  import { logs } from "#lib/state/logs.svelte.js";
  import { user } from "#lib/state/user.svelte.js";

  const filters = [
    { value: AttackLogFilter.both, label: "All" },
    { value: AttackLogFilter.myAttacks, label: "Attacks" },
    { value: AttackLogFilter.myDefences, label: "Defences" },
  ];

  let filter = $state<AttackLogFilter>(AttackLogFilter.both);
  let battles = $state<AttackLog[]>([]);
  let loading = $state(false);
  let error = $state("");

  /**
   * Fetches the player's battles for the selected filter, dropping the answer if the filter changed meanwhile.
   *
   * @returns {Promise<void>} Resolves once the battles are shown or the request failed.
   */
  const loadBattles = async () => {
    const requested = filter;

    battles = [];
    error = "";

    if (!user.signedIn) return;

    loading = true;

    try {
      const result = await getAttackLogs(requested);
      if (requested === filter) battles = result;
    } catch (failure) {
      if (requested !== filter) return;

      error = toErrorMessage(failure);
      logs.error(`Could not load the attack logs: ${error}`);
    } finally {
      if (requested === filter) loading = false;
    }
  };

  /**
   * Switches the filter and fetches the matching battles.
   *
   * @param {AttackLogFilter} next - The filter to show.
   */
  const selectFilter = (next: AttackLogFilter) => {
    filter = next;
    loadBattles();
  };

  onMount(loadBattles);
</script>

<div class="flex h-full flex-col">
  <header class="flex shrink-0 justify-between gap-6 border-b px-7 pt-6 pb-5">
    <div>
      <p class="eyebrow text-primary">Battle history</p>
      <h1 class="mt-3 display text-[40px] leading-[1.1]">Attack <em>logs.</em></h1>
      <p class="mt-2 text-[13px] text-muted-foreground">Your 50 most recent raids and defences.</p>
    </div>
    <img src={snipertower} alt="" class="-mb-5 h-[104px] w-auto self-end" />
  </header>

  {#if user.signedIn}
    <div class="flex h-[46px] shrink-0 items-stretch justify-between border-b px-7">
      <TabBar options={filters} bind:value={() => filter, selectFilter} class="h-full" />
      <span class="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
        <Clock class="size-4" />Refreshes every 30 minutes
      </span>
    </div>
    <AttackLogTable {battles} {loading} {error} onretry={loadBattles} />
  {:else}
    <SignInPrompt title="Sign in to see your battles" description="Your raids and defences show up here once you're signed in." />
  {/if}
</div>
