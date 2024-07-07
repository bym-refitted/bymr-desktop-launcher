<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Select from "$lib/components/ui/select";
  import { Loader2 } from "lucide-svelte";
  import AlertDialog from "$lib/components/AlertDialog.svelte";

  import { exit } from "@tauri-apps/api/process";
  import { invoke } from "@tauri-apps/api/tauri";
  import TabSwitcher from "$lib/components/ui/tabs/TabSwitcher.svelte";
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

<TabSwitcher
  tabs={[
    { content: "teasdasdst", label: "content" },
    { content: "teasdasdst2", label: "content2" },
  ]}
/>

<!-- <div class="mt-auto w-full flex justify-between">
  <label for="swf-build" class="font-display">Game Server</label>
  <Select.Root bind:selected={build} portal={null}>
    <Select.Trigger class="w-[180px] rounded">
      <Select.Value class="text-left" />
    </Select.Trigger>
    <Select.Content>
      <Select.Group>
        {#each builds as build}
          <Select.Item value={build.value} label={build.label}>{build.label}</Select.Item>
        {/each}
      </Select.Group>
    </Select.Content>
    <Select.Input name="build" />
  </Select.Root>
</div>
<div class="mt-auto w-full flex justify-between">
  <Button variant="default" class="p-4 rounded w-32" on:click={launch} {disabled}>
    {#if disabled}
      <Loader2 class="animate-spin" />
    {:else}
      Launch Game
    {/if}
  </Button>
</div> -->

<AlertDialog bind:open={showError} error={errorCode}></AlertDialog>
