<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { goto } from "$app/navigation";
  import { UserCircle, WarningDiamond, SignOut, Sparkle } from "phosphor-svelte";

  import { Method } from "$lib/enums/Method";
  import { Status } from "$lib/enums/StatusCodes";
  import { invokeApiRequest } from "$lib/utils/invokeApiRequest";
  import { handleErrorMessage } from "$lib/errors/errorMessages";
  import { addErrorLog } from "$lib/stores/debugLogStore";
  import AlertDialog from "$lib/components/AlertDialog.svelte";
  import Loader from "$lib/components/Loader.svelte";
  import PrimaryButton from "$lib/components/ui/button/PrimaryButton.svelte";
  import Switch from "$lib/components/ui/switch/Switch.svelte";
  import { validateUsername } from "$lib/components/ui/form/validation";
  import {
    isUserRemembered,
    removeUserFromLocalStorage,
    saveUserToLocalStorage,
    user,
  } from "$lib/stores/userStore";

  interface AccountSettings {
    shinyLocked: boolean;
  }

  interface Account {
    username: string;
    email: string;
    canChangeUsername: boolean;
    nextChangeAt: string | null;
    settings: AccountSettings;
  }

  interface ChangeUsernameResponse {
    username: string;
    nextChangeAt: string | null;
  }

  interface UpdateSettingsResponse {
    settings: AccountSettings;
  }

  let account: Account | null = null;
  let hasLoadedAccount = false;

  let username = "";
  let hasTouchedUsername = false;
  let isSubmitting = false;

  let errorMessage = "";
  let usernameChanged = false;

  let shinyLocked = false;
  let isSavingShiny = false;
  let shinyErrorMessage = "";

  $: validationError = validateUsername(username);
  $: isUnchanged = !!account && username === account.username;
  $: canSubmit = !!account && account.canChangeUsername && !validationError && !isUnchanged && !isSubmitting;

  const fetchAccount = async () => {
    if (!$user.token) {
      hasLoadedAccount = true;
      return;
    }

    try {
      const { data } = await invokeApiRequest<Account>("/player/account", {}, Method.GET,);

      account = data;
      username = data.username;
      shinyLocked = data.settings?.shinyLocked ?? false;
      user.update((current) => ({ ...current, username: data.username }));
    } catch (error) {
      errorMessage = handleErrorMessage(error);
      addErrorLog(`Could not load account details: ${errorMessage}`);
    } finally {
      hasLoadedAccount = true;
    }
  };

  const handleChangeUsername = async () => {
    if (!canSubmit) {
      hasTouchedUsername = true;
      return;
    }

    isSubmitting = true;
    errorMessage = "";

    try {
      const { status, data } = await invokeApiRequest<ChangeUsernameResponse>(
        "/player/changeusername",
        { username },
        Method.POST,
      );

      if (status !== Status.OK) return;

      account = {
        ...account!,
        username: data.username,
        canChangeUsername: false,
        nextChangeAt: data.nextChangeAt,
      };
      username = data.username;
      hasTouchedUsername = false;
      usernameChanged = true;

      const updatedUser = { ...$user, username: data.username };
      user.set(updatedUser);
      if ($isUserRemembered) saveUserToLocalStorage(updatedUser);
    } catch (error) {
      errorMessage = handleErrorMessage(error);
      addErrorLog(`Could not change username: ${errorMessage}`);
    } finally {
      isSubmitting = false;
    }
  };

  /**
   * Applies the shiny toggle optimistically, reverting it if the server refuses.
   *
   * The switch already shows the new state by the time this runs, so a failure has to put
   * it back rather than leave the UI claiming something the server did not do.
   *
   * account.settings holds the last state the server confirmed, so comparing against it
   * makes this a no-op for the changes we make ourselves - the initial load and the revert
   * below both move the switch programmatically and would otherwise call straight back in.
   */
  const handleToggleShiny = async (locked: boolean) => {
    if (!account || isSavingShiny || locked === account.settings.shinyLocked) return;

    isSavingShiny = true;
    shinyErrorMessage = "";

    try {
      const { data } = await invokeApiRequest<UpdateSettingsResponse>(
        "/player/settings",
        { shinyLocked: locked },
        Method.POST,
      );

      shinyLocked = data.settings.shinyLocked;
      account = { ...account!, settings: data.settings };
    } catch (error) {
      shinyLocked = !locked;
      shinyErrorMessage = handleErrorMessage(error);
      addErrorLog(`Could not update shiny setting: ${shinyErrorMessage}`);
    } finally {
      isSavingShiny = false;
    }
  };

  const formatNextChange = (nextChangeAt: string) => {
    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
    
    return new Date(nextChangeAt).toLocaleDateString(undefined, options);
  }

  const handleLogout = () => {
    removeUserFromLocalStorage();
    goto("/");
  };

  onMount(fetchAccount);
</script>

<svelte:head>
  <title>Account</title>
</svelte:head>

