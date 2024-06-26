<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Select from "$lib/components/ui/select";
  import { Loader2 } from "lucide-svelte";
  import AlertDialog from "$lib/components/AlertDialog.svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import Loader from "../../src/assets/svgs/Loader.svelte";
  import RustLogo from "../../src/assets/images/rust.png";

  import { exit } from "@tauri-apps/api/process";
  import { listen } from "@tauri-apps/api/event";
  import { invoke } from "@tauri-apps/api/tauri";

  import {
    onUpdaterEvent,
  } from "@tauri-apps/api/updater";

  interface Build {
    value: string;
    label: string;
  }

  interface Runtime {
    value: string;
    label: string;
  }

  interface InfoLogEvent {
    message: string;
  }

  interface InitialLoadEvent {
    manifest: {
      builds: { [key: string]: any };
      flashRuntimes: { [key: string]: string };
      currentGameVersion: string;
      currentLauncherVersion: string;
    };
    platform: string;
  }

  // Dynamically set during initialLoad event
  let builds: Build[] = [];
  let build: Build;
  let runtime: Runtime;
  let runtimes: Runtime[] = [];
  let current_game_version = "";

  // Debug Variables
  let disabled = true;
  let showError = false;
  let errorCode = "";
  let debugLogs: string[] = [];

  onUpdaterEvent(({ error, status }) => {
    // This will log all updater events, including status updates and errors.
    debugLogs = [
      ...debugLogs,
      `Launcher updater event: ${status ? status : ""} ${error ? error : ""}`,
    ];
  });

  listen<InfoLogEvent>("infoLog", (event) => {
    debugLogs = [...debugLogs, event.payload.message];
  });

  listen<InitialLoadEvent>("initialLoad", (event) => {
    const manifest = event.payload.manifest;
    const platform = event.payload.platform;

    // Dynamically gets the builds from JSON and set the first one as the default
    builds = Object.keys(manifest.builds).map((build_name) => ({
      value: build_name,
      label: build_name.charAt(0).toUpperCase() + build_name.slice(1),
    }));

    build = builds[0];

    // Dynamically gets the flash runtimes from JSON and set the system one as default
    runtimes = [
      {
        value: manifest.flashRuntimes[platform],
        label: `Flash Player (${platform.charAt(0).toUpperCase() + platform.slice(1)})`,
      },
    ];

    runtime = runtimes[0];

    // Checks the JSON for the currentGameVersion
    current_game_version = manifest.currentGameVersion;

    debugLogs = [
      ...debugLogs,
      `Latest SWF version: ${current_game_version}`,
      `Latest Launcher version: ${manifest.currentLauncherVersion}`,
    ];
  });

  (async () => {
    try {
      await invoke("initialize_app");
      debugLogs = [...debugLogs, "Launcher initialized (▀̿Ĺ̯▀̿ ̿) 🚀"];
      disabled = false;
    } catch (error) {
      debugLogs = [...debugLogs, `Error initializing launcher: ${error}`];
    }
  })();

  const launch = async () => {
    disabled = true;
    try {
      await invoke("launch_game", {
        buildName: build.value,
        version: current_game_version,
        runtime: runtime.value,
      });
      showError = false;
      await exit(0);
    } catch (err) {
      errorCode = err;
      showError = true;
    } finally {
      disabled = false;
    }
  };
</script>

<main
  class="h-screen bg-background text-foreground flex flex-col gap-4 p-4 antialiased select-none font-sans"
>
  <Navbar />
  <div class="grow rounded bg-secondary font-mono p-3">
    {#each debugLogs as log}
      <p><small>{log}</small></p>
    {/each}
  </div>
  {#if !current_game_version}
    <div class="w-full h-full flex justify-center items-center" role="status">
      <Loader />
    </div>
  {:else}
    <div class="mt-auto w-full flex justify-between">
      <label for="swf-build" class="font-display">SWF Build</label>
      <Select.Root bind:selected={build} portal={null}>
        <Select.Trigger class="w-[180px] rounded">
          <Select.Value class="text-left" />
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            {#each builds as build}
              <Select.Item value={build.value} label={build.label}
                >{build.label}</Select.Item
              >
            {/each}
          </Select.Group>
        </Select.Content>
        <Select.Input name="build" />
      </Select.Root>
    </div>
    <div class="mt-auto w-full flex justify-between">
      <label for="flash-runtime" class="font-display">Flash Runtime</label>
      <Select.Root bind:selected={runtime} portal={null}>
        <Select.Trigger class="w-[180px] rounded">
          <Select.Value class="text-left" />
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            {#each runtimes as runtime}
              <Select.Item value={runtime.value} label={runtime.label}
                >{runtime.label}</Select.Item
              >
            {/each}
          </Select.Group>
        </Select.Content>
        <Select.Input name="runtime" />
      </Select.Root>
    </div>

    <div class="mt-auto w-full flex justify-between">
      <Button
        variant="default"
        class="p-4 rounded w-32"
        on:click={launch}
        {disabled}
      >
        {#if disabled}
          <Loader2 class="animate-spin" />
        {:else}
          Launch Game
        {/if}
      </Button>
    </div>
  {/if}
  <AlertDialog bind:open={showError} error={errorCode}></AlertDialog>
</main>

<!-- Temporary to know what launcher users have -->
<div class="relative">
  <img
    src={RustLogo}
    alt="rust-logo"
    width="25px"
    class="absolute bottom-4 right-4 filter invert"
  />
</div>
