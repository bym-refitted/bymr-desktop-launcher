<script lang="ts">
  import { onMount } from "svelte";
  import LogOut from "@lucide/svelte/icons/log-out";
  import MonitorSmartphone from "@lucide/svelte/icons/monitor-smartphone";
  import { goto } from "$app/navigation";
  import { toErrorMessage } from "#lib/api/errors.js";
  import { getAccountDetails } from "#lib/api/player.js";
  import { signOut } from "#lib/api/session.js";
  import townhall from "#lib/assets/art/townhall.png";
  import ProfileCard from "#lib/components/account/ProfileCard.svelte";
  import SettingRow from "#lib/components/account/SettingRow.svelte";
  import ShinySetting from "#lib/components/account/ShinySetting.svelte";
  import UsernameSetting from "#lib/components/account/UsernameSetting.svelte";
  import Button from "#lib/components/ui/Button.svelte";
  import SignInPrompt from "#lib/components/ui/SignInPrompt.svelte";
  import type { AccountDetails } from "#lib/schemas.js";
  import { logs } from "#lib/state/logs.svelte.js";
  import { user } from "#lib/state/user.svelte.js";

  let details = $state<AccountDetails>();
  let loading = $state(false);
  let error = $state("");

  const sessionNote = $derived(
    user.remembered
      ? "You're remembered on this device, so the launcher signs you in by itself. Signing out forgets this device."
      : "You're signed in until you close the launcher. Signing out ends the session now.",
  );

  /**
   * Fetches the player's full account.
   *
   * @returns {Promise<void>} Resolves once the account is shown or the request failed.
   */
  const loadDetails = async () => {
    if (!user.signedIn) return;

    loading = true;
    error = "";

    try {
      details = await getAccountDetails();
    } catch (failure) {
      error = toErrorMessage(failure);
      logs.error(`Could not load the account: ${error}`);
    } finally {
      loading = false;
    }
  };

  /**
   * Signs out and returns to the sign-in page.
   *
   * @returns {Promise<void>} Resolves once the player is on the sign-in page.
   */
  const leave = async () => {
    await signOut();
    goto("/");
  };

  onMount(loadDetails);
</script>

<div class="flex h-full flex-col">
  <header class="flex shrink-0 justify-between gap-6 border-b px-7 pt-6 pb-5">
    <div>
      <p class="eyebrow text-primary">Your account</p>
      <h1 class="mt-3 display text-[40px] leading-[1.1]">Account <em>settings.</em></h1>
      <p class="mt-2 text-[13px] text-muted-foreground">Your name, shiny and session on this device.</p>
    </div>
    <img src={townhall} alt="" class="h-24 w-auto self-center" />
  </header>

  {#if !user.signedIn}
    <SignInPrompt title="Sign in to manage your account" description="Your username, shiny and session settings live here." />
  {:else}
    <div class="grid min-h-0 flex-1 grid-cols-[300px_1fr] max-[1100px]:grid-cols-[260px_1fr]">
      <aside class="min-h-0 overflow-auto border-r bg-card px-7 py-6">
        {#if details}
          <ProfileCard {details} />
        {:else if loading}
          <div class="grid gap-5">
            <div class="size-20 animate-pulse rounded-2xl bg-accent"></div>
            <div class="grid gap-2">
              <div class="h-5 w-32 animate-pulse rounded bg-accent"></div>
              <div class="h-3 w-44 animate-pulse rounded bg-accent"></div>
            </div>
          </div>
        {/if}
      </aside>

      <div class="min-h-0 overflow-auto">
        {#if loading}
          {#each { length: 3 }, index (index)}
            <div class="grid grid-cols-[minmax(0,500px)_minmax(0,360px)] gap-12 border-b px-7 py-6 max-[1100px]:gap-8">
              <div class="flex gap-4">
                <div class="size-9 shrink-0 animate-pulse rounded-lg bg-accent"></div>
                <div class="grid flex-1 content-start gap-2">
                  <div class="h-3.5 w-28 animate-pulse rounded bg-accent"></div>
                  <div class="h-3 w-full max-w-72 animate-pulse rounded bg-accent"></div>
                </div>
              </div>
              <div class="h-10 animate-pulse rounded-lg bg-accent"></div>
            </div>
          {/each}
        {:else if error}
          <div class="grid justify-items-center gap-3 px-7 py-12 text-center">
            <p class="text-muted-foreground">{error}</p>
            <Button variant="outline" onclick={loadDetails}>Try again</Button>
          </div>
        {:else if details}
          <UsernameSetting {details} onupdate={(next) => (details = next)} />
          <ShinySetting {details} onupdate={(next) => (details = next)} />
          <SettingRow title="Session" description={sessionNote}>
            {#snippet icon()}<MonitorSmartphone class="size-[18px]" />{/snippet}
            <Button variant="outline" class="w-fit" onclick={leave}><LogOut />Sign out</Button>
          </SettingRow>
        {/if}
      </div>
    </div>
  {/if}
</div>
