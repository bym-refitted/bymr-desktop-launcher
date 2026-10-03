<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import {
    Gift,
    UsersThree,
    MagnifyingGlass,
    UserPlus,
    UserMinus,
    Check,
    X,
    Clock,
    Warning,
  } from "phosphor-svelte";

  import { Method } from "$lib/enums/Method";
  import { FriendRelation, FriendshipStatus, FriendsTab } from "$lib/enums/Friends";
  import { user } from "$lib/stores/userStore";
  import { invokeApiRequest } from "$lib/utils/invokeApiRequest";
  import { handleErrorMessage } from "$lib/errors/errorMessages";
  import { timeAgo } from "$lib/utils/timeAgo";
  import { addErrorLog } from "$lib/stores/debugLogStore";
  import ConfirmDialog from "$lib/components/ConfirmDialog.svelte";
  import Loader from "$lib/components/Loader.svelte";
  import PlayerRow from "$lib/components/friends/PlayerRow.svelte";

  interface FriendPlayer {
    user_id: number;
    username: string;
    pic_square: string | null;
    level: number;
    online: boolean;
  }

  interface FriendEntry extends FriendPlayer {
    since: string | null;
    gift_ready_at: number | null;
  }

  interface RequestEntry extends FriendPlayer {
    request_id: number;
    sent_at: string;
  }

  interface SearchResult extends FriendPlayer {
    relation: FriendRelation;
    request_id: number | null;
  }

  interface FriendsResponse {
    friends: FriendEntry[];
    incoming: RequestEntry[];
    outgoing: RequestEntry[];
  }

  interface SearchResponse {
    players: SearchResult[];
  }

  const SEARCH_DEBOUNCE_MS = 300;
  const SEARCH_MIN_LENGTH = 2;
  const GIFT_COOLDOWN_SECONDS = 24 * 60 * 60;

  let activeTab: FriendsTab = FriendsTab.FRIENDS;

  let friends: FriendEntry[] = [];
  let incoming: RequestEntry[] = [];
  let outgoing: RequestEntry[] = [];
  let hasLoaded = false;

  let searchTerm = "";
  let results: SearchResult[] = [];
  let isSearching = false;
  let hasSearched = false;
  let searchTimer: ReturnType<typeof setTimeout>;

  let busyIds: number[] = [];

  let errorMessage = "";

  let confirmOpen = false;
  let pendingRemoval: FriendPlayer | null = null;

  $: requestCount = incoming.length;
  $: isBusy = (userId: number) => busyIds.includes(userId);

  const setBusy = (userId: number, busy: boolean) => {
    busyIds = busy ? [...busyIds, userId] : busyIds.filter((id) => id !== userId);
  };

  const fail = (error: unknown, context: string) => {
    errorMessage = handleErrorMessage(error);
    addErrorLog(`${context}: ${errorMessage}`);
  };

  const loadFriends = async () => {
    if (!$user.token) {
      hasLoaded = true;
      return;
    }

    try {
      const { data } = await invokeApiRequest<FriendsResponse>("/friends", {}, Method.GET);

      friends = data.friends ?? [];
      incoming = data.incoming ?? [];
      outgoing = data.outgoing ?? [];
      errorMessage = "";
    } catch (error) {
      fail(error, "Could not load friends");
    } finally {
      hasLoaded = true;
    }
  };

  const runSearch = async (term: string) => {
    if (term.trim().length < SEARCH_MIN_LENGTH) {
      results = [];
      hasSearched = false;
      return;
    }

    isSearching = true;

    try {
      const query = encodeURIComponent(term.trim());
      const { data } = await invokeApiRequest<SearchResponse>(`/friends/search?search=${query}`, {}, Method.GET);

      results = data.players ?? [];
      errorMessage = "";
    } catch (error) {
      fail(error, "Could not search players");
    } finally {
      isSearching = false;
      hasSearched = true;
    }
  };

  /** Debounced so a search only fires once the player stops typing. */
  const onSearchInput = () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => runSearch(searchTerm), SEARCH_DEBOUNCE_MS);
  };

  /**
   * Re-labels one search result after acting on them, so the button follows the
   * new state without running the search again.
   */
  const setResultRelation = (userId: number, relation: FriendRelation, requestId: number | null = null) => {
    results = results.map((player) => {
      if (player.user_id !== userId) return player;

      return { ...player, relation, request_id: requestId };
    });
  };

  const sendRequest = async (player: FriendPlayer) => {
    setBusy(player.user_id, true);

    try {
      const { data } = await invokeApiRequest<{ status: FriendshipStatus }>(
        "/friends/request",
        { userid: player.user_id },
        Method.POST
      );

      const accepted = data.status === FriendshipStatus.ACCEPTED;

      setResultRelation(player.user_id, accepted ? FriendRelation.FRIENDS : FriendRelation.PENDING_OUTGOING);
      await loadFriends();
    } catch (error) {
      fail(error, `Could not add ${player.username}`);
    } finally {
      setBusy(player.user_id, false);
    }
  };

  const respond = async (request: RequestEntry | SearchResult, accept: boolean) => {
    if (!request.request_id) return;

    setBusy(request.user_id, true);

    try {
      await invokeApiRequest("/friends/respond", { request_id: request.request_id, accept }, Method.POST);

      setResultRelation(request.user_id, accept ? FriendRelation.FRIENDS : FriendRelation.NONE);
      await loadFriends();
    } catch (error) {
      fail(error, `Could not answer ${request.username}`);
    } finally {
      setBusy(request.user_id, false);
    }
  };

  const removePlayer = async (player: FriendPlayer) => {
    setBusy(player.user_id, true);

    try {
      await invokeApiRequest("/friends/remove", { userid: player.user_id }, Method.POST);

      setResultRelation(player.user_id, FriendRelation.NONE);
      await loadFriends();
    } catch (error) {
      fail(error, `Could not remove ${player.username}`);
    } finally {
      setBusy(player.user_id, false);
    }
  };

  /**
   * Sends a mystery sack, then starts the friend's cooldown locally so the button
   * settles without waiting for a refetch.
   */
  const sendGift = async (friend: FriendEntry) => {
    setBusy(friend.user_id, true);

    try {
      await invokeApiRequest("/gifts/send", { userid: friend.user_id }, Method.POST);

      const readyAt = Math.floor(Date.now() / 1000) + GIFT_COOLDOWN_SECONDS;

      friends = friends.map((entry) =>
        entry.user_id === friend.user_id ? { ...entry, gift_ready_at: readyAt } : entry
      );
    } catch (error) {
      fail(error, `Could not send ${friend.username} a gift`);
    } finally {
      setBusy(friend.user_id, false);
    }
  };

  /**
   * How long until a gift can be sent again, for the button's label.
   */
  const giftReadyIn = (readyAt: number | null) => {
    if (!readyAt) return "";

    const minutes = Math.ceil((readyAt - Date.now() / 1000) / 60);

    if (minutes <= 0) return "";
    if (minutes < 60) return `${minutes}m`;

    return `${Math.ceil(minutes / 60)}h`;
  };

  const askToRemove = (player: FriendPlayer) => {
    pendingRemoval = player;
    confirmOpen = true;
  };

  const confirmRemoval = () => {
    if (pendingRemoval) removePlayer(pendingRemoval);
    pendingRemoval = null;
  };

  onMount(loadFriends);
