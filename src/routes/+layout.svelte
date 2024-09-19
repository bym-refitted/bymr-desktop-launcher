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
  import {
    currentGameVersion,
    hasLoaded,
    setLoaded,
  } from "$lib/stores/loadState";
  import Titlebar from "$lib/components/Titlebar.svelte";
  import TabView from "$lib/components/ui/tabs/TabView.svelte";
  import Navbar from "$lib/components/Navbar.svelte";

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
      const [launcherVersionManifest, currentGameVersionManifest, _] =
        await Promise.all([
          getVersion(),
          invoke<string>("get_current_game_version"),
          invoke("initialize_app"),
        ]);

      launcherVersion = launcherVersionManifest;
      currentGameVersion.set(currentGameVersionManifest);

      addSuccessLog(`Launcher initialized! 🚀`);
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
<div class="flex flex-col h-screen">
  <main
    class="flex-1 overflow-auto bg-background text-foreground flex flex-col antialiased select-none font-sans"
  >
    {#if !$hasLoaded}
      <div class="w-full h-full flex justify-center items-center" role="status">
        <Loader />
      </div>
    {:else}
      <TabView>
        <Navbar />
        <slot />
      </TabView>
    {/if}
  </main>
  <Toast {launcherVersion} />
</div>
