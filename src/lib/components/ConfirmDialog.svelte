<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { Question } from "phosphor-svelte";
  import type { Component } from "svelte";
  import type { IconComponentProps } from "phosphor-svelte/lib/shared";

  import PrimaryButton from "$lib/components/ui/button/PrimaryButton.svelte";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "$lib/components/ui/dialog";

  export let title = "Are you sure?";
  export let description = "";
  export let confirmText = "Confirm";
  export let cancelText = "Cancel";
  export let Icon: Component<IconComponentProps> = Question;
  export let open = false;

  const dispatch = createEventDispatcher<{ confirm: void }>();

  const confirm = () => {
    open = false;
    dispatch("confirm");
  };
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
            class="mr-3 text-primary"
          />
          {title}
        </div>
      </DialogTitle>
      <DialogDescription>
        <p class="text-secondary-foreground mt-4 mb-4">{description}</p>
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <div class="flex justify-end gap-2">
        <PrimaryButton
          buttonText={cancelText}
          color="bg-btn-dark"
          on:click={() => (open = false)}
        />
        <PrimaryButton buttonText={confirmText} on:click={confirm} />
      </div>
    </DialogFooter>
  </DialogContent>
</Dialog>
