<script lang="ts">
  import Play from "@lucide/svelte/icons/play";
  import { toErrorMessage } from "#lib/api/errors.js";
  import { refreshSession, signOut } from "#lib/api/session.js";
  import ServerAddress from "#lib/components/home/ServerAddress.svelte";
  import ServerPicker from "#lib/components/home/ServerPicker.svelte";
  import Avatar from "#lib/components/ui/Avatar.svelte";
  import Button from "#lib/components/ui/Button.svelte";
  import { build } from "#lib/state/build.svelte.js";
  import { launch } from "#lib/state/launch.svelte.js";
  import { logs } from "#lib/state/logs.svelte.js";
  import { session } from "#lib/state/session.svelte.js";
  import { user } from "#lib/state/user.svelte.js";

  let loading = $state(false);
  let error = $state("");

  const language = $derived(user.language || "English");

  /**
   * Renews the session for a fresh token, then launches the game with it.
   *
   * @returns {Promise<void>} Resolves once the game has started or something failed.
   */
  const play = async () => {
    loading = true;
    error = "";

    try {
      const token = await refreshSession();
      await launch.start(token, language);
    } catch (failure) {
      logs.error(`Could not start playing: ${toErrorMessage(failure)}`);

      if (!session.expired) error = toErrorMessage(failure);
    } finally {
      loading = false;
    }
  };
</script>

<div class="flex h-full flex-col">
  <div class="flex h-[46px] items-center border-b px-7">
    <span class="-mb-px flex h-full items-center border-b-2 border-primary text-[13.5px] font-semibold">Ready to play</span>
  </div>

  <div class="grid min-h-0 flex-1 content-start gap-4 overflow-auto px-7 py-5">
    <div class="flex items-center gap-3.5">
      <Avatar src={user.avatar} class="size-14 rounded-xl" />
      <div>
        <p class="eyebrow">Welcome back</p>
        <p class="display text-3xl">{user.username || "Player"}</p>
      </div>
    </div>

    <dl class="border-t text-[13px]">
      <div class="flex h-10 items-center justify-between border-b">
        <dt class="text-muted-foreground">Language</dt>
        <dd class="font-medium">{language}</dd>
      </div>
      <div class="flex h-10 items-center justify-between border-b">
        <dt class="text-muted-foreground">Remembered on this device</dt>
        <dd class="font-medium">{user.remembered ? "Yes" : "No"}</dd>
      </div>
    </dl>

    <ServerPicker />
    <ServerAddress />
  </div>

  <div class="grid gap-2 px-7 pb-5">
    {#if error}
      <p class="text-[13px] text-destructive" role="alert">{error}</p>
    {/if}
    <Button size="lg" onclick={play} disabled={loading || launch.launching || !!build.serverUrlError}>
      <Play class="fill-current" />
      {loading || launch.launching ? "Launching..." : "Play"}
    </Button>
    <Button variant="outline" onclick={signOut} disabled={loading}>Sign out</Button>
  </div>
</div>
