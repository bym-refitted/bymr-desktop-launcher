<script lang="ts">
  import { Button } from "bits-ui";
  export let buttonText: string = "";
  export let width: string = "auto";
  export let color: string = "bg-secondary";
  export let disabled: boolean = false;
</script>

<Button.Root
  class="{color} {width} relative inline-flex h-12 items-center justify-center rounded-lg
    px-6 text-[15px] font-display text-white shadow-lg overflow-hidden
    hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] 
    transition-all duration-200 ease-out
    {disabled
    ? 'opacity-50 cursor-not-allowed hover:scale-100'
    : 'cursor-pointer'}
    before:absolute before:inset-0 before:bg-white/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity"
  on:click
  {disabled}
>
  <span class="relative z-10">{buttonText}</span>
</Button.Root>
