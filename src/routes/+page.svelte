<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import * as Select from '$lib/components/ui/select';
    import { Loader2 } from 'lucide-svelte';
    import AlertDialog from '$lib/components/AlertDialog.svelte';
    import Navbar from '$lib/components/Navbar.svelte';
    import Loader from '../../src/assets/svgs/Loader.svelte';
  
    interface Build {
      value: string;
      label: string;
    }
  
    interface Runtime {
      value: string;
      label: string;
    }
  
    // Dynamically set during initialLoad event
    let builds: Build[] = [];
    let build: Build;
    let runtime: Runtime;
    let runtimes: Runtime[] = [];
    let current_game_version = '';
  
    // Debug Variables
    let disabled = true;
    let showError = false;
    let errorCode = '';
    let debugLogs: string[] = [];
  
    // EventsOn('infoLog', (event) => {
    //   debugLogs = [...debugLogs, event];
    // });
  
    // EventsOn('initialLoad', (event) => {
    //   // Dynamically gets the builds from JSON and set the first one as the default
    //   builds = Object.keys(event.manifest.builds).map((buildName) => ({
    //     value: buildName,
    //     label: buildName.charAt(0).toUpperCase() + buildName.slice(1),
    //   }));
  
    //   build = builds[0];
  
    //   // Dynamically gets the flash runtimes from JSON and set the system one as default
    //   runtimes = [
    //     {
    //       value: event.manifest.flashRuntimes[event.platform],
    //       label: `Flash Player (${event.platform.charAt(0).toUpperCase() + event.platform.slice(1)})`,
    //     },
    //   ];
  
    //   runtime = runtimes[0];
  
    //   // Checks the JSON for the currentGameVersion
    //   current_game_version = event.manifest.currentGameVersion;
  
    //   debugLogs = [
    //     ...debugLogs,
  
    //     `Latest SWF version: ${current_game_version}`,
    //     `Latest Launcher version: ${event.manifest.currentLauncherVersion}`,
    //   ];
    // });
  
    // InitializeApp()
    //   .then(() => (debugLogs = [...debugLogs, 'Launcher initialized']))
    //   .then(() => {
    //     disabled = false;
    //   });
  
    const launch = () => {
      // disabled = true;
      // LaunchGame(build.value, current_game_version, runtime.value)
      //   .then(() => {
      //     showError = false;
      //     Quit();
      //     disabled = false;
      //   })
      //   .catch((err) => {
      //     errorCode = err;
      //     showError = true;
      //   });
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
    <!-- {#if !current_game_version}
      <div class="w-full flex justify-center items-center" role="status">
        <Loader />
        <span class="sr-only">Loading...</span>
      </div>
    {:else} -->
      <div class="mt-auto w-full flex justify-between">
        <label class="font-display">SWF Build</label>
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
        <label class="font-display">Flash Runtime</label>
        <Select.Root bind:selected={runtime} portal={null}>
          <Select.Trigger class="w-[180px] rounded">
            <Select.Value class="text-left" />
          </Select.Trigger>
          <Select.Content>
            <Select.Group>
              {#each runtimes as runtime}
                <Select.Item value={runtime.value} label={runtime.label}>{runtime.label}</Select.Item>
              {/each}
            </Select.Group>
          </Select.Content>
          <Select.Input name="runtime" />
        </Select.Root>
      </div>
  
      <div class="mt-auto w-full flex justify-between">
        <Button variant="default" class="p-4 rounded w-32" on:click={launch} {disabled}>
          {#if disabled}
            <Loader2 />
          {:else}
            Launch Game
          {/if}
        </Button>
      </div>
    <!-- {/if} -->
    <AlertDialog bind:open={showError} error={errorCode}></AlertDialog>
  </main>
  