<script lang="ts">
  import { Select, Checkbox, Label } from "bits-ui";
  import PrimaryButton from "$lib/components/ui/button/PrimaryButton.svelte";
  import { flyAndScale } from "$lib/utils";
  import CaretUpDown from "phosphor-svelte/lib/CaretUpDown";
  import Check from "phosphor-svelte/lib/Check";

  const builds = [
    { value: "bymr-stable", label: "HTTPS" },
    { value: "bymr-http", label: "HTTP" },
  ];

  let isChecked = false;
</script>

<form class="flex flex-col gap-4 p-4 w-[450px]">
  <input
    type="email"
    id="email"
    name="email"
    class="bg-white/10 h-10 rounded-md text-md px-6 placeholder-unselected focus:outline-none focus:outline-secondary focus:bg-transparent focus:placeholder-white"
    placeholder="Email"
  />

  <input
    type="password"
    id="password"
    name="password"
    class="bg-white/10 h-10 rounded-md text-md px-6 placeholder-unselected focus:outline-none focus:outline-secondary focus:bg-transparent focus:placeholder-white"
    placeholder="Password"
  />

  <Select.Root items={builds}>
    <Select.Trigger
      class="flex items-center justify-between bg-white/10 h-10 text-left rounded-md px-6 focus:outline-none focus:outline-secondary focus:bg-transparent focus:text-white"
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
          class="flex h-10 w-full select-none items-center rounded-button py-3 pl-5 pr-1.5 text-sm outline-none transition-all duration-75 data-[highlighted]:bg-secondary"
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

  <div class="flex items-center space-x-3">
    <Checkbox.Root
      id="terms"
      aria-labelledby="terms-label"
      class="peer inline-flex size-[25px] items-center justify-center rounded-sm border border-white/10 bg-secondary transition-all duration-150 ease-in-out active:scale-98 data-[state=unchecked]:border-border-input data-[state=unchecked]:bg-background"
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
  <PrimaryButton buttonText={`Login`.toUpperCase()} />
  <Label.Root
    id="register-label"
    for="register"
    class="text-md text-center pt-2 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  >
    Already have an account? <span class="text-secondary">Sign in</span>
  </Label.Root>
</form>
