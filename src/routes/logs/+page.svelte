<script lang="ts">
  import { debugLogs } from "$lib/stores/debugLogStore";
  import { getVersion } from "@tauri-apps/api/app";
  import { ClockClockwise, Info } from "phosphor-svelte";
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";

  let launcherVersion = "0.0.0";

  onMount(async () => {
    launcherVersion = await getVersion();
  });

  const formatTime = () => {
    return new Date().toLocaleTimeString("en-US", { hour12: false });
  };
</script>

<div class="flex flex-col h-full bg-background" in:fly={{ y: 30, duration: 600, delay: 100 }}>
  <!-- Header -->
  <div class="flex items-center justify-between px-6 py-4 border-b border-white/10">
    <div class="flex items-center gap-3">
      <div class="bg-primary/10 p-2 rounded-lg">
        <ClockClockwise size={20} weight="bold" class="text-primary" />
      </div>
      <div>
        <h1 class="text-base font-semibold text-foreground">Activity Logs</h1>
        <p class="text-xs text-muted-foreground">
          Launcher v{launcherVersion}
        </p>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <div class="px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
        <span class="text-xs font-medium text-muted-foreground">
          {$debugLogs.length}
          {$debugLogs.length === 1 ? "entry" : "entries"}
        </span>
      </div>
      <div
        class="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded-lg border border-green-500/20"
      >
        <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
        <span class="text-xs font-medium text-green-400">Live</span>
      </div>
    </div>
  </div>

  <!-- Content -->
  <div class="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
    <div class="space-y-2">
      {#each $debugLogs as log, index}
        {#each log.msg.split("\n") as line}
          <div
            class="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-3 transition-all duration-200"
          >
            <div class="flex items-start gap-3">
              <div
                class="flex-shrink-0 w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center"
              >
                <Info size={14} weight="bold" class="text-primary" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs font-mono text-primary/60">
                    {formatTime()}
                  </span>
                  <span class="text-xs text-muted-foreground/50">•</span>
                  <span class="text-xs text-muted-foreground/50">
                    Entry #{String(index + 1).padStart(3, "0")}
                  </span>
                </div>
                <p class={`text-sm leading-relaxed ${log.class}`}>
                  {line}
                </p>
              </div>
            </div>
          </div>
        {/each}
      {/each}
      {#if $debugLogs.length === 0}
        <div
          class="flex flex-col items-center justify-center py-12 text-center"
        >
          <div
            class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4"
          >
            <ClockClockwise size={32} weight="bold" class="text-primary/50" />
          </div>
          <p class="text-sm font-medium text-muted-foreground mb-1">
            No activity yet
          </p>
          <p class="text-xs text-muted-foreground/60">
            Logs will appear here as actions are performed
          </p>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }
</style>
