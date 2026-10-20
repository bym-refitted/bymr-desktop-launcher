<script lang="ts">
  import "./layout.css";
  import { onMount } from "svelte";
  import { Tooltip } from "bits-ui";
  import LoaderCircle from "@lucide/svelte/icons/loader-circle";
  import { page } from "$app/state";
  import brain from "#lib/assets/art/brain.png";
  import StatusFooter from "#lib/components/shell/StatusFooter.svelte";
  import TopBar from "#lib/components/shell/TopBar.svelte";
  import AlertDialog from "#lib/components/ui/AlertDialog.svelte";
  import { pages } from "#lib/nav.js";
  import { startLauncher } from "#lib/startup.js";
  import { app } from "#lib/state/app.svelte.js";
  import { Build, build } from "#lib/state/build.svelte.js";
  import { session } from "#lib/state/session.svelte.js";  import type { LayoutProps } from "./$types";

  let { children }: LayoutProps = $props();

  const currentIndex = $derived(pages.findIndex((p) => p.href === page.url.pathname));

  onMount(startLauncher);
</script>

<svelte:head>
  <title>Backyard Monsters: Refitted | Launcher</title>
</svelte:head>

<Tooltip.Provider delayDuration={300}>
  <div class="flex h-full flex-col">
    <TopBar />

    <div
      class="mx-8 flex min-h-0 flex-1 flex-col border-x max-[1100px]:mx-0 max-[1100px]:border-x-0"
    >
      <div
        class="flex h-10 shrink-0 items-center justify-between border-b px-7 text-[12.5px] text-muted-foreground"
      >
        <span>
          {#if currentIndex >= 0}
            <span class="num">{String(currentIndex + 1).padStart(2, "0")}</span>
            <span class="mx-2 opacity-40">/</span>
            <b class="font-semibold text-foreground">
              {pages[currentIndex].label}
            </b>
          {/if}
        </span>
        <span>
          {build.selected === Build.local
            ? `Local server ${build.host}:${build.port}`
            : "Online server"}
          <span class="mx-1.5 opacity-40">·</span>
          Game v{app.gameVersion}
          <span class="mx-1.5 opacity-40">·</span>
          Launcher v{app.launcherVersion}
        </span>
      </div>

      <main class="relative min-h-0 flex-1">
        {#if app.loaded}
          {@render children()}
        {:else}
          <div class="grid h-full place-items-center">
            <LoaderCircle class="size-8 animate-spin text-primary" />
          </div>
        {/if}
      </main>

      <StatusFooter />
    </div>
  </div>
</Tooltip.Provider>

<AlertDialog
  bind:open={session.expired}
  label="Session"
  buttonLabel="Sign in again"
  title="Session expired"
  description="You were away long enough for your session to wander off. Sign in again to get back to your yard."
  art={brain}
/>
