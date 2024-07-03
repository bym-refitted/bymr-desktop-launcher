<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import * as Select from '$lib/components/ui/select';
  import { Loader2 } from 'lucide-svelte';
  import AlertDialog from '$lib/components/AlertDialog.svelte';
  import Loader from '../../src/assets/svgs/Loader.svelte';

  import { exit } from '@tauri-apps/api/process';
  import { listen } from '@tauri-apps/api/event';
  import { invoke } from '@tauri-apps/api/tauri';
  import { getVersion } from '@tauri-apps/api/app';
  import { onUpdaterEvent } from '@tauri-apps/api/updater';
  import DebugLogs from '$lib/components/DebugLogs.svelte';

  interface Build {
    value: string;
    label: string;
  }

  interface InfoLogEvent {
    message: string;
  }

  // Dynamically set during initialLoad event
  const builds: Build[] = [
    { label: 'Stable', value: 'stable' },
    { label: 'HTTP', value: 'http' },
    { label: 'Local', value: 'local' },
  ];
  let build: Build = builds[0];

  // Debug Variables
  let disabled = true;
  let loading = true;
  let showError = false;
  let errorCode = '';
  type LogEntry = string | { class: string; msg: string };
  let debugLogs: LogEntry[] = [];

  onUpdaterEvent(({ error, status }) => {
    if (error) {
      // This will log all updater events, including status updates and errors.
      debugLogs = [
        ...debugLogs,
        `Launcher updater event: ${status ? status : ''} ${error ? error : ''}`,
      ];
    }
  });

  listen<InfoLogEvent>('infoLog', (event) => {
    debugLogs = [...debugLogs, event.payload.message];
  });

  listen<InfoLogEvent>('errorLog', (event) => {
    debugLogs = [...debugLogs, { msg: event.payload.message, class: 'text-red-500' }];
  });

  (async () => {
    try {
      await invoke('initialize_app');
      debugLogs = [
        ...debugLogs,
        { msg: 'Launcher initialized! (▀̿Ĺ̯▀̿ ̿) 🚀', class: 'text-green-500' },
      ];
      loading = false;
      disabled = false;
    } catch (error) {
      debugLogs = [
        ...debugLogs,
        { msg: `Error initializing launcher`, class: 'text-red-500' },
        `${error}`,
      ];
    }
  })();

  const launch = async () => {
    disabled = true;
    try {
      await invoke('launch_game', {
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

<DebugLogs {debugLogs} />
{#if loading}
  <div class="w-full h-full flex justify-center items-center" role="status">
    <Loader />
  </div>
{:else}
  <div class="mt-auto w-full flex justify-between">
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
  </div>
{/if}
<AlertDialog bind:open={showError} error={errorCode}></AlertDialog>
