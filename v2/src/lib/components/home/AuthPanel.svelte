<script lang="ts">
  import { onMount } from "svelte";
  import { Select } from "bits-ui";
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import Check from "@lucide/svelte/icons/check";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import Play from "@lucide/svelte/icons/play";
  import { z } from "zod";
  import { getLanguages, register, requestPasswordReset } from "#lib/api/auth.js";
  import { toErrorMessage } from "#lib/api/errors.js";
  import { signIn } from "#lib/api/session.js";
  import eyera from "#lib/assets/art/eyera.png";
  import ServerFields from "#lib/components/home/ServerFields.svelte";
  import AlertDialog from "#lib/components/ui/AlertDialog.svelte";
  import Button from "#lib/components/ui/Button.svelte";
  import TabBar from "#lib/components/ui/TabBar.svelte";
  import TextField from "#lib/components/ui/TextField.svelte";
  import { Credentials, Registration, ResetRequest } from "#lib/schemas.js";
  import { launch } from "#lib/state/launch.svelte.js";
  import { logs } from "#lib/state/logs.svelte.js";
  import { session } from "#lib/state/session.svelte.js";
  import { user } from "#lib/state/user.svelte.js";

  const Mode = {
    signin: "signin",
    register: "register",
    forgot: "forgot",
  } as const;

  type Mode = (typeof Mode)[keyof typeof Mode];
  type Field = "username" | "email" | "password" | "confirmPassword";

  const schemas = { [Mode.signin]: Credentials, [Mode.register]: Registration, [Mode.forgot]: ResetRequest };

  const tabs = [
    { value: Mode.signin, label: "Sign in" },
    { value: Mode.register, label: "Create account" },
  ];

  const labels = { [Mode.signin]: "Sign in & Play", [Mode.register]: "Create account", [Mode.forgot]: "Send reset link" };

  let mode = $state<Mode>(Mode.signin);
  let form = $state({ username: "", email: "", password: "", confirmPassword: "" });
  let touched = $state<Partial<Record<Field, boolean>>>({});
  let remember = $state(false);
  let languages = $state(["English"]);
  let language = $state("English");
  let busy = $state(false);
  let error = $state("");
  let registered = $state(false);
  let resetSent = $state(false);

  const result = $derived(schemas[mode].safeParse(form));

  const fieldErrors = $derived(
    result.success ? {} : (z.flattenError(result.error).fieldErrors as Partial<Record<Field, string[]>>),
  );

  /**
   * The first validation message for a field, once the player has left it or tried to submit.
   *
   * @param {Field} field - The form field to check.
   * @returns {string | undefined} The message to show, if any.
   */
  const errorFor = (field: Field) => (touched[field] ? fieldErrors[field]?.[0] : undefined);

  /**
   * Switches between signing in, creating an account and resetting a password.
   *
   * @param {Mode} next - The view to show.
   */
  const switchMode = (next: Mode) => {
    mode = next;
    touched = {};
    error = "";
  };

  /**
   * Validates the form for the current view, then signs in and launches, registers, or requests a reset email.
   *
   * @param {SubmitEvent} event - The form's submit event.
   * @returns {Promise<void>} Resolves once the request has finished or failed.
   */
  const submit = async (event: SubmitEvent) => {
    event.preventDefault();
    touched = { username: true, email: true, password: true, confirmPassword: true };

    if (!result.success) return;

    busy = true;
    error = "";

    try {
      if (mode === Mode.register) {
        await register(Registration.parse(form));
        registered = true;
        switchMode(Mode.signin);
      } else if (mode === Mode.forgot) {
        await requestPasswordReset(ResetRequest.parse(form).email);
        resetSent = true;
        switchMode(Mode.signin);
      } else {
        const token = await signIn(Credentials.parse(form), language, remember);
        await launch.start(token, language);
      }
    } catch (failure) {
      logs.error(`Could not ${labels[mode].toLowerCase()}: ${toErrorMessage(failure)}`);

      if (!session.expired) error = toErrorMessage(failure);
    } finally {
      busy = false;
    }
  };

  onMount(() => {
    getLanguages()
      .then((available) => {
        languages = available;
        language = available.includes(user.language) ? user.language : available[0];
      })
      .catch((failure) => logs.error(`Could not load the available languages: ${toErrorMessage(failure)}`));
  });
</script>

