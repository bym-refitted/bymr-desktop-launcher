<script lang="ts">
  import { DropdownMenu } from "bits-ui";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import LogOut from "@lucide/svelte/icons/log-out";
  import UserRound from "@lucide/svelte/icons/user-round";
  import { goto } from "$app/navigation";
  import { signOut } from "#lib/api/session.js";
  import Avatar from "#lib/components/ui/Avatar.svelte";
  import { user } from "#lib/state/user.svelte.js";
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger
    class="flex items-center gap-2 px-3 text-[13px] font-semibold transition-colors hover:bg-accent data-[state=open]:bg-accent"
  >
    <Avatar src={user.avatar} class="size-7 rounded-md" />
    {user.username || "Account"}
    <ChevronDown class="size-3.5 text-muted-foreground" />
  </DropdownMenu.Trigger>
  <DropdownMenu.Portal>
    <DropdownMenu.Content
      align="end"
      sideOffset={4}
      class="z-50 min-w-44 rounded-lg border border-border-strong bg-card p-1 shadow-xl outline-none"
    >
      <DropdownMenu.Item
        class="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground outline-none data-highlighted:bg-accent data-highlighted:text-foreground"
        onSelect={() => goto("/account")}
      >
        <UserRound class="size-4" />Account
      </DropdownMenu.Item>
      <DropdownMenu.Separator class="-mx-1 my-1 h-px bg-border" />
      <DropdownMenu.Item
        class="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground outline-none data-highlighted:bg-accent data-highlighted:text-foreground"
        onSelect={signOut}
      >
        <LogOut class="size-4" />Sign out
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>
