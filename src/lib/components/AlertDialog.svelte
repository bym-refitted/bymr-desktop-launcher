<script lang="ts">
  export let open = false;
  export let error = "";

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

  const quit = async () => await exit(0);
</script>

<Dialog bind:open>
  <DialogContent class="text-left bg-background text-foreground">
    <DialogHeader class="text-left">
      <DialogTitle class="font-display text-2xl select-none"
        >Oops! Something broke...</DialogTitle
      >
      <DialogDescription>
        <p class="text-secondary-foreground mt-4 mb-4">
          Launcher caught an error: <b class="font-bold capitalize">{error}</b>
        </p>
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <div class="flex justify-end gap-2">
        <PrimaryButton on:click={() => (open = false)}>Continue</PrimaryButton>
        <PrimaryButton on:click={() => quit()}>Quit</PrimaryButton>
      </div>
    </DialogFooter>
  </DialogContent>
</Dialog>