<form class="flex h-full flex-col" onsubmit={submit} novalidate>
  <TabBar options={tabs} bind:value={() => (mode === Mode.forgot ? Mode.signin : mode), switchMode} class="h-[46px] border-b px-7" />

  <div class="grid min-h-0 flex-1 content-start gap-3 overflow-auto px-7 py-5">
    {#if mode === Mode.forgot}
      <button
        type="button"
        class="flex w-fit items-center gap-1.5 text-[13px] font-medium text-primary hover:underline"
        onclick={() => switchMode(Mode.signin)}
      >
        <ArrowLeft class="size-4" />Back to sign in
      </button>
      <p class="text-muted-foreground">Lost your keys to the yard? Enter your email and we'll send a reset link.</p>
    {/if}

    {#if mode === Mode.register}
      <TextField
        label="Username"
        bind:value={form.username}
        onblur={() => (touched.username = true)}
        error={errorFor("username")}
        placeholder="MonsterMasher"
        autocomplete="username"
      />
    {/if}

    <TextField
      label="Email"
      type="email"
      bind:value={form.email}
      onblur={() => (touched.email = true)}
      error={errorFor("email")}
      placeholder="you@example.com"
      autocomplete="email"
    />

    {#if mode === Mode.signin}
      <TextField
        label="Password"
        type="password"
        bind:value={form.password}
        onblur={() => (touched.password = true)}
        error={errorFor("password")}
        autocomplete="current-password"
      >
        {#snippet aside()}
          <button type="button" class="font-medium text-primary hover:underline" onclick={() => switchMode(Mode.forgot)}>
            Forgot?
          </button>
        {/snippet}
      </TextField>
    {:else if mode === Mode.register}
      <div class="grid grid-cols-2 gap-2.5">
        <TextField
          label="Password"
          type="password"
          bind:value={form.password}
          onblur={() => (touched.password = true)}
          error={errorFor("password")}
          autocomplete="new-password"
        />
        <TextField
          label="Confirm"
          type="password"
          bind:value={form.confirmPassword}
          onblur={() => (touched.confirmPassword = true)}
          error={errorFor("confirmPassword")}
          autocomplete="new-password"
        />
      </div>
    {/if}

    {#if mode !== Mode.forgot}
      <div class="grid grid-cols-[1fr_136px] items-start gap-2.5">
        <div class="grid gap-2.5">
          <ServerFields />
        </div>
        <div class="grid min-w-0 gap-1.5">
          <span class="text-[12.5px] font-medium text-muted-foreground">Language</span>
          <Select.Root type="single" bind:value={language} items={languages.map((name) => ({ value: name, label: name }))}>
            <Select.Trigger
              class="flex h-10 min-w-0 items-center justify-between gap-2 rounded-lg border border-border-strong bg-sunken px-3 text-left outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20"
              aria-label="Language"
            >
              <span class="truncate">{language}</span>
              <ChevronDown class="size-4 shrink-0 text-muted-foreground" />
            </Select.Trigger>
            <Select.Portal>
              <Select.Content
                sideOffset={4}
                class="z-50 max-h-64 w-(--bits-select-anchor-width) min-w-36 rounded-lg border border-border-strong bg-card p-1 shadow-xl"
              >
                <Select.Viewport>
                  {#each languages as name (name)}
                    <Select.Item
                      value={name}
                      label={name}
                      class="flex cursor-pointer items-center justify-between rounded-md px-2.5 py-2 text-sm text-muted-foreground outline-none data-highlighted:bg-accent data-highlighted:text-foreground"
                    >
                      {#snippet children({ selected })}
                        {name}
                        {#if selected}<Check class="size-4 text-primary" />{/if}
                      {/snippet}
                    </Select.Item>
                  {/each}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
      </div>
    {/if}

    {#if mode === Mode.signin}
      <label class="flex w-fit cursor-pointer items-center gap-2 text-[13px] text-muted-foreground">
        <input type="checkbox" bind:checked={remember} class="size-4 accent-primary" />
        Remember me
      </label>
    {/if}
  </div>

  <div class="grid gap-2.5 px-7 pb-5">
    {#if error}
      <p class="text-[13px] text-destructive" role="alert">{error}</p>
    {/if}
    <Button type="submit" size="lg" variant={mode === Mode.register ? "secondary" : "default"} disabled={busy || launch.launching}>
      {#if mode === Mode.signin}<Play class="fill-current" />{/if}
      {busy ? "Please wait..." : labels[mode]}
    </Button>
  </div>
</form>

<AlertDialog
  bind:open={registered}
  label="Account"
  title="Account created"
  description="Welcome to the yard! Verify your account on our Discord server to finish setting up, then sign in to play."
  art={eyera}
/>

<AlertDialog
  bind:open={resetSent}
  label="Password reset"
  title="Check your email"
  description="If that email is registered, a reset link is on its way. It expires in 20 minutes, so check your spam folder too."
/>
