<script lang="ts">
  import PrimaryButton from "$lib/components/ui/button/PrimaryButton.svelte";
  import { exit } from "@tauri-apps/api/process";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "$lib/components/ui/dialog";
  import RocketLaunch from "phosphor-svelte/lib/RocketLaunch";
  import type { IconProps, SvelteComponent } from "phosphor-svelte/lib/shared";

  export let title = "Oops! Something broke...";
  export let description = "";
  export let Icon: typeof SvelteComponent<IconProps> = RocketLaunch;

  export let open = false;
  export let error = "";

  const quit = async () => await exit(0);
</script>

<Dialog bind:open>
  <DialogContent class="text-left bg-background text-foreground">
    <DialogHeader class="text-left">
      <DialogTitle class="font-display text-2xl select-none">
        <div class="flex flex-row">
          <svelte:component
            this={Icon}
            weight="bold"
            size="30"
            class={`mr-3 ${error ? "text-red" : "text-primary"}`}
          />
          {title}
        </div>
      </DialogTitle>
      <DialogDescription>
        <p class="text-secondary-foreground mt-4 mb-4">
          {error ? error : description}
        </p>
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <div class="flex justify-end gap-2">
        <PrimaryButton buttonText="Continue" on:click={() => (open = false)} />
        {#if error}
          <PrimaryButton buttonText="Quit" on:click={() => quit()} />
        {/if}
      </div>
    </DialogFooter>
  </DialogContent>
</Dialog>
