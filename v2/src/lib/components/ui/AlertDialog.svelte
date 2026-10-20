<script lang="ts">
  import { AlertDialog } from "bits-ui";
  import { fade, fly } from "svelte/transition";
  import Button from "#lib/components/ui/Button.svelte";

  interface Props {
    open?: boolean;
    label: string;
    title: string;
    description: string;
    art?: string;
    buttonLabel?: string;
    error?: boolean;
    onconfirm?: () => void;
  }

  let { open = $bindable(false), label, title, description, art, buttonLabel = "Okay", error = false, onconfirm }: Props = $props();

  /**
   * Closes the dialog and runs the confirmed action.
   */
  const confirm = () => {
    open = false;
    onconfirm?.();
  };
</script>

<AlertDialog.Root bind:open>
  <AlertDialog.Portal>
    <AlertDialog.Overlay forceMount>
      {#snippet child({ props, open })}
        {#if open}
          <div {...props} class="fixed inset-0 z-50 bg-black/55" transition:fade={{ duration: 150 }}></div>
        {/if}
      {/snippet}
    </AlertDialog.Overlay>
    <AlertDialog.Content forceMount>
      {#snippet child({ props, open })}
        {#if open}
          <div
            {...props}
            class="fixed top-1/2 left-1/2 z-50 w-[420px] -translate-1/2 overflow-hidden rounded-xl border border-border-strong bg-card shadow-2xl"
            transition:fly={{ y: 8, duration: 180 }}
          >
            <p class={["eyebrow flex h-10 items-center border-b px-5", error && "text-destructive"]}>{label}</p>
            <div class="grid gap-5 p-5">
              <div class="flex gap-4">
                {#if art}
                  <img src={art} alt="" class="size-20 shrink-0 object-contain" />
                {/if}
                <div>
                  <AlertDialog.Title class="display text-[26px]">{title}</AlertDialog.Title>
                  <AlertDialog.Description class="mt-1.5 text-muted-foreground">{description}</AlertDialog.Description>
                </div>
              </div>
              <div class="flex justify-end gap-2">
                {#if onconfirm}
                  <AlertDialog.Cancel>
                    {#snippet child({ props })}
                      <Button {...props} variant="outline">Cancel</Button>
                    {/snippet}
                  </AlertDialog.Cancel>
                  <AlertDialog.Action>
                    {#snippet child({ props })}
                      <Button {...props} onclick={confirm}>{buttonLabel}</Button>
                    {/snippet}
                  </AlertDialog.Action>
                {:else}
                  <AlertDialog.Cancel>
                    {#snippet child({ props })}
                      <Button {...props} variant={error ? "outline" : "default"}>{buttonLabel}</Button>
                    {/snippet}
                  </AlertDialog.Cancel>
                {/if}
              </div>
            </div>
          </div>
        {/if}
      {/snippet}
    </AlertDialog.Content>
  </AlertDialog.Portal>
</AlertDialog.Root>
