<script lang="ts">
  import { Select, Checkbox, Label } from "bits-ui";
  import PrimaryButton from "$lib/components/ui/button/PrimaryButton.svelte";
  import Tooltip from "../tooltip/Tooltip.svelte";
  import AlertDialog from "$lib/components/AlertDialog.svelte";

  import { flyAndScale } from "$lib/utils";
  import { Status } from "$lib/enums/StatusCodes";
  import { launchSwf } from "$lib/stores/launchStore";
  import { Builds } from "$lib/enums/Builds";
  import { invokeApiRequest } from "../../../utils/invokeApiRequest";
  import { onMount } from "svelte";
  import { getAvailableLanguages } from "$lib/utils/getAvailableLanguages";
  import { Method } from "$lib/enums/Method";
  import { handleErrorMessage } from "$lib/errors/errorMessages";
  import { addErrorLog } from "$lib/stores/debugLogStore";
  import {
    isUserRemembered,
    loadUserFromLocalStorage,
    removeUserFromLocalStorage,
    saveUserToLocalStorage,
    user,
  } from "$lib/stores/userStore";
  import {
    validateUsername,
    validateEmail,
    validatePassword,
    validateConfirmPassword,
  } from "./validation";
  import {
    Package,
    PaperPlaneTilt,
    ArrowCircleLeft,
    Translate,
    WarningDiamond,
    Check,
    CaretUpDown,
  } from "phosphor-svelte";

  interface FormData {
    username?: string;
    email?: string;
    password?: string;
    token?: string;
  }

  // User details
  let username = "";
  let email = "";
  let password = "";
  let confirmPassword = "";

  // Form states
  let isRegisterForm = false;
  let isRegistered = false;
  let isChecked = false;
  let hasForgotPassword = false;
  let isButtonDisabled = false;
  let emailSent = false;
  let sessionExpired = false;

  // Form focus
  let focusStates = {
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  };

  // Form validation
  $: errors = {
    username: validateUsername(username),
    email: validateEmail(email),
    password: validatePassword(password),
    confirmPassword: validateConfirmPassword(
      password,
      confirmPassword,
      isRegisterForm
    ),
  };

  // Response errors
  let errorMessage = "";
  $: isError = errorMessage !== "";

  // Languages
  $: language = "English";
  let languages = [];

  // Builds
  $: selectedBuild = Builds.STABLE;
  const builds = Object.values(Builds).map((build) => ({
    value: build,
    label: build.charAt(0).toUpperCase() + build.slice(1).toLowerCase(),
  }));

  // Page init load
  onMount(() => {
    getAvailableLanguages()
      .then((languageSet) => {
        languages = [...languageSet];
        language = languages[0];

        if (
          typeof $user.language === "string" &&
          languageSet.has($user.language)
        ) {
          language = $user.language;
        }
      })
      .catch((errorMessage) => {
        addErrorLog(`Could not get available Languages:
      ${errorMessage}`);
      });

    // Load user from local storage
    loadUserFromLocalStorage();
  });

  const showRegisterForm = () => (isRegisterForm = !isRegisterForm);

  const showForgotPassword = () => (hasForgotPassword = !hasForgotPassword);

  const handleFormSubmit = async (e: Event) => {
    e.preventDefault();

    // Skip validation if the user is already remembered
    if ($isUserRemembered) {
      await authenticateUser();
      return;
    }

    // Otherwise, validate the form fields
    const hasErrors = isRegisterForm
      ? errors.username ||
        errors.email ||
        errors.password ||
        errors.confirmPassword
      : errors.email || errors.password;

    if (hasErrors) {
      // Update focus states for fields with errors
      Object.keys(focusStates).forEach((key) => (focusStates[key] = true));
      return;
    } else await authenticateUser();
  };

  const authenticateUser = async () => {
    const formData: FormData = { username, password };

    // User can be validated on the server by either email OR token
    if (!$isUserRemembered) {
      formData.email = email;
    } else {
      formData.token = $user.token;
    }

    const route = isRegisterForm ? "/player/register" : "/player/getinfo";
    try {
      const { status, data } = await invokeApiRequest<FormData>(
        route,
        formData
      );

      if (isRegisterForm && status === Status.OK && data) {
        isRegisterForm = false;
        isRegistered = true;
        return;
      }

      if (status === Status.OK && data.token) {
        // Save user details to local storage
        const userSaveData = { language, token: data.token };
        if (isChecked) saveUserToLocalStorage(userSaveData);

        // Launch the SWF file
        const launchLanguage = $user.language || language;
        launchSwf(selectedBuild, launchLanguage, data.token);
      }
    } catch (error) {
      // If user is remembered and there's an error, reset the user state
      if ($isUserRemembered) {
        removeUserFromLocalStorage();
        sessionExpired = true;
        return;
      }
      
      errorMessage = handleErrorMessage(error);
      addErrorLog(`Error during authentication: ${error.message}`);
    }
  };

  const handleForgotPassword = async () => {
    try {
      const { status } = await invokeApiRequest("/player/forgotPassword", {
        email,
      });

      if (status === Status.OK) emailSent = true;
    } catch (error) {
      errorMessage = handleErrorMessage(error);
      addErrorLog(`Error processing forgot password: ${error.message}`);
    }
  };

  const handleButtonClick = async (e: Event) => {
    isButtonDisabled = true;
    hasForgotPassword
      ? await handleForgotPassword()
      : await handleFormSubmit(e);

    setTimeout(() => {
      isButtonDisabled = false;
    }, 5000);
  };

  // Get button texts
  $: buttonText = (() => {
    switch (true) {
      case $isUserRemembered:
        return "Play";
      case hasForgotPassword:
        return "Send Email";
      case isRegisterForm:
        return "Register";
      default:
        return "Login";
    }
  })();
