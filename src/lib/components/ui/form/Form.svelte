<script lang="ts">
  import { Select, Checkbox, Label } from "bits-ui";
  import CaretUpDown from "phosphor-svelte/lib/CaretUpDown";
  import Check from "phosphor-svelte/lib/Check";
  import WarningDiamond from "phosphor-svelte/lib/WarningDiamond";
  import Translate from "phosphor-svelte/lib/Translate";
  import Shield from "phosphor-svelte/lib/Shield";

  import PrimaryButton from "$lib/components/ui/button/PrimaryButton.svelte";
  import Tooltip from "../tooltip/Tooltip.svelte";
  import AlertDialog from "$lib/components/AlertDialog.svelte";
  import { flyAndScale } from "$lib/utils";
  import { Status } from "$lib/enums/StatusCodes";
  import { launchSwf } from "$lib/stores/launchStore";
  import { Protocol } from "$lib/enums/Protocol";
  import { Builds } from "$lib/enums/Builds";
  import {
    isUserRemembered,
    loadUserFromLocalStorage,
    removeUserFromLocalStorage,
    saveUserToLocalStorage,
    user,
  } from "$lib/stores/userStore";
  import {
    invokeApiRequest,
    type FormData,
  } from "../../../utils/invokeApiRequest";
  import { onMount } from "svelte";
  import { getAvailableLanguages } from "$lib/utils/getAvailableLanguages";
  import { addErrorLog } from "$lib/stores/debugLogStore";
  import {
    validateUsername,
    validateEmail,
    validatePassword,
    validateConfirmPassword,
  } from "./validation";
  import ArrowCircleLeft from "phosphor-svelte/lib/ArrowCircleLeft";
  import PaperPlaneTilt from "phosphor-svelte/lib/PaperPlaneTilt";
  import { Method } from "$lib/enums/Method";

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
  let connectionType = Protocol.HTTPS;
  const builds = [
    { value: Builds.STABLE, label: Protocol.HTTPS },
    { value: Builds.HTTP, label: Protocol.HTTP },
  ];

  const selectBuild = {
    [Builds.STABLE]: Protocol.HTTPS,
    [Builds.HTTP]: Protocol.HTTP,
  };

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
      const { status, data, token } = await invokeApiRequest(route, formData);

      if (isRegisterForm && status === Status.OK && data) {
        isRegisterForm = false;
        isRegistered = true;
        return;
      }

      if (status === Status.OK && token) {
        const build =
          connectionType === Protocol.HTTPS ? Builds.STABLE : Builds.HTTP;

        // Save user details to local storage
        const userSaveData = { language, token };
        if (isChecked) saveUserToLocalStorage(userSaveData);

        // Launch the SWF file
        const launchLanguage = $user.language || language;
        launchSwf(build, launchLanguage, token);
      }
    } catch (error) {
      errorMessage = error.message;
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
      errorMessage = error.message;
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
  bind:open={isRegistered}
  title="Registered successfully."
  description="You have successfully registered an account. Please login to continue."
/>

<AlertDialog
  bind:open={emailSent}
  title="Password Reset Email Sent"
  description="If the email you entered is registered, you will receive an email with instructions to reset your password shortly. Please make sure to check your spam folder."
  Icon={PaperPlaneTilt}
/>

<AlertDialog
  bind:open={isError}
  title="Oops!"
  description={errorMessage}
  Icon={WarningDiamond}
/>

<form
  method={Method.POST}
  on:submit={handleFormSubmit}
  class="flex flex-col gap-4 p-4 w-[450px]"
>
  {#if isRegisterForm}
    {#if !$isUserRemembered}
      <div class="flex items-center space-x-6">
        <input
          type="text"
          bind:value={username}
          on:focus={() => (focusStates.username = true)}
          id="username"
          name="username"
          class={`focus:outline-primary ${errors.username ? "focus:outline-red" : ""} w-full bg-white/10 h-10 rounded-md text-md px-6 placeholder-unselected focus:outline-none focus:bg-transparent focus:placeholder-white`}
          placeholder="Username"
          required
        />
        {#if errors.username && focusStates.username}
          <Tooltip
            tooltipText={errors.username}
            error={true}
            style="text-red"
            tipColor="bg-red"
            side="right"
            Icon={WarningDiamond}
          />
        {/if}
      </div>
    {/if}
  {/if}
  {#if hasForgotPassword}
    <button on:click={() => (hasForgotPassword = false)}>
      <ArrowCircleLeft
        size={30}
        weight="bold"
        class="text-primary cursor-pointer"
      />
    </button>
  {/if}
  {#if !$isUserRemembered}
    <div class="flex items-center space-x-6">
      <input
        type="email"
        bind:value={email}
        on:focus={() => (focusStates.email = true)}
        id="email"
        name="email"
        class={`${errors.email ? "focus:outline-red" : isRegisterForm ? "focus:outline-primary" : "focus:outline-secondary"} w-full bg-white/10 h-10 rounded-md text-md px-6 placeholder-unselected focus:outline-none focus:bg-transparent focus:placeholder-white`}
        placeholder="Email"
        required
      />
      {#if errors.email && focusStates.email}
        <Tooltip
          tooltipText={errors.email}
          error={true}
          style="text-red"
          tipColor="bg-red"
          side="right"
          Icon={WarningDiamond}
        />
      {/if}
    </div>
  {/if}
  {#if !$isUserRemembered}
    {#if !hasForgotPassword}
      <div class="flex items-center space-x-6">
        <input
          type="password"
          bind:value={password}
          on:focus={() => (focusStates.password = true)}
          id="password"
          name="password"
          class={`ms-reveal ${errors.password ? "focus:outline-red" : isRegisterForm ? "focus:outline-primary" : "focus:outline-secondary"} w-full bg-white/10 h-10 rounded-md text-md px-6 placeholder-unselected focus:outline-none focus:bg-transparent focus:placeholder-white`}
          placeholder="Password"
          required
        />
        {#if errors.password && focusStates.password}
          <Tooltip
            tooltipText={errors.password}
            error={true}
            style="text-red"
            tipColor="bg-red"
            side="right"
            Icon={WarningDiamond}
          />
        {/if}
      </div>
    {/if}
  {/if}
  {#if isRegisterForm}
    {#if !$isUserRemembered}
      <div class="flex items-center space-x-6">
        <input
          type="password"
          bind:value={confirmPassword}
          on:focus={() => (focusStates.confirmPassword = true)}
          id="confirm-password"
          name="confirm-password"
          class={`ms-reveal focus:outline-primary ${errors.confirmPassword ? "focus:outline-red" : ""} w-full bg-white/10 h-10 rounded-md text-md px-6 placeholder-unselected focus:outline-none focus:bg-transparent focus:placeholder-white`}
          placeholder="Confirm Password"
          required
        />
        {#if errors.confirmPassword && focusStates.confirmPassword}
          <Tooltip
            tooltipText={errors.confirmPassword}
            error={true}
            style="text-red"
            tipColor="bg-red"
            side="right"
            Icon={WarningDiamond}
          />
        {/if}
      </div>
    {/if}
  {/if}

  {#if !isRegisterForm}
    {#if !hasForgotPassword}
      <small class="mt-2">Settings</small>
      {#if !$isUserRemembered}
        <Select.Root
          items={languages}
          selected={{ value: language, label: language }}
          onSelectedChange={(e) => {
            language = e.label;
          }}
        >
          <Select.Trigger
            class="focus:outline-secondary w-full flex items-center justify-between bg-white/10 h-10 text-left rounded-md px-6 focus:outline-none focus:bg-transparent focus:text-white"
            aria-label="Language"
          >
            <div class="flex items-center">
              <Translate size={20} weight="bold" class="text-primary mr-3" />
              <Select.Value
                class="text-md placeholder-unselected text-unselected"
                placeholder={language}
              />
            </div>
            <CaretUpDown size={16} weight="bold" class="text-unselected" />
          </Select.Trigger>
          <Select.Content
            class="w-full rounded-xl border border-white/10 bg-background px-1 py-3 outline-none"
            transition={flyAndScale}
            sideOffset={8}
          >
            {#each languages as lang}
              <Select.Item
                class="data-[highlighted]:bg-secondary flex h-10 w-full select-none items-center rounded-button py-3 pl-5 pr-1.5 text-sm outline-none transition-all duration-75"
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
          connectionType = selectBuild[e.value];
        }}
      >
        <Select.Trigger
          class="focus:outline-secondary w-full flex items-center justify-between bg-white/10 h-10 text-left rounded-md px-6 focus:outline-none focus:bg-transparent focus:text-white"
          aria-label="Connection Type"
        >
          <div class="flex items-center">
            <Shield size={20} weight="bold" class="text-primary mr-3" />
            <Select.Value
              class="text-md text-unselected placeholder-unselected"
              placeholder="Connection Type"
            />
          </div>
          <CaretUpDown size={16} weight="bold" class="text-unselected" />
        </Select.Trigger>
        <Select.Content
          class="w-full rounded-xl border border-white/10 bg-background px-1 py-3 outline-none"
          transition={flyAndScale}
          sideOffset={8}
        >
          {#each builds as build}
            <Select.Item
              class="data-[highlighted]:bg-secondary flex h-10 w-full select-none items-center rounded-button py-3 pl-5 pr-1.5 text-sm outline-none transition-all duration-75"
              value={build.value}
              label={build.label.toUpperCase()}
            >
              {build.label.toUpperCase()}
              <Select.ItemIndicator class="ml-auto" asChild={false}
              ></Select.ItemIndicator>
            </Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
      <div class="flex items-center space-x-3 mt-4">
        {#if !$isUserRemembered}
          <Checkbox.Root
            id="remember-me-checkbox"
            aria-labelledby="remember-checkbox"
            class="bg-secondary peer inline-flex size-[25px] items-center justify-center rounded-sm border border-white/10 transition-all duration-150 ease-in-out active:scale-98 data-[state=unchecked]:border-border-input data-[state=unchecked]:bg-background"
            bind:checked={isChecked}
          >
            <Checkbox.Indicator let:isChecked>
              {#if isChecked}
                <Check size={15} weight="bold" />
              {/if}
            </Checkbox.Indicator>
          </Checkbox.Root>
          <div class="flex w-full justify-between items-center">
            <Label.Root
              id="remember-me-label"
              for="remember"
              class="text-md leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remember Me
            </Label.Root>
            <button
              type="button"
              class="text-md leading-none cursor-pointer hover:text-secondary"
              on:click={showForgotPassword}
            >
              <p class="cursor:pointer">Forgot password?</p>
            </button>
          </div>
        {/if}
      </div>
    {/if}
  {/if}
  <PrimaryButton
    on:click={handleButtonClick}
    buttonText={buttonText.toUpperCase()}
    color={isRegisterForm ? "bg-primary" : "bg-secondary"}
    disabled={isButtonDisabled}
  />
  {#if $isUserRemembered}
    <PrimaryButton
      on:click={() => {
        removeUserFromLocalStorage();
      }}
      buttonText={`Logout`.toUpperCase()}
      color="bg-btnDark"
    />
  {/if}
  {#if !$isUserRemembered}
    {#if !hasForgotPassword}
      <Label.Root
        id="register-label"
        for="register"
        class="text-md text-center pt-2 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        <div
          on:click={showRegisterForm}
          on:keydown={showRegisterForm}
          role="button"
          tabindex="0"
        >
          {#if isRegisterForm}
            Already have an account? <span class="text-primary">Login here</span
            >
          {:else}
            Don't have an account? <span class="text-secondary"
              >Register here</span
            >
          {/if}
        </div>
      </Label.Root>
    {/if}
  {/if}
</form>

<style>
  .ms-reveal::-ms-reveal {
    filter: invert(100%);
  }
</style>
