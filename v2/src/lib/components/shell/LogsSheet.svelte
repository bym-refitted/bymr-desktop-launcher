<script lang="ts">
  import { Dialog } from "bits-ui";
  import { fade, fly } from "svelte/transition";
  import Check from "@lucide/svelte/icons/check";
  import Copy from "@lucide/svelte/icons/copy";
  import X from "@lucide/svelte/icons/x";
  import Button from "#lib/components/ui/Button.svelte";
  import { app } from "#lib/state/app.svelte.js";
  import { logs } from "#lib/state/logs.svelte.js";

  interface Props {
    open?: boolean;
  }

  let { open = $bindable(false) }: Props = $props();

  let copied = $state(false);

  const lines = $derived(
    logs.entries.flatMap((entry) => entry.message.split("\n").map((text) => ({ ...entry, text }))),
  );

  /**
   * @param {Date} time - When the entry was logged.
   * @returns {string} The time as HH:MM:SS.
   */
  const formatTime = (time: Date) => time.toLocaleTimeString("en-GB", { hour12: false });

  /**
   * Copies every log line to the clipboard, logging a failure instead of throwing.
   *
   * @returns {Promise<void>} Resolves once the copy has finished or failed.
   */
  const copyLogs = async () => {
    try {
      await navigator.clipboard.writeText(lines.map((line) => `${formatTime(line.time)} ${line.text}`).join("\n"));
      copied = true;
      setTimeout(() => (copied = false), 1500);
    } catch (error) {}
  };
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay forceMount>
      {#snippet child({ props, open })}
        {#if open}
          <div
            {...props}
            class="fixed inset-x-0 top-12 bottom-0 z-40 bg-black/40"
            transition:fade={{ duration: 150 }}
          ></div>
        {/if}
      {/snippet}
    </Dialog.Overlay>
    <Dialog.Content forceMount>
      {#snippet child({ props, open })}
        {#if open}
          <div
            {...props}
            class="fixed top-12 right-0 bottom-0 z-50 flex w-[480px] flex-col border-l border-border-strong bg-card"
            transition:fly={{ x: 480, duration: 220 }}
          >
            <div
              class="flex h-11 items-center justify-between border-b px-5 text-[12.5px]"
            >
              <Dialog.Title class="font-semibold">
                Launcher logs
                <span class="font-normal text-muted-foreground">
                  / v{app.launcherVersion}
                </span>
              </Dialog.Title>
              <Dialog.Close
                class="grid size-8 place-items-center rounded-md text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-primary/40"
                aria-label="Close logs"
              >
                <X class="size-4" />
              </Dialog.Close>
            </div>

            <ol
              class="flex-1 overflow-auto py-2 font-mono text-xs leading-[2.1] select-text"
            >
              {#each lines as line, index (index)}
                <li class="grid grid-cols-[48px_76px_1fr] pr-5 hover:bg-accent">
                  <span class="pr-3.5 text-right text-muted-foreground/60">
                    {index + 1}
                  </span>
                  <span class="text-muted-foreground">
                    {formatTime(line.time)}
                  </span>
                  <span
                    class={{
                      "text-success": line.kind === "success",
                      "text-destructive": line.kind === "error",
                    }}
                  >
                    {line.text}
                  </span>
                </li>
              {:else}
                <li class="px-5 text-muted-foreground">No activity yet.</li>
              {/each}
            </ol>

            <div class="border-t p-4">
              <Button
                variant="outline"
                class="w-full"
                onclick={copyLogs}
                disabled={!lines.length}
              >
                {#if copied}
                  <Check />Copied
                {:else}
                  <Copy />Copy logs
                {/if}
              </Button>
            </div>
          </div>
        {/if}
      {/snippet}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
