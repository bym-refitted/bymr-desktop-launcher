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

  export let title = "Oops! Something broke...";
  export let open = false;
  export let error = "";

  const quit = async () => await exit(0);
</script>

<Dialog bind:open>
  <DialogContent class="text-left bg-background text-foreground">
    <DialogHeader class="text-left">
      <DialogTitle class="font-display text-2xl select-none"
        >{title}</DialogTitle
      >
      <DialogDescription>
        <p class="text-secondary-foreground mt-4 mb-4">
          Launcher caught an error: <b class="font-bold capitalize">{error}</b>
        </p>
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <div class="flex justify-end gap-2">
        <PrimaryButton buttonText="Continue" on:click={() => (open = false)} />
        <PrimaryButton buttonText="Quit" on:click={() => quit()} />
      </div>
    </DialogFooter>
  </DialogContent>
</Dialog>
