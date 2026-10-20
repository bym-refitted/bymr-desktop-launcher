<script lang="ts">
  import { fade } from "svelte/transition";
  import Coins from "@lucide/svelte/icons/coins";
  import { toErrorMessage } from "#lib/api/errors.js";
  import { updateSettings } from "#lib/api/player.js";
  import SettingRow from "#lib/components/account/SettingRow.svelte";
  import Switch from "#lib/components/ui/Switch.svelte";
  import { DURATION_MS } from "#lib/motion.js";
  import type { AccountDetails } from "#lib/schemas.js";
  import { logs } from "#lib/state/logs.svelte.js";

  interface Props {
    details: AccountDetails;
    onupdate: (details: AccountDetails) => void;
  }

  let { details, onupdate }: Props = $props();

  let shinyLocked = $derived(details.settings.shinyLocked);
  let saving = $state(false);
  let error = $state("");

  /**
   * Saves the switch's new position, putting it back if the server refuses.
   *
   * @param {boolean} next - Whether no-shiny mode is now on.
   * @returns {Promise<void>} Resolves once the setting is saved or reverted.
   */
  const toggle = async (next: boolean) => {
    saving = true;
    error = "";

    try {
      const settings = await updateSettings({ shinyLocked: next });
      onupdate({ ...details, settings });
    } catch (failure) {
      shinyLocked = !next;
      error = toErrorMessage(failure);
      logs.error(`Could not update no-shiny mode: ${error}`);
    } finally {
      saving = false;
    }
  };
</script>

<SettingRow
  title="No-shiny mode"
  description="Hides shiny completely, so nothing can be bought, rushed or unlocked with it. You still earn it as normal, and your full balance comes back when you turn this off."
>
  {#snippet icon()}<Coins class="size-[18px]" />{/snippet}
  <label class="flex w-fit cursor-pointer items-center gap-3">
    <Switch label="No-shiny mode" bind:checked={shinyLocked} disabled={saving} onchange={toggle} />
    <span class="font-medium">{shinyLocked ? "On" : "Off"}</span>
  </label>
  {#if error}
    <p class="text-[12.5px] text-destructive">{error}</p>
  {:else if shinyLocked}
    <p class="text-[12.5px] text-muted-foreground" in:fade={{ duration: DURATION_MS }}>Shiny is hidden in game. If it's running, it catches up within about 30 seconds.</p>
  {/if}
</SettingRow>
