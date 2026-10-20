<script lang="ts">
  import { Tooltip } from "bits-ui";
  import Minus from "@lucide/svelte/icons/minus";
  import Square from "@lucide/svelte/icons/square";
  import X from "@lucide/svelte/icons/x";
  import { getCurrentWindow } from "@tauri-apps/api/window";
  import { page } from "$app/state";
  import AccountMenu from "#lib/components/shell/AccountMenu.svelte";
  import ThemeToggle from "#lib/components/shell/ThemeToggle.svelte";
  import { pages } from "#lib/nav.js";
  import { user } from "#lib/state/user.svelte.js";

  const appWindow = getCurrentWindow();

  const visiblePages = $derived(pages.filter((link) => !link.menu && (!link.signedIn || user.token)));

  /**
   * Maximises the window, or restores it if it is already maximised.
   *
   * @returns {Promise<void>} Resolves once the window has changed size.
   */
  const toggleMaximize = async () => await appWindow.isMaximized() ? appWindow.unmaximize() : appWindow.maximize();

  const windowButton =
    "grid w-11 place-items-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";
</script>

<header class="flex h-12 shrink-0 border-b" data-tauri-drag-region>
  <a href="/" class="display flex items-center border-r px-5 text-[25px]">
    BYM<em>R</em>
  </a>

  <nav class="flex">
    {#each visiblePages as { href, label, icon: Icon } (href)}
      <Tooltip.Root>
        <Tooltip.Trigger>
          {#snippet child({ props })}
            <a
              {...props}
              {href}
              aria-current={page.url.pathname === href ? "page" : undefined}
              class="flex items-center gap-2 border-r px-4 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground aria-[current=page]:text-foreground aria-[current=page]:shadow-[inset_0_-2px_0_var(--primary)] [&[aria-current=page]_svg]:text-primary"
            >
              <Icon class="size-4" />
              <span class="max-[1100px]:hidden">{label}</span>
            </a>
          {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            sideOffset={6}
            class="z-50 rounded-md border bg-card px-2.5 py-1 text-xs min-[1101px]:hidden"
          >
            {label}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    {/each}
  </nav>

  <div class="flex-1" data-tauri-drag-region></div>

  <div class="flex divide-x border-l">
    <ThemeToggle />
    {#if user.token}
      <AccountMenu />
    {/if}
    <div class="flex">
      <button
        class={windowButton}
        onclick={() => appWindow.minimize()}
        aria-label="Minimise"
      >
        <Minus class="size-4" />
      </button>
      <button
        class={windowButton}
        onclick={toggleMaximize}
        aria-label="Maximise"
      >
        <Square class="size-3" />
      </button>
      <button
        class="{windowButton} hover:bg-destructive hover:text-white"
        onclick={() => appWindow.close()}
        aria-label="Close"
      >
        <X class="size-4" />
      </button>
    </div>
  </div>
</header>
