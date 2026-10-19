<script lang="ts">
  import Moon from "@lucide/svelte/icons/moon";
  import Sun from "@lucide/svelte/icons/sun";
  import Button from "#lib/components/ui/Button.svelte";
  import { theme, toggleTheme } from "#lib/state/theme.svelte.js";

  const label = $derived(
    theme.current === "dark" ? "Switch to light theme" : "Switch to dark theme",
  );
</script>

<Button
  variant="ghost"
  size="icon"
  onclick={toggleTheme}
  aria-label={label}
  title={label}
>
  {#if theme.current === "dark"}
    <Sun />
  {:else}
    <Moon />
  {/if}
</Button>
