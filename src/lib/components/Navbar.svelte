<script lang="ts">
  import { SketchLogo, DiscordLogo, GithubLogo } from "phosphor-svelte";
  import Tooltip from "./ui/tooltip/Tooltip.svelte";
  import { platform } from "@tauri-apps/plugin-os";
  import { Platform } from "$lib/enums";
  
  const isMobile = platform() === Platform.Android;
</script>

{#if isMobile}
  <!-- Mobile: Just the icons, no container (rendered inside TabView header) -->
  <div class="flex items-center space-x-3">
    <Tooltip
      url="https://discord.gg/bymrefitted"
      tooltipText="Discord"
      Icon={DiscordLogo}
    />
    <Tooltip
      url="https://github.com/orgs/bym-refitted/repositories"
      tooltipText="GitHub"
      Icon={GithubLogo}
    />
    <Tooltip
      url="https://bymrefitted.com/donations/checkout"
      tooltipText="Donate"
      Icon={SketchLogo}
    />
  </div>
{:else}
  <!-- Desktop: Full navbar with spacing -->
  <div class="h-20 flex justify-end items-center pr-12 pt-8">
    <div class="flex items-center space-x-4">
      <Tooltip
        url="https://discord.gg/bymrefitted"
        tooltipText="Discord"
        Icon={DiscordLogo}
      />
      <Tooltip
        url="https://github.com/orgs/bym-refitted/repositories"
        tooltipText="GitHub"
        Icon={GithubLogo}
      />
      <Tooltip
        url="https://bymrefitted.com/donations/checkout"
        tooltipText="Donate"
        Icon={SketchLogo}
      />
    </div>
  </div>
{/if}
