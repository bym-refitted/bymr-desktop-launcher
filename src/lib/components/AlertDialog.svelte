<script lang="ts">
  import PrimaryButton from "$lib/components/ui/button/PrimaryButton.svelte";
  import RocketLaunch from "phosphor-svelte/lib/RocketLaunch";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "$lib/components/ui/dialog";
  import type { Component } from "svelte";
  import type { IconComponentProps } from "phosphor-svelte/lib/shared";

  export let title = "Oops! Something broke...";
  export let description = "";
  export let Icon: Component<IconComponentProps> = RocketLaunch;

  export let open = false;
  export let error = "";

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
      </div>
    </DialogFooter>
  </DialogContent>
</Dialog>
