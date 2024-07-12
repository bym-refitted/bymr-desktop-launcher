<script lang="ts">
  import { Button } from "bits-ui";
  export let buttonText: string = "";
  export let width: string = "auto";
</script>

<Button.Root
  class="inline-flex h-12 items-center justify-center rounded-md bg-secondary
    px-[21px] text-[15px] font-display text-white shadow-mini
    hover:bg-dark/95 active:scale-98 active:transition-all"
  style="width: {width};"
>
  {buttonText}
</Button.Root>
