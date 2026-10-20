<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import CircleAlert from "@lucide/svelte/icons/circle-alert";
  import Gift from "@lucide/svelte/icons/gift";
  import Users from "@lucide/svelte/icons/users";
  import bandito from "#lib/assets/art/bandito.png";
  import FriendsList from "#lib/components/friends/FriendsList.svelte";
  import PlayerSearch from "#lib/components/friends/PlayerSearch.svelte";
  import RequestsList from "#lib/components/friends/RequestsList.svelte";
  import AlertDialog from "#lib/components/ui/AlertDialog.svelte";
  import SignInPrompt from "#lib/components/ui/SignInPrompt.svelte";
  import TabBar from "#lib/components/ui/TabBar.svelte";
  import { countOf } from "#lib/format.js";
  import { collapse } from "#lib/motion.js";
  import type { Friend } from "#lib/schemas.js";
  import { friends } from "#lib/state/friends.svelte.js";
  import { user } from "#lib/state/user.svelte.js";

  const FriendsTab = {
    friends: "friends",
    requests: "requests",
    find: "find",
  } as const;

  type FriendsTab = (typeof FriendsTab)[keyof typeof FriendsTab];

  let tab = $state<FriendsTab>(FriendsTab.friends);
  let removing = $state<Friend>();
  let confirmingRemoval = $state(false);

  const tabs = $derived([
    { value: FriendsTab.friends, label: "Friends" },
    { value: FriendsTab.requests, label: "Requests", count: friends.incoming.length },
    { value: FriendsTab.find, label: "Find players" },
  ]);

  /**
   * Asks the player to confirm before removing a friend.
   *
   * @param {Friend} friend - The friend to remove.
   */
  const askToRemove = (friend: Friend) => {
    removing = friend;
    confirmingRemoval = true;
  };

  /**
   * Removes the friend the player confirmed.
   */
  const confirmRemoval = () => {
    if (removing) friends.remove(removing);
  };

  onMount(() => {
    if (user.signedIn) friends.load();
  });
</script>

<div class="flex h-full flex-col">
  <header class="flex shrink-0 justify-between gap-6 border-b px-7 pt-6 pb-5">
    <div>
      <p class="eyebrow text-primary">Your crew</p>
      <h1 class="mt-3 display text-[40px] leading-[1.1]">Your <em>friends.</em></h1>
      {#if user.signedIn && friends.friends.length > 0}
        <p class="mt-2 flex items-center gap-4 text-[13px] text-muted-foreground" in:fade={{ duration: 150 }}>
          <span class="flex items-center gap-1.5"><Users class="size-4" />{countOf(friends.friends.length, "friend")}</span>
          <span class="flex items-center gap-1.5"><span class="size-2 rounded-full bg-success"></span>{friends.onlineCount} online</span>
          <span class="flex items-center gap-1.5"><Gift class="size-4" />{countOf(friends.sacksReady, "sack")} ready to send</span>
        </p>
      {:else}
        <p class="mt-2 text-[13px] text-muted-foreground">Add players, answer requests and send a mystery sack once a day.</p>
      {/if}
    </div>
    <img src={bandito} alt="" class="h-24 w-auto self-center" />
  </header>

  {#if !user.signedIn}
    <SignInPrompt title="Sign in to see your friends" description="Your friends list follows your account, so you'll need to sign in first." />
  {:else}
    <div class="flex h-[46px] shrink-0 items-stretch justify-between border-b px-7">
      <TabBar options={tabs} bind:value={tab} class="h-full" />
      {#if tab === FriendsTab.friends}
        <span class="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
          <Gift class="size-4" />One mystery sack per friend each day
        </span>
      {/if}
    </div>

    {#if friends.error}
      <p class="flex shrink-0 items-center gap-2 border-b bg-destructive/10 px-7 py-2.5 text-[13px] text-destructive" role="alert" transition:collapse>
        <CircleAlert class="size-4 shrink-0" />{friends.error}
      </p>
    {/if}

    <div class="min-h-0 flex-1 overflow-auto">
      {#key tab}
        <div in:fade={{ duration: 150 }}>
          {#if friends.loading && tab === FriendsTab.friends}
            <div class="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4 p-7">
              {#each { length: 8 }, index (index)}
                <div class="flex flex-col items-center rounded-xl border bg-card px-4 pt-6 pb-4">
                  <div class="size-16 animate-pulse rounded-xl bg-accent"></div>
                  <div class="mt-4 h-3 w-24 animate-pulse rounded bg-accent"></div>
                  <div class="mt-3 h-4 w-14 animate-pulse rounded-full bg-accent"></div>
                  <div class="mt-3 h-3 w-28 animate-pulse rounded bg-accent"></div>
                  <div class="mt-4 h-8 w-full animate-pulse rounded-lg bg-accent"></div>
                </div>
              {/each}
            </div>
          {:else if friends.loading}
            {#each { length: 6 }, index (index)}
              <div class="flex h-16 items-center gap-4 border-b px-7">
                <div class="size-10 animate-pulse rounded-lg bg-accent"></div>
                <div class="grid gap-2">
                  <div class="h-3 w-32 animate-pulse rounded bg-accent"></div>
                  <div class="h-3 w-20 animate-pulse rounded bg-accent"></div>
                </div>
              </div>
            {/each}
          {:else if tab === FriendsTab.friends}
            <FriendsList onfind={() => (tab = FriendsTab.find)} onreview={() => (tab = FriendsTab.requests)} onremove={askToRemove} />
          {:else if tab === FriendsTab.requests}
            <RequestsList />
          {:else}
            <PlayerSearch />
          {/if}
        </div>
      {/key}
    </div>
  {/if}
</div>

<AlertDialog
  bind:open={confirmingRemoval}
  label="Friends"
  title="Remove {removing?.username}?"
  description="They'll be taken off your friends list. You can add them again any time."
  buttonLabel="Remove"
  onconfirm={confirmRemoval}
/>
