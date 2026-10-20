<script lang="ts">
  import { DropdownMenu } from "bits-ui";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import LogOut from "@lucide/svelte/icons/log-out";
  import eyera from "#lib/assets/art/eyera.png";
  import { signOut } from "#lib/api/session.js";
  import { user } from "#lib/state/user.svelte.js";
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger
    class="flex items-center gap-2 px-3 text-[13px] font-semibold transition-colors hover:bg-accent data-[state=open]:bg-accent"
  >
    <img
      src={eyera}
      alt=""
      class="size-7 rounded-md border bg-sunken object-contain p-0.5"
    />
    {user.username || "Account"}
    <ChevronDown class="size-3.5 text-muted-foreground" />
  </DropdownMenu.Trigger>
  <DropdownMenu.Portal>
    <DropdownMenu.Content
      align="end"
      sideOffset={4}
      class="z-50 min-w-44 rounded-lg border border-border-strong bg-card p-1 shadow-xl"
    >
      <DropdownMenu.Item
        class="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground outline-none data-highlighted:bg-accent data-highlighted:text-foreground"
        onSelect={signOut}
      >
        <LogOut class="size-4" />Sign out
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>
