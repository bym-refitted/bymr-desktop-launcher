<script lang="ts">
  import "../app.pcss";

  import { getVersion } from "@tauri-apps/api/app";
  import { check } from "@tauri-apps/plugin-updater";
  import { relaunch } from "@tauri-apps/plugin-process";
  import {
    addErrorLog,
    addInfoLog,
    addSuccessLog,
    setupLogListeners,
  } from "$lib/stores/debugLogStore";
  import { invoke } from "@tauri-apps/api/core";
  import { onMount } from "svelte";
  import Toast from "$lib/components/Toast.svelte";
  import {
    currentGameVersion,
    hasLoaded,
    setLoaded,
  } from "$lib/stores/loadState";
  import Titlebar from "$lib/components/Titlebar.svelte";
  import TabView from "$lib/components/ui/tabs/TabView.svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import Loader from "$lib/components/Loader.svelte";

  let launcherVersion = "0.0.0";

  onMount(async () => {
    // Handle launcher update events
    const update = await check();

    if (update?.available) {
      await update.downloadAndInstall();
      await relaunch();
    }
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
        <Loader size={3} />
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
