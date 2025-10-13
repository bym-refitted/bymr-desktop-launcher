<script lang="ts">
  import { Platform } from "$lib/enums";
  import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
  import { platform } from '@tauri-apps/plugin-os';
  import {FrameCorners, Minus, X as Close} from "phosphor-svelte";

  const appWindow = getCurrentWebviewWindow();
  const isMobile = platform() === Platform.Android;

  const toggleMaximize = async () => {
    const isMaximized = await appWindow.isMaximized();
    if (isMaximized) {
      await appWindow.unmaximize();
    } else {
      await appWindow.maximize();
    }
  };
</script>

<!-- Titlebar -->
<div
  data-tauri-drag-region
  class="fixed top-0 left-0 right-2 flex h-8 justify-end bg-[var(--background)] select-none gap-2"
>
  {#if !isMobile}
    <div
      on:click={() => appWindow.minimize()}
      on:keydown={() => appWindow.minimize()}
      role="button"
      tabindex="0"
      class="group inline-flex items-center justify-center w-7 h-7 relative"
      id="titlebar-minimize"
    >
      <div
        class="absolute inset-0 bg-transparent group-hover:bg-white group-hover:opacity-10"
      ></div>
      <Minus size={15} class="z-10 text-white/50" weight="bold" />
    </div>
    <div
      on:click={toggleMaximize}
      on:keydown={toggleMaximize}
      role="button"
      tabindex="0"
      class="group inline-flex items-center justify-center w-7 h-7 relative"
      id="titlebar-maximize"
    >
      <div
        class="absolute inset-0 bg-transparent group-hover:bg-white group-hover:opacity-10"
      ></div>

      <FrameCorners size={15} class="z-10 text-white/50" weight="bold" />
    </div>
    <div
      on:click={() => appWindow.close()}
      on:keydown={() => appWindow.close()}
      role="button"
      tabindex="0"
      class="group inline-flex items-center justify-center w-7 h-7 relative"
      id="titlebar-close"
    >
      <div class="absolute inset-0 bg-transparent group-hover:bg-red" ></div>
      <Close size={15} class="z-10 text-white/50" weight="bold" />
    </div>
  {/if}
</div>
