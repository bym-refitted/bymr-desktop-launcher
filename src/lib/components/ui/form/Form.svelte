<script lang="ts">
  import { Select, Checkbox, Label } from "bits-ui";
  import CaretUpDown from "phosphor-svelte/lib/CaretUpDown";
  import Check from "phosphor-svelte/lib/Check";
  import WarningDiamond from "phosphor-svelte/lib/WarningDiamond";

  import PrimaryButton from "$lib/components/ui/button/PrimaryButton.svelte";
  import Tooltip from "../tooltip/Tooltip.svelte";
  import AlertDialog from "$lib/components/AlertDialog.svelte";

  import { flyAndScale } from "$lib/utils";
  import { invokeApiRequest, type FormData } from "./invokeApiRequest";
  import { Status } from "$lib/enums/StatusCodes";
  import { launchSwf } from "$lib/stores/launchStore";
  import { Protocol } from "$lib/enums/Protocol";
  import { Builds } from "$lib/enums/Builds";

  let username = "";
  let email = "";
  let password = "";
  let confirmPassword = "";
  let connectionType = Protocol.HTTPS;
  let isRegisterForm = false;
  let isRegistered = false;
  let isChecked = false;

  let focusStates = {
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  };

  let errors = {
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  };

  const builds = [
    { value: Builds.STABLE, label: Protocol.HTTPS },
    { value: Builds.HTTP, label: Protocol.HTTP },
  ];

  const selectBuild = {
    [Builds.STABLE]: Protocol.HTTPS,
    [Builds.HTTP]: Protocol.HTTP,
  };

  // Form validation
  $: {
    if (username.length < 2) {
      errors.username = "Usernames must be at least 2 characters long";
    } else if (username.length > 12) {
      errors.username = "Usernames cannot be longer than 12 characters";
    } else {
      errors.username = "";
    }
  }

  $: {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = "Please enter a valid email address";
    } else {
      errors.email = "";
    }
  }

  $: {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!passwordRegex.test(password)) {
      errors.password =
        "Password must be at least 8 characters long, contain at least 1 uppercase letter, and 1 special character";
    } else {
      errors.password = "";
    }
  }

  $: {
    if (isRegisterForm && confirmPassword !== password) {
      errors.confirmPassword = "Passwords do not match";
    } else {
      errors.confirmPassword = "";
    }
  }

  const showRegisterForm = () => (isRegisterForm = !isRegisterForm);

  const handleFormSubmit = async (e: Event) => {
    e.preventDefault();
    const hasErrors = isRegisterForm
      ? errors.username ||
        errors.email ||
        errors.password ||
        errors.confirmPassword
      : errors.email || errors.password;

    if (hasErrors) return;
    await authenticateUser();
  };

  const authenticateUser = async () => {
    const formData: FormData = { username, email, password };
    if (isRegisterForm) formData.username = username;
    const route = isRegisterForm ? "player/register" : "player/getinfo";

    try {
      const { status, data, token } = await invokeApiRequest(route, formData);

      if (isRegisterForm && status === Status.OK && data) {
        isRegisterForm = false;
        isRegistered = true;
        return;
      }

      if (status === Status.OK && token) {
        const build = connectionType === Protocol.HTTPS ? Builds.STABLE : Builds.HTTP;

        launchSwf(build, token);
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      // TODO: Handle errors (e.g., show error message to the user)
      // Server should return appropriate error messages
      // e.g. username has been taken, account exists, account not found, etc.
    }
  };
</script>

<AlertDialog bind:open={isRegistered} title="🚀 Registered successfully!" />
<form
  method="POST"
  on:submit={handleFormSubmit}
  class="flex flex-col gap-4 p-4 w-[450px]"
>
  {#if isRegisterForm}
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
  {#if isRegisterForm}
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

  {#if !isRegisterForm}
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
        <Select.Value
          class="text-md text-unselected"
          placeholder="Connection Type"
        />
        <CaretUpDown size={16} weight="bold" />
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

    <div class="flex items-center space-x-3">
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
      <Label.Root
        id="remember-me-label"
        for="remember"
        class="text-md leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Remember Me
      </Label.Root>
    </div>
  {/if}
  <PrimaryButton
    on:click={handleFormSubmit}
    buttonText={(isRegisterForm ? "Register" : "Login").toUpperCase()}
    color={isRegisterForm ? "bg-primary" : "bg-secondary"}
  />
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
        Already have an account? <span class="text-primary">Login here</span>
      {:else}
        Don't have an account? <span class="text-secondary">Register here</span>
      {/if}
    </div>
  </Label.Root>
</form>

<style>
  .ms-reveal::-ms-reveal {
    filter: invert(100%);
  }
</style>
