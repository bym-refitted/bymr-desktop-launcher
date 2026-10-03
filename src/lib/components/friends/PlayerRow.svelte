<script lang="ts">
  import { ImageBroken } from "phosphor-svelte";

  export let username = "";
  export let picSquare: string | null = null;
  export let level = 0;
  export let online = false;
  export let note = "";

  let imageFailed = false;

  $: avatar = picSquare && !imageFailed ? picSquare : null;
</script>

<div
  class="flex items-center gap-4 border-b border-gray-700 px-5 py-4 last:border-b-0 hover:bg-gray-700/40 transition-colors"
>
  <div class="relative shrink-0">
    {#if avatar}
      <img
        src={avatar}
        alt={username}
        class="w-11 h-11 rounded-[4px] object-cover"
        on:error={() => (imageFailed = true)}
      />
    {:else}
      <div
        class="w-11 h-11 rounded-[4px] bg-gray-600 flex items-center justify-center"
      >
        <ImageBroken size={18} />
      </div>
    {/if}

    {#if online}
      <span
        class="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary border-2 border-gray-800"
        title="Online now"
      ></span>
    {/if}
  </div>

  <div class="min-w-0 flex-1">
    <p class="font-display text-white truncate">{username}</p>
    <p class="text-xs text-white/50 truncate">
      {#if level > 0}Level {level}{:else}No base yet{/if}{#if note}
        · {note}{/if}
    </p>
  </div>

  <div class="flex items-center gap-2 shrink-0">
    <slot />
  </div>
</div>
