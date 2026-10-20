<script lang="ts">
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
{/if}