<div class="mb-16 flex justify-start items-start lg:py-16 lg:mt-[6%] lg:py-0">
  <div class="w-full lg:w-3/5 mx-4 lg:ml-[12%] lg:mr-0">
    <div
      class="flex flex-col items-center text-muted-foreground"
      in:fly={{ y: 30, duration: 600, delay: 100 }}
    >
      <h1
        class="text-white font-title leading-snug pt-12 text-5xl lg:text-7xl lg:pt-0"
      >
        Account
      </h1>
    </div>

    <div class="mt-16" in:fly={{ y: 30, duration: 600, delay: 200 }}>
      {#if !hasLoadedAccount}
        <div class="flex justify-center py-12" role="status">
          <Loader size={2} />
        </div>
      {:else if !$user.token}
        <div class="bg-gray-800 rounded-lg p-6 text-muted-foreground">
          Log in from the BYM Refitted tab to manage your account.
        </div>
      {:else if !account}
        <div class="bg-gray-800 rounded-lg p-6 text-muted-foreground">
          {errorMessage || "Could not load your account details."}
        </div>
      {:else}
        <div class="bg-gray-800 rounded-lg p-6">
          <div class="flex items-center gap-3 mb-6">
            <UserCircle size={26} weight="bold" class="text-primary" />
            <h2 class="font-display text-xl text-white">Username</h2>
          </div>

          <p class="text-muted-foreground mb-6 leading-relaxed">
            You can change your username once every 6 months. Your bases and
            outposts carry the new name with them, while past attack logs keep
            the name you had at the time. If the game is already running,
            restart it to see the change.
          </p>

          <label
            for="username"
            class="block text-sm font-medium text-muted-foreground mb-2"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            maxlength="12"
            bind:value={username}
            on:blur={() => (hasTouchedUsername = true)}
            disabled={!account.canChangeUsername || isSubmitting}
            class="w-full h-12 rounded-lg bg-gray-700 border border-gray-600 px-4 text-white
              outline-none focus:border-primary transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {#if hasTouchedUsername && validationError}
            <p class="text-red-400 text-sm mt-2">{validationError}</p>
          {/if}

          {#if errorMessage}
            <p class="text-red-400 text-sm mt-2">{errorMessage}</p>
          {/if}

          {#if !account.canChangeUsername && account.nextChangeAt}
            <div
              class="flex items-start gap-3 mt-4 text-sm text-muted-foreground"
            >
              <WarningDiamond
                size={18}
                weight="bold"
                class="text-primary shrink-0 mt-0.5"
              />
              <span>
                You changed your username recently. You can change it again on
                {formatNextChange(account.nextChangeAt)}.
              </span>
            </div>
          {/if}

          <div class="mt-6">
            <PrimaryButton
              buttonText={isSubmitting ? "Saving..." : "Change Username"}
              disabled={!canSubmit}
              on:click={handleChangeUsername}
            />
          </div>
        </div>

        <div class="bg-gray-800 rounded-lg p-6 mt-6">
          <div class="flex items-center gap-3 mb-6">
            <Sparkle size={26} weight="bold" class="text-primary" />
            <h2 class="font-display text-xl text-white">Shiny</h2>
          </div>

          <p class="text-muted-foreground mb-6 leading-relaxed">
            Turning shiny off hides it completely: the game reads 0 shiny, and nothing can
            be bought, rushed or unlocked with it. You still earn it as normal - mushrooms
            and quest rewards keep paying out, you just will not see them land. Your
            balance comes back in full when you turn shiny back on.
          </p>

          <div class="flex items-center justify-between gap-6">
            <span class="text-sm font-medium text-muted-foreground">Turn shiny off</span>
            <Switch
              label="Turn shiny off"
              disabled={isSavingShiny}
              bind:checked={shinyLocked}
              onCheckedChange={handleToggleShiny}
            />
          </div>

          {#if shinyErrorMessage}
            <p class="text-red-400 text-sm mt-4">{shinyErrorMessage}</p>
          {:else if shinyLocked}
            <div class="flex items-start gap-3 mt-4 text-sm text-muted-foreground">
              <WarningDiamond
                size={18}
                weight="bold"
                class="text-primary shrink-0 mt-0.5"
              />
              <span>
                Shiny is off, so nothing can be spent. Anything you earn is still saved for
                when you turn it back on. If the game is already running, it catches up
                within about 30 seconds.
              </span>
            </div>
          {/if}
        </div>

        <div class="bg-gray-800 rounded-lg p-6 mt-6">
          <div class="flex items-center gap-3 mb-6">
            <SignOut size={26} weight="bold" class="text-primary" />
            <h2 class="font-display text-xl text-white">Session</h2>
          </div>

          <p class="text-muted-foreground mb-6 leading-relaxed">
            Signed in as <span class="text-foreground">{account.username}</span>
            ({account.email}). Logging out clears the saved session on this
            device, so you can sign in as someone else.
          </p>

          <PrimaryButton
            buttonText="Log Out"
            color="bg-white/10"
            on:click={handleLogout}
          />
        </div>
      {/if}
    </div>
  </div>
</div>

<AlertDialog
  bind:open={usernameChanged}
  title="Username changed"
  description="Your username has been updated. If the game is currently running, restart it to see the change."
/>
