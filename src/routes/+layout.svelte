<script lang="ts">
  import Navbar from "$lib/components/Navbar.svelte";
  import { getVersion } from "@tauri-apps/api/app";
  import "../app.pcss";
  import Footer from "$lib/components/Footer.svelte";
  import { onUpdaterEvent } from "@tauri-apps/api/updater";
  import {
    addErrorLog,
    addInfoLog,
    addSuccessLog,
    setupLogListeners,
  } from "$lib/stores/debugLogStore";
  import { invoke } from "@tauri-apps/api";
  import { onMount } from "svelte";
  import Loader from "../../src/assets/svgs/Loader.svelte";

  let launcherVersion = "0.0.0";
  let loading = true;

  onMount(() => {
    // Handle launcher update events
    onUpdaterEvent(handleUpdaterEvent);
    // Set up the debug log listeners
    setupLogListeners();
    // Initialize the launcher
    initializeLauncher();
  });

  async function initializeLauncher() {
    try {
      launcherVersion = await getVersion();
      await invoke("initialize_app");
      addSuccessLog(`Launcher initialized! (▀̿Ĺ̯▀̿ ̿) 🚀`);
    } catch (error) {
      addErrorLog(`Error during launcher initialization: ${error}`);
    } finally {
      loading = false;
    }
  }

  function handleUpdaterEvent({ error, status }) {
    addInfoLog(
      `Launcher updater event: ${status ? status : ""} ${error ? error : ""}`
    );
  }
</script>

<div class="flex flex-col h-screen">
  <main
    class="flex-1 overflow-auto bg-background text-foreground flex flex-col gap-4 p-4 antialiased select-none font-sans"
  >
    <Navbar />
    {#if loading}
      <div class="w-full h-full flex justify-center items-center" role="status">
        <Loader />
      </div>
    {:else}
      <slot />
    {/if}
  </main>
  <Footer {launcherVersion}></Footer>
</div>
