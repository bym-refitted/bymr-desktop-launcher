<script>
  import { Tooltip } from 'bits-ui';
  import Discord from 'phosphor-svelte/lib/DiscordLogo';
  import GitHub from 'phosphor-svelte/lib/GithubLogo';
  import SketchLogo from 'phosphor-svelte/lib/SketchLogo';
</script>

<div class="h-20 flex justify-end items-center pr-12 pt-8">
  <div class="flex items-center space-x-4">
    <a href="https://discord.gg/ajZAccxNMA" target="_tauri">
      <Discord weight="bold" color="#00CDB8" size="30" />
    </a>
    <a href="https://github.com/bym-refitted" target="_tauri">
      <GitHub weight="bold" color="#00CDB8" size="30" />
    </a>
    <Tooltip.Root openDelay={0}>
      <Tooltip.Trigger>
        <a
          href="https://bymrefitted.com/donations/checkout"
          target="_tauri"
          class="inline-flex size-10 items-center justify-center rounded-full
  border border-border-input bg-background-alt shadow-btn ring-dark ring-offset-background hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dark focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <SketchLogo weight="bold" color="#FFF" size="30" />
        </a>
      </Tooltip.Trigger>
      <Tooltip.Content transitionConfig={{ y: 8, duration: 150 }} sideOffset={8}>
        <div class="bg-background">
          <Tooltip.Arrow class="rounded-[2px] border-l border-t border-dark-10" />
        </div>
        <div
          class="flex items-center justify-center rounded-input border border-dark-10 bg-background p-3 text-sm font-medium shadow-popover outline-none"
        >
          Dontate to the project
        </div>
      </Tooltip.Content>
    </Tooltip.Root>
  </div>
</div>
