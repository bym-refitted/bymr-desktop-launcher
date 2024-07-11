<script lang="ts">
  import { getVersion } from "@tauri-apps/api/app";
  import "../app.pcss";
  import { onUpdaterEvent } from "@tauri-apps/api/updater";
  import {
    addErrorLog,
    addInfoLog,
    addSuccessLog,
    setupLogListeners,
  } from "$lib/stores/debugLogStore";
  import { invoke } from "@tauri-apps/api";
  import { onMount } from "svelte";
  import Loader from "$lib/components/svgs/Loader.svelte";
  import Toast from "$lib/components/Toast.svelte";
  import { hasLoaded, setLoaded } from "$lib/stores/loadState";
  import Titlebar from "$lib/components/Titlebar.svelte";

  let launcherVersion = "0.0.0";

  onMount(() => {
    // Handle launcher update events
    onUpdaterEvent(handleUpdaterEvent);
    // Set up the debug log listeners
    setupLogListeners();
    // Initialize the launcher
    initializeLauncher();
  });

  const initializeLauncher = async () => {
    try {
      launcherVersion = await getVersion();
      await invoke("initialize_app");
      addSuccessLog(`Launcher initialized! (▀̿Ĺ̯▀̿ ̿) 🚀`);
    } catch (error) {
      addErrorLog(`Error during launcher initialization: ${error}`);
    } finally {
      setLoaded();
    }
  };

  const handleUpdaterEvent = ({ error, status }) => {
    addInfoLog(
      `Launcher updater event: ${status ? status : ""} ${error ? error : ""}`
    );
  };
</script>

<!-- Custom Titlebar -->
<Titlebar />
<!-- Content -->
<div
  class="flex flex-col h-screen"
>
  <main
    class="flex-1 overflow-auto bg-background text-foreground flex flex-col antialiased select-none font-sans"
  >
    {#if !$hasLoaded}
      <div class="w-full h-full flex justify-center items-center" role="status">
        <Loader />
      </div>
    {:else}
      <slot />
    {/if}
  </main>
  <Toast {launcherVersion} />
</div>