</script>

<AlertDialog
  bind:open={sessionExpired}
  title="Session Expired"
  error="Your saved session has expired. Please login again to continue."
  Icon={WarningDiamond}
/>

<AlertDialog
  bind:open={isRegistered}
  title="Registered successfully."
  description="You have successfully registered an account. Please login to continue."
/>

<AlertDialog
  bind:open={emailSent}
  title="Password Reset Email Sent"
  description="If the email you entered is registered, you will receive an email with instructions to reset your password shortly. The email expires in 10 minutes. Please make sure to check your spam folder."
  Icon={PaperPlaneTilt}
/>

<AlertDialog
  bind:open={isError}
  error={errorMessage}
  title="Oops! Something broke..."
  Icon={WarningDiamond}
/>

<form
  method={Method.POST}
  on:submit={handleFormSubmit}
  class="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-lg w-full transition-all duration-300 hover:border-white/20"
>
  <div class="mb-6 text-center">
    <h2 class="text-2xl font-title text-foreground mb-2">
      {#if $isUserRemembered}
        Welcome Back!
      {:else if isRegisterForm}
        Create Account
      {:else if hasForgotPassword}
        Reset Password
      {:else}
        Login to Play
      {/if}
    </h2>
    <p class="text-sm text-muted-foreground">
      {#if $isUserRemembered}
        Click below to jump back into the action
      {:else if isRegisterForm}
        Join the Backyard Monsters community
      {:else if hasForgotPassword}
        Enter your email to receive a reset link
      {:else}
        Enter your credentials to continue
      {/if}
    </p>
  </div>

  <!-- Form Fields -->
  <div class="flex flex-col gap-4">
    {#if isRegisterForm}
      {#if !$isUserRemembered}
        <div class="relative">
          <input
            type="text"
            bind:value={username}
            on:focus={() => (focusStates.username = true)}
            id="username"
            name="username"
            class={`${errors.username && focusStates.username ? "border-red/50 focus:border-red" : "border-white/10 focus:border-primary"} w-full bg-white/5 h-12 rounded-lg text-md px-4 border-2 placeholder-muted-foreground/50 focus:outline-none focus:bg-white/10 transition-all duration-200`}
            placeholder="Username"
            required
          />
          {#if errors.username && focusStates.username}
            <div class="flex items-start gap-2 mt-1.5 text-red text-xs">
              <WarningDiamond size={14} weight="bold" class="flex-shrink-0 mt-0.5" />
              <span>{errors.username}</span>
            </div>
          {/if}
        </div>
      {/if}
    {/if}
    {#if hasForgotPassword}
      <button 
        type="button"
        on:click={() => (hasForgotPassword = false)}
        class="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-2"
      >
        <ArrowCircleLeft size={20} weight="bold" />
        Back to login
      </button>
    {/if}
    
    {#if !$isUserRemembered}
      <div class="relative">
        <input
          type="email"
          bind:value={email}
          on:focus={() => (focusStates.email = true)}
          id="email"
          name="email"
          class={`${errors.email && focusStates.email ? "border-red/50 focus:border-red" : isRegisterForm ? "border-white/10 focus:border-primary" : "border-white/10 focus:border-secondary"} w-full bg-white/5 h-12 rounded-lg text-md px-4 border-2 placeholder-muted-foreground/50 focus:outline-none focus:bg-white/10 transition-all duration-200`}
          placeholder="Email"
          required
        />
        {#if errors.email && focusStates.email}
          <div class="flex items-start gap-2 mt-1.5 text-red text-xs">
            <WarningDiamond size={14} weight="bold" class="flex-shrink-0 mt-0.5" />
            <span>{errors.email}</span>
          </div>
        {/if}
      </div>
    {/if}
    {#if !$isUserRemembered}
      {#if !hasForgotPassword}
        <div class="relative">
          <input
            type="password"
            bind:value={password}
            on:focus={() => (focusStates.password = true)}
            id="password"
            name="password"
            class={`ms-reveal ${errors.password && focusStates.password ? "border-red/50 focus:border-red" : isRegisterForm ? "border-white/10 focus:border-primary" : "border-white/10 focus:border-secondary"} w-full bg-white/5 h-12 rounded-lg text-md px-4 border-2 placeholder-muted-foreground/50 focus:outline-none focus:bg-white/10 transition-all duration-200`}
            placeholder="Password"
            required
          />
          {#if errors.password && focusStates.password}
            <div class="flex items-start gap-2 mt-1.5 text-red text-xs">
              <WarningDiamond size={14} weight="bold" class="flex-shrink-0 mt-0.5" />
              <span>{errors.password}</span>
            </div>
          {/if}
        </div>
      {/if}
    {/if}
    
    {#if isRegisterForm}
      {#if !$isUserRemembered}
        <div class="relative">
          <input
            type="password"
            bind:value={confirmPassword}
            on:focus={() => (focusStates.confirmPassword = true)}
            id="confirm-password"
            name="confirm-password"
            class={`ms-reveal ${errors.confirmPassword && focusStates.confirmPassword ? "border-red/50 focus:border-red" : "border-white/10 focus:border-primary"} w-full bg-white/5 h-12 rounded-lg text-md px-4 border-2 placeholder-muted-foreground/50 focus:outline-none focus:bg-white/10 transition-all duration-200`}
            placeholder="Confirm Password"
            required
          />
          {#if errors.confirmPassword && focusStates.confirmPassword}
            <div class="flex items-start gap-2 mt-1.5 text-red text-xs">
              <WarningDiamond size={14} weight="bold" class="flex-shrink-0 mt-0.5" />
              <span>{errors.confirmPassword}</span>
            </div>
          {/if}
        </div>
      {/if}
    {/if}
  </div>

  <!-- Settings Section -->
  {#if !isRegisterForm && !hasForgotPassword}
    <div class="mt-6 pt-6 border-t border-white/10">
      <p class="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">Game Settings</p>
      <div class="flex flex-col gap-3">
        {#if !$isUserRemembered}
          <Select.Root
            items={languages}
            selected={{ value: language, label: language }}
            onSelectedChange={(e) => {
              language = e.label;
            }}
          >
            <Select.Trigger
              class="w-full flex items-center justify-between bg-white/5 border-2 border-white/10 h-11 text-left rounded-lg px-4 focus:outline-none focus:border-secondary hover:bg-white/10 transition-all duration-200"
              aria-label="Language"
            >
              <div class="flex items-center gap-3">
                <Translate size={20} weight="bold" class="text-secondary" />
                <Select.Value
                  class="text-sm text-foreground"
                  placeholder={language}
                />
              </div>
              <CaretUpDown size={16} weight="bold" class="text-muted-foreground" />
            </Select.Trigger>
            <Select.Content
              class="w-full rounded-xl border border-white/20 bg-background/95 backdrop-blur-xl px-1 py-3 shadow-2xl"
              transition={flyAndScale}
              sideOffset={8}
            >
              {#each languages as lang}
                <Select.Item
                  class="data-[highlighted]:bg-secondary/20 flex h-10 w-full select-none items-center rounded-lg py-3 pl-5 pr-1.5 text-sm outline-none transition-all duration-150 cursor-pointer"
                  value={lang.value}
                  label={lang}
                >
                  {lang}
                  <Select.ItemIndicator class="ml-auto" asChild={false}
                  ></Select.ItemIndicator>
                </Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        {/if}
        
        <Select.Root
          items={builds}
          onSelectedChange={(e) => {
            selectedBuild = e.value;
          }}
        >
          <Select.Trigger
            class="w-full flex items-center justify-between bg-white/5 border-2 border-white/10 h-11 text-left rounded-lg px-4 focus:outline-none focus:border-secondary hover:bg-white/10 transition-all duration-200"
            aria-label="Build"
          >
            <div class="flex items-center gap-3">
              <Package size={20} weight="bold" class="text-secondary" />
              <Select.Value
                class="text-sm text-foreground"
                placeholder="Build"
              />
            </div>
            <CaretUpDown size={16} weight="bold" class="text-muted-foreground" />
          </Select.Trigger>
          <Select.Content
            class="w-full rounded-xl border border-white/20 bg-background/95 backdrop-blur-xl px-1 py-3 shadow-2xl"
            transition={flyAndScale}
            sideOffset={8}
          >
            {#each builds as build}
              <Select.Item
                class="data-[highlighted]:bg-secondary/20 flex h-10 w-full select-none items-center rounded-lg py-3 pl-5 pr-1.5 text-sm outline-none transition-all duration-150 cursor-pointer"
                value={build.value}
                label={build.label}
              >
              {build.label}
              <Select.ItemIndicator class="ml-auto" asChild={false}
                ></Select.ItemIndicator>
              </Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>

      {#if !$isUserRemembered}
        <div class="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <div class="flex items-center gap-3">
            <Checkbox.Root
              id="remember-me-checkbox"
              aria-labelledby="remember-checkbox"
              class="peer inline-flex size-5 items-center justify-center rounded border-2 border-white/20 bg-white/5 transition-all duration-150 ease-in-out hover:bg-white/10 active:scale-95 data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
              bind:checked={isChecked}
            >
              <Checkbox.Indicator let:isChecked>
                {#if isChecked}
                  <Check size={14} weight="bold" class="text-white" />
                {/if}
              </Checkbox.Indicator>
            </Checkbox.Root>
            <Label.Root
              id="remember-me-label"
              for="remember"
              class="text-sm cursor-pointer select-none"
            >
              Remember Me
            </Label.Root>
          </div>
          <button
            type="button"
            class="text-sm text-muted-foreground hover:text-secondary transition-colors underline underline-offset-2"
            on:click={showForgotPassword}
          >
            Forgot password?
          </button>
        </div>
      {/if}
    </div>
  {/if}
  <!-- Action Buttons -->
  <div class="flex flex-col gap-3 mt-6">
    <PrimaryButton
      on:click={handleButtonClick}
      buttonText={buttonText.toUpperCase()}
      color={isRegisterForm ? "bg-primary" : "bg-secondary"}
      disabled={isButtonDisabled}
    />
    
    {#if $isUserRemembered}
      <button
        type="button"
        on:click={() => {
          removeUserFromLocalStorage();
        }}
        class="w-full h-12 rounded-lg bg-white/5 border-2 border-white/10 font-display uppercase text-sm font-semibold text-muted-foreground hover:bg-white/10 hover:text-foreground hover:border-white/20 transition-all duration-200 active:scale-98"
      >
        Logout
      </button>
    {/if}
  </div>

  <!-- Toggle Login/Register -->
  {#if !$isUserRemembered && !hasForgotPassword}
    <div class="mt-6 pt-6 border-t border-white/10 text-center">
      <button
        type="button"
        on:click={showRegisterForm}
        class="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {#if isRegisterForm}
          Already have an account? <span class="text-primary font-semibold underline underline-offset-2">Login here</span>
        {:else}
          Don't have an account? <span class="text-secondary font-semibold underline underline-offset-2">Register here</span>
        {/if}
      </button>
    </div>
  {/if}
</form>

<style>
  .ms-reveal::-ms-reveal {
    filter: invert(100%);
  }
</style>
