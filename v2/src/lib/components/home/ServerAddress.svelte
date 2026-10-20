<script lang="ts">
  import ShieldAlert from "@lucide/svelte/icons/shield-alert";
  import TextField from "#lib/components/ui/TextField.svelte";
  import { Build, build } from "#lib/state/build.svelte.js";

  let touched = $state(false);

  /**
   * Shows any problem with the address once the player leaves the field, and remembers it for next time.
   */
  const finishEditing = () => {
    touched = true;
    build.rememberServerUrl();
  };
</script>

{#if build.selected === Build.local}
  <TextField
    label="Server address"
    bind:value={build.serverUrl}
    placeholder="http://localhost:3001"
    autocomplete="off"
    spellcheck={false}
    error={touched ? build.serverUrlError : ""}
    onblur={finishEditing}
  />
  <p class="flex gap-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
    <ShieldAlert class="mt-0.5 size-3.5 shrink-0 text-warning" />
    Only connect to servers you trust. The server's owner can see your login, so don't reuse your official password.
  </p>
{/if}
