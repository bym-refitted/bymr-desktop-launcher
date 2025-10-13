<script lang="ts">
  import { launchError } from "$lib/stores/launchStore";
  import AlertDialog from "$lib/components/AlertDialog.svelte";
  import Form from "$lib/components/ui/form/Form.svelte";
  import SniperTower from "../assets/images/snipertower.png";
  import {
    WarningDiamond,
    ShieldCheck,
    DiscordLogo,
  } from "phosphor-svelte";
  import { fly } from "svelte/transition";
  import { platform } from "@tauri-apps/plugin-os";
  import { Platform } from "$lib/enums";
  
  const isMobile = platform() === Platform.Android;
</script>

<div
  class="min-h-screen grid grid-cols-1 [@media(min-width:1500px)]:grid-cols-2 gap-8 px-6 py-8 [@media(min-width:1500px)]:px-12 overflow-x-hidden {isMobile ? 'pb-[70px]' : ''}"
>
  {#if isMobile}
    <!-- Mobile Layout: Single Column -->
    <div class="flex flex-col gap-8 mb-16">
      <!-- Header and Description -->
      <div class="flex flex-col items-start gap-4">
        <img
          src={SniperTower}
          alt="sniper tower"
          class="w-40 object-contain drop-shadow-2xl"
        />
        <h1 class="font-title text-4xl leading-tight text-foreground">
          Backyard Monsters Refitted
        </h1>
      </div>
      
      <div>
        <p class="text-lg leading-relaxed text-muted-foreground">
          The official Backyard Monsters Refitted server. A 1:1 preservation of
          the original Adobe Flash game, with the adoption of Map Room 2. All
          buildings, monsters and gameplay mechanics on this server are from the
          classic vanilla version of the game.
        </p>
      </div>

      <!-- Form -->
      <div class="w-full">
        <Form />
      </div>

      <!-- Info Cards -->
      <div class="grid gap-4">
        <div
          class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/[0.07] hover:border-primary/30 transition-all duration-300 group shadow-lg"
        >
          <div class="flex items-start gap-3">
            <div
              class="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors"
            >
              <ShieldCheck size={20} weight="bold" class="text-primary" />
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-primary mb-2">Fair Play Rules</h3>
              <p class="text-lg text-muted-foreground leading-relaxed">
                This server has strict monitoring for cheating to ensure a fair
                and enjoyable experience for all players. Any form of cheating or
                exploits will result in a permanent ban.
              </p>
            </div>
          </div>
        </div>

        <div
          class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/[0.07] hover:border-secondary/30 transition-all duration-300 group shadow-lg"
        >
          <div class="flex items-start gap-3">
            <div
              class="bg-secondary/10 p-2 rounded-lg group-hover:bg-secondary/20 transition-colors"
            >
              <DiscordLogo size={20} weight="bold" class="text-secondary" />
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-bold text-secondary mb-2">
                Discord Verification
              </h3>
              <p class="text-lg text-muted-foreground leading-relaxed mb-2">
                Visit our Discord server to verify your account and play on the
                server. This is to help us reduce ban evasion, bot accounts and
                maintain a healthy community.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <!-- Desktop Layout: Two Columns -->
    <div class="grid grid-cols-1 [@media(min-width:1500px)]:grid-cols-2 gap-8">
      <!-- Content Section -->
      <div
        class="flex flex-col justify-start [@media(min-width:1500px)]:pr-8 [@media(min-width:1500px)]:pt-16"
        in:fly={{ x: -50, duration: 600, delay: 100 }}
      >
        <div class="flex flex-col items-start gap-4 mb-8">
          <img
            src={SniperTower}
            alt="sniper tower"
            class="w-40 object-contain drop-shadow-2xl"
          />
          <h1
            class="font-title text-5xl leading-tight text-foreground"
          >
            Backyard Monsters Refitted
          </h1>
        </div>
        <div class="mb-8">
          <p class="text-lg leading-relaxed text-muted-foreground">
            The official Backyard Monsters Refitted server. A 1:1 preservation of
            the original Adobe Flash game, with the adoption of Map Room 2. All
            buildings, monsters and gameplay mechanics on this server are from the
            classic vanilla version of the game.
          </p>
        </div>

        <div class="grid gap-4">
          <div
            class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/[0.07] hover:border-primary/30 transition-all duration-300 group shadow-lg"
          >
            <div class="flex items-start gap-3">
              <div
                class="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors"
              >
                <ShieldCheck size={20} weight="bold" class="text-primary" />
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-primary mb-2">Fair Play Rules</h3>
                <p class="text-lg text-muted-foreground leading-relaxed">
                  This server has strict monitoring for cheating to ensure a fair
                  and enjoyable experience for all players. Any form of cheating or
                  exploits will result in a permanent ban.
                </p>
              </div>
            </div>
          </div>

          <div
            class="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/[0.07] hover:border-secondary/30 transition-all duration-300 group shadow-lg"
          >
            <div class="flex items-start gap-3">
              <div
                class="bg-secondary/10 p-2 rounded-lg group-hover:bg-secondary/20 transition-colors"
              >
                <DiscordLogo size={20} weight="bold" class="text-secondary" />
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-secondary mb-2">
                  Discord Verification
                </h3>
                <p class="text-lg text-muted-foreground leading-relaxed mb-2">
                  Visit our Discord server to verify your account and play on the
                  server. This is to help us reduce ban evasion, bot accounts and
                  maintain a healthy community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Form Section -->
      <div
        class="flex flex-col items-start justify-center [@media(min-width:1500px)]:pl-8"
        in:fly={{ x: 50, duration: 600, delay: 200 }}
      >
        <div class="w-full [@media(min-width:1500px)]:max-w-md">
          <Form />
        </div>
      </div>
    </div>
  {/if}
</div>

<AlertDialog
  bind:open={$launchError.show}
  error={$launchError.code}
  Icon={WarningDiamond}
/>
