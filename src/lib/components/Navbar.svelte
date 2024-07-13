<script lang="ts">
  import Discord from "phosphor-svelte/lib/DiscordLogo";
  import GitHub from "phosphor-svelte/lib/GithubLogo";
  import SketchLogo from "phosphor-svelte/lib/SketchLogo";
  import Tooltip from "./ui/tooltip/Tooltip.svelte";
</script>

<div class="h-20 flex justify-end items-center pr-12 pt-8">
  <div class="flex items-center space-x-4">
    <Tooltip
      url="https://discord.gg/ajZAccxNMA"
      tooltipText="Discord"
      Icon={Discord}
    />
    <Tooltip
      url="https://github.com/orgs/bym-refitted/repositories"
      tooltipText="GitHub"
      Icon={GitHub}
    />
    <Tooltip
      url="https://bymrefitted.com/donations/checkout"
      tooltipText="Donate"
      Icon={SketchLogo}
    />
  </div>
</div>
