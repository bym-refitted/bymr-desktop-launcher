<script lang="ts">
  import Moon from "@lucide/svelte/icons/moon";
  import Sun from "@lucide/svelte/icons/sun";
  import { theme } from "#lib/state/theme.svelte.js";

  const label = $derived(
    theme.current === "dark" ? "Switch to light theme" : "Switch to dark theme",
  );
</script>

<button
  class="grid w-12 place-items-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
  onclick={() => theme.toggle()}
  aria-label={label}
  title={label}
>
  {#if theme.current === "dark"}
    <Sun class="size-4" />
  {:else}
    <Moon class="size-4" />
  {/if}
</button>