</script>

<svelte:head>
  <title>Friends</title>
</svelte:head>

<div class="mb-16 flex justify-start items-start lg:py-16 lg:mt-[6%] lg:py-0">
  <div class="w-full lg:w-3/5 mx-4 lg:ml-[12%] lg:mr-0">
    <div
      class="flex flex-col items-center text-muted-foreground"
      in:fly={{ y: 30, duration: 600, delay: 100 }}
    >
      <h1 class="text-white font-title leading-snug pt-12 text-5xl lg:text-7xl lg:pt-0">Friends</h1>
    </div>

    <div class="mt-16" in:fly={{ y: 30, duration: 600, delay: 200 }}>
      {#if !$user.token}
        <div class="bg-gray-800 rounded-lg p-12 text-center">
          <p class="font-display text-white text-xl mb-2">Sign in to see your friends</p>
          <p class="text-white/60 max-w-md mx-auto">
            Your friends list follows your account, so you will need to log in first.
          </p>
        </div>
      {:else}
        <div class="flex flex-row gap-2 text-sm font-display overflow-x-auto">
          <button
            class="shrink-0 whitespace-nowrap px-3 sm:px-4 py-2 rounded-md transition-colors cursor-pointer {activeTab === FriendsTab.FRIENDS
              ? 'bg-white/10 text-primary'
              : 'text-unselected hover:bg-white/5'}"
            on:click={() => (activeTab = FriendsTab.FRIENDS)}
          >
            Friends ({friends.length})
          </button>
          <button
            class="shrink-0 whitespace-nowrap px-3 sm:px-4 py-2 rounded-md transition-colors cursor-pointer {activeTab === FriendsTab.REQUESTS
              ? 'bg-white/10 text-primary'
              : 'text-unselected hover:bg-white/5'}"
            on:click={() => (activeTab = FriendsTab.REQUESTS)}
          >
            Requests{#if requestCount > 0}
              <span class="ml-2 px-2 py-0.5 rounded-full bg-primary text-black text-xs">{requestCount}</span>
            {/if}
          </button>
          <button
            class="shrink-0 whitespace-nowrap px-3 sm:px-4 py-2 rounded-md transition-colors cursor-pointer {activeTab === FriendsTab.FIND
              ? 'bg-white/10 text-primary'
              : 'text-unselected hover:bg-white/5'}"
            on:click={() => (activeTab = FriendsTab.FIND)}
          >
            Find Players
          </button>
        </div>

        {#if errorMessage}
          <div
            class="mt-4 flex items-center gap-3 rounded-lg bg-red/10 border border-red/40 px-4 py-3 text-sm text-red"
          >
            <Warning size={20} weight="bold" />
            <span>{errorMessage}</span>
          </div>
        {/if}

        <div class="mt-6 bg-gray-800 rounded-lg overflow-hidden">
          {#if !hasLoaded}
            <div class="flex justify-center py-16"><Loader /></div>
          {:else if activeTab === FriendsTab.FRIENDS}
            {#if friends.length > 0}
              {#each friends as friend (friend.user_id)}
                <PlayerRow
                  username={friend.username}
                  picSquare={friend.pic_square}
                  level={friend.level}
                  online={friend.online}
                  note={friend.online ? "Online now" : ""}
                >
                  {#if giftReadyIn(friend.gift_ready_at)}
                    <span
                      class="flex items-center gap-2 px-3 py-2 text-xs text-white/40"
                      title="One gift per friend each day"
                    >
                      <Gift size={16} weight="bold" />
                      {giftReadyIn(friend.gift_ready_at)}
                    </span>
                  {:else}
                    <button
                      class="flex items-center gap-2 px-3 py-2 rounded-md text-xs bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      disabled={isBusy(friend.user_id)}
                      on:click={() => sendGift(friend)}
                    >
                      <Gift size={16} weight="bold" />
                      Gift
                    </button>
                  {/if}

                  <button
                    class="flex items-center gap-2 px-3 py-2 rounded-md text-xs text-white/70 hover:text-red hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={isBusy(friend.user_id)}
                    on:click={() => askToRemove(friend)}
                  >
                    <UserMinus size={16} weight="bold" />
                    Remove
                  </button>
                </PlayerRow>
              {/each}
            {:else}
              <div class="flex flex-col items-center justify-center px-6 py-12 text-center lg:px-20">
                <p class="font-display text-white text-xl mb-2">No friends yet</p>
                <p class="text-white/60 max-w-md mx-auto">
                  Head to Find Players to search for someone by name and send them a request.
                </p>
              </div>
            {/if}
          {:else if activeTab === FriendsTab.REQUESTS}
            {#if incoming.length === 0 && outgoing.length === 0}
              <div class="flex flex-col items-center justify-center px-6 py-12 text-center lg:px-20">
                <p class="font-display text-white text-xl mb-2">Nothing waiting</p>
                <p class="text-white/60 max-w-md mx-auto">
                  Friend requests you send or receive will show up here.
                </p>
              </div>
            {:else}
              {#if incoming.length > 0}
                <p class="px-5 pt-4 pb-2 text-xs uppercase tracking-widest font-display text-white/50">
                  Waiting on you
                </p>
                {#each incoming as request (request.request_id)}
                  <PlayerRow
                    username={request.username}
                    picSquare={request.pic_square}
                    level={request.level}
                    online={request.online}
                    note={`Asked ${timeAgo(request.sent_at)}`}
                  >
                    <button
                      class="flex items-center gap-2 px-3 py-2 rounded-md text-xs bg-primary/20 text-primary hover:bg-primary/30 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      disabled={isBusy(request.user_id)}
                      on:click={() => respond(request, true)}
                    >
                      <Check size={16} weight="bold" />
                      Accept
                    </button>
                    <button
                      class="flex items-center gap-2 px-3 py-2 rounded-md text-xs text-white/70 hover:text-red hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      disabled={isBusy(request.user_id)}
                      on:click={() => respond(request, false)}
                    >
                      <X size={16} weight="bold" />
                      Decline
                    </button>
                  </PlayerRow>
                {/each}
              {/if}

              {#if outgoing.length > 0}
                <p class="px-5 pt-4 pb-2 text-xs uppercase tracking-widest font-display text-white/50">
                  Waiting on them
                </p>
                {#each outgoing as request (request.request_id)}
                  <PlayerRow
                    username={request.username}
                    picSquare={request.pic_square}
                    level={request.level}
                    online={request.online}
                    note={`Sent ${timeAgo(request.sent_at)}`}
                  >
                    <button
                      class="flex items-center gap-2 px-3 py-2 rounded-md text-xs text-white/70 hover:text-red hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      disabled={isBusy(request.user_id)}
                      on:click={() => removePlayer(request)}
                    >
                      <X size={16} weight="bold" />
                      Cancel
                    </button>
                  </PlayerRow>
                {/each}
              {/if}
            {/if}
          {:else}
            <div class="p-5 border-b border-gray-700">
              <div class="relative">
                <MagnifyingGlass
                  size={18}
                  weight="bold"
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                />
                <input
                  type="text"
                  bind:value={searchTerm}
                  on:input={onSearchInput}
                  placeholder="Search players by name..."
                  class="w-full rounded-md bg-gray-700 py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-primary/60"
                />
              </div>
              <p class="mt-2 text-xs text-white/40">
                Type at least {SEARCH_MIN_LENGTH} characters. Players who have never played are not listed.
              </p>
            </div>

            {#if isSearching}
              <div class="flex justify-center py-12"><Loader size={2} /></div>
            {:else if results.length > 0}
              {#each results as player (player.user_id)}
                <PlayerRow
                  username={player.username}
                  picSquare={player.pic_square}
                  level={player.level}
                  online={player.online}
                >
                  {#if player.relation === FriendRelation.FRIENDS}
                    <span class="flex items-center gap-2 px-3 py-2 text-xs text-primary">
                      <UsersThree size={16} weight="bold" />
                      Friends
                    </span>
                  {:else if player.relation === FriendRelation.PENDING_OUTGOING}
                    <span class="flex items-center gap-2 px-3 py-2 text-xs text-white/50">
                      <Clock size={16} weight="bold" />
                      Requested
                    </span>
                  {:else if player.relation === FriendRelation.PENDING_INCOMING}
                    <button
                      class="flex items-center gap-2 px-3 py-2 rounded-md text-xs bg-primary/20 text-primary hover:bg-primary/30 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      disabled={isBusy(player.user_id)}
                      on:click={() => respond(player, true)}
                    >
                      <Check size={16} weight="bold" />
                      Accept
                    </button>
                  {:else}
                    <button
                      class="flex items-center gap-2 px-3 py-2 rounded-md text-xs bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      disabled={isBusy(player.user_id)}
                      on:click={() => sendRequest(player)}
                    >
                      <UserPlus size={16} weight="bold" />
                      Add
                    </button>
                  {/if}
                </PlayerRow>
              {/each}
            {:else if hasSearched}
              <div class="flex flex-col items-center justify-center px-6 py-12 text-center lg:px-20">
                <p class="font-display text-white text-xl mb-2">No players found</p>
                <p class="text-white/60 max-w-md mx-auto">
                  Nobody matched "{searchTerm}". Check the spelling, or try part of the name.
                </p>
              </div>
            {:else}
              <div class="flex flex-col items-center justify-center px-6 py-12 text-center lg:px-20">
                <p class="font-display text-white text-xl mb-2">Find your friends</p>
                <p class="text-white/60 max-w-md mx-auto">
                  Search for a player by name to send them a friend request.
                </p>
              </div>
            {/if}
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>

<ConfirmDialog
  bind:open={confirmOpen}
  title="Remove friend"
  description={`${pendingRemoval?.username ?? "This player"} will be removed from your friends list. You can always add them again later.`}
  confirmText="Remove"
  Icon={UserMinus}
  on:confirm={confirmRemoval}
/>
