<script lang="ts">
  import { openUrl } from "@tauri-apps/plugin-opener";
  import LogsSheet from "#lib/components/shell/LogsSheet.svelte";
  import { app } from "#lib/state/app.svelte.js";
  import { logs } from "#lib/state/logs.svelte.js";

  let logsOpen = $state(false);

  const statuses = {
    connecting: { dot: "bg-warning ring-warning/20", text: "Housing the pokeys..." },
    failed: { dot: "bg-destructive ring-destructive/20", text: "Something went wrong" },
    connected: { dot: "bg-success ring-success/20", text: "Connected, you're all set" },
  };

  const status = $derived.by(() => {
    if (!app.loaded) return statuses.connecting;

    if (logs.hasErrors) return statuses.failed;

    return statuses.connected;
  });

  const links = [
    { label: "Discord", url: "https://discord.gg/bymrefitted" },
    { label: "GitHub", url: "https://github.com/orgs/bym-refitted/repositories" },
    { label: "Donate", url: "https://bymrefitted.com/donations/checkout" },
  ];
  
</script>

<footer
  class="flex h-10 shrink-0 items-center justify-between border-t px-7 text-[12.5px] text-muted-foreground"
>
  <button
    class="flex items-center gap-2.5 hover:text-foreground"
    onclick={() => (logsOpen = true)}
  >
    <span class="size-2 rounded-full ring-3 {status.dot}"></span>
    {status.text}
    <span class="opacity-40">·</span>
    View logs
  </button>
  <div class="flex gap-5">
    {#each links as { label, url } (url)}
      <button class="hover:text-foreground" onclick={() => openUrl(url)}>
        {label}
      </button>
    {/each}
  </div>
</footer>

<LogsSheet bind:open={logsOpen} />
