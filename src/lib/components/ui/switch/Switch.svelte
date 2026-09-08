<script lang="ts">
  import { Switch } from "bits-ui";

  export let checked: boolean = false;
  export let disabled: boolean = false;
  export let label: string = "";
  export let onCheckedChange: ((checked: boolean) => void) | undefined =
    undefined;
</script>

<Switch.Root
  bind:checked
  {disabled}
  {onCheckedChange}
  aria-label={label}
  class="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full
    border border-gray-600 bg-gray-700 px-0.5
    transition-colors duration-200 ease-out
    data-[state=checked]:bg-secondary data-[state=checked]:border-secondary
    {disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}"
>
  <Switch.Thumb
    class="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg
      transition-transform duration-200 ease-out
      translate-x-0 data-[state=checked]:translate-x-5"
  />
</Switch.Root>
