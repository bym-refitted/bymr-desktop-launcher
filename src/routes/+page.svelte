<script lang="ts">
  import AlertDialog from "$lib/components/AlertDialog.svelte";

  import { exit } from "@tauri-apps/api/process";
  import { invoke } from "@tauri-apps/api/tauri";
  import TabView from "$lib/components/ui/tabs/TabView.svelte";

  interface Build {
    value: string;
    label: string;
  }

  // Dynamically set during initialLoad event
  const builds: Build[] = [
    { label: "Stable", value: "stable" },
    { label: "HTTP", value: "http" },
    { label: "Local", value: "local" },
  ];
  let build: Build = builds[0];

  // Debug Variables
  let disabled = true;
  let showError = false;
  let errorCode = "";

  const launch = async () => {
    disabled = true;
    try {
      await invoke("launch_game", {
        buildName: build.value,
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

<TabView />
<AlertDialog bind:open={showError} error={errorCode}></AlertDialog>
