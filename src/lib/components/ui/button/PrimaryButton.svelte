<script lang="ts">
  import { Button } from "bits-ui";
  export let buttonText: string = "";
  export let width: string = "auto";
  export let color: string = "bg-secondary";
</script>

<Button.Root
  class="{color} {width} inline-flex h-12 items-center justify-center rounded-md
    px-[21px] text-[15px] font-display text-white shadow-mini
    hover:bg-dark/95 active:scale-98 active:transition-all"
    on:click
>
  {buttonText}
</Button.Root>
