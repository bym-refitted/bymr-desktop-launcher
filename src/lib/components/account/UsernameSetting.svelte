<script lang="ts">
  import { fade } from "svelte/transition";
  import Check from "@lucide/svelte/icons/check";
  import Lock from "@lucide/svelte/icons/lock";
  import UserPen from "@lucide/svelte/icons/user-pen";
  import { toErrorMessage } from "#lib/api/errors.js";
  import { changeUsername } from "#lib/api/player.js";
  import SettingRow from "#lib/components/account/SettingRow.svelte";
  import AlertDialog from "#lib/components/ui/AlertDialog.svelte";
  import Button from "#lib/components/ui/Button.svelte";
  import TextField from "#lib/components/ui/TextField.svelte";
  import { DURATION_MS } from "#lib/motion.js";
  import { Username, type AccountDetails } from "#lib/schemas.js";
  import { logs } from "#lib/state/logs.svelte.js";
  import { user } from "#lib/state/user.svelte.js";

  interface Props {
    details: AccountDetails;
    onupdate: (details: AccountDetails) => void;
  }

  let { details, onupdate }: Props = $props();

  const COOLDOWN_MONTHS = 6;

  const dateFormat = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "long", year: "numeric" });

  let username = $derived(details.username);
  let touched = $state(false);
  let confirming = $state(false);
  let saving = $state(false);
  let saved = $state(false);
  let error = $state("");

  const locked = $derived(!details.canChangeUsername);
  const result = $derived(Username.safeParse(username));
  const changed = $derived(username.trim() !== details.username);
  const canSave = $derived(!locked && !saving && changed && result.success);
  const validationError = $derived(touched && changed && !result.success ? result.error.issues[0].message : "");

  /**
   * The date a change made today would unlock the next one.
   *
   * @returns {string} The date, e.g. "20 April 2027".
   */
  const nextUnlock = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + COOLDOWN_MONTHS);

    return dateFormat.format(date);
  };

  /**
   * Validates the new name and asks the player to confirm it, since it can't be changed again for 6 months.
   *
   * @param {SubmitEvent} event - The form's submit event.
   */
  const requestChange = (event: SubmitEvent) => {
    event.preventDefault();
    touched = true;

    if (canSave) confirming = true;
  };

  /**
   * Saves the confirmed name, then updates the account and the signed-in user with it.
   *
   * @returns {Promise<void>} Resolves once the name is saved or the request failed.
   */
  const save = async () => {
    saving = true;
    error = "";

    try {
      const change = await changeUsername(Username.parse(username));

      onupdate({ ...details, username: change.username, canChangeUsername: false, nextChangeAt: change.nextChangeAt });
      user.rename(change.username);
      saved = true;
    } catch (failure) {
      error = toErrorMessage(failure);
      logs.error(`Could not change the username: ${error}`);
    } finally {
      saving = false;
    }
  };
</script>

<SettingRow
  title="Username"
  description="The name other players see. You can change it once every 6 months: your yards carry the new name, while past attack logs keep the old one."
>
  {#snippet icon()}<UserPen class="size-[18px]" />{/snippet}
  <form class="grid gap-2.5" onsubmit={requestChange} novalidate>
    <TextField
      label="Username"
      bind:value={username}
      maxlength={12}
      autocomplete="off"
      disabled={locked || saving}
      error={validationError || error}
      onblur={() => (touched = true)}
      oninput={() => (saved = false)}
    >
      {#snippet trailing()}
        {#if !locked}
          <Button type="submit" disabled={!canSave}>{saving ? "Saving..." : "Save"}</Button>
        {/if}
      {/snippet}
    </TextField>
    <div>
      {#if saved}
        <p class="flex items-center gap-1.5 text-[12.5px] text-success" in:fade={{ duration: DURATION_MS }}>
          <Check class="size-3.5 shrink-0" />Saved. Restart the game if it's running.
        </p>
      {:else if locked && details.nextChangeAt}
        <p class="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
          <Lock class="size-3.5 shrink-0" />You can change it again on {dateFormat.format(details.nextChangeAt)}.
        </p>
      {:else if !validationError && !error}
        <p class="text-[12.5px] text-muted-foreground">2 to 12 letters, numbers or underscores.</p>
      {/if}
    </div>
  </form>
</SettingRow>

<AlertDialog
  bind:open={confirming}
  label="Username"
  title="Change your username?"
  description="You'll be known as {username.trim()}. You won't be able to change it again until {nextUnlock()}."
  buttonLabel="Change username"
  onconfirm={save}
/>
