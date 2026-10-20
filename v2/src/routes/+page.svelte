<script lang="ts">
  import AuthPanel from "#lib/components/home/AuthPanel.svelte";
  import Hero from "#lib/components/home/Hero.svelte";
  import ReadyPanel from "#lib/components/home/ReadyPanel.svelte";
  import AlertDialog from "#lib/components/ui/AlertDialog.svelte";
  import { launch } from "#lib/state/launch.svelte.js";
  import { user } from "#lib/state/user.svelte.js";
</script>

<div class="grid h-full grid-cols-[1fr_400px] max-[1100px]:grid-cols-[1fr_370px]">
  <Hero />

  <section class="min-h-0 bg-card">
    {#if user.token}
      <ReadyPanel />
    {:else}
      <AuthPanel />
    {/if}
  </section>
</div>

<AlertDialog bind:open={launch.failed} label="Launch failed" error title="Couldn't start the game" description={launch.message} />
