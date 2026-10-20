<script lang="ts">
  import Map from "@lucide/svelte/icons/map";
  import ShieldCheck from "@lucide/svelte/icons/shield-check";
  import TicketCheck from "@lucide/svelte/icons/ticket-check";
  import { openUrl } from "@tauri-apps/plugin-opener";
  import korath from "#lib/assets/art/korath.png";
  import pokey from "#lib/assets/art/pokey.png";

  const DISCORD_URL = "https://discord.gg/bymrefitted";
</script>

<section class="relative grid min-w-0 grid-rows-[1fr_auto] overflow-hidden border-r">
  <div class="absolute inset-0 contours"></div>

  <div class="relative flex flex-col justify-center px-11 max-[1100px]:px-8">
    <p class="eyebrow text-primary">Official server</p>
    <h1 class="mt-3 mb-4 display text-[clamp(46px,5.2vw,70px)]">Back to the<br /><em>backyard.</em></h1>
    <p class="max-w-[440px] text-[15px] leading-relaxed text-muted-foreground">
      The original Flash base-builder, preserved one-to-one. Every building, monster and Map Room, exactly as it was.
    </p>

    <figure class="absolute right-9 bottom-6 w-[150px] max-[1180px]:hidden">
      <img src={korath} alt="Korath" class="lava-glow" />
      <figcaption class="mt-2 flex justify-between border-t pt-2 text-[11.5px] text-muted-foreground">
        <span>Fig. 01</span>
        <span><b class="font-semibold text-foreground">Korath</b> · Champion</span>
      </figcaption>
    </figure>
  </div>

  <div class="relative grid grid-cols-3 border-t">
    <img src={pokey} alt="" class="absolute bottom-full left-10 -mb-1.5 w-[52px] -rotate-6 max-[1100px]:hidden" />

    <div class="relative px-5 pt-4 pb-[18px]">
      <span class="absolute top-[15px] right-[18px] num">01</span>
      <h3 class="flex items-center gap-2 pr-6 text-sm font-semibold"><Map class="size-4 text-primary" />Map Rooms 1–3</h3>
      <p class="mt-1 text-[13px] text-muted-foreground">All three Map Room versions, playable just as they shipped.</p>
    </div>
    <div class="relative border-l px-5 pt-4 pb-[18px]">
      <span class="absolute top-[15px] right-[18px] num">02</span>
      <h3 class="flex items-center gap-2 pr-6 text-sm font-semibold"><ShieldCheck class="size-4 text-primary" />Fair play</h3>
      <p class="mt-1 text-[13px] text-muted-foreground">Cheating is monitored. Cheats and exploits mean a permanent ban.</p>
    </div>
    <div class="relative border-l px-5 pt-4 pb-[18px]">
      <span class="absolute top-[15px] right-[18px] num">03</span>
      <h3 class="flex items-center gap-2 pr-6 text-sm font-semibold"><TicketCheck class="size-4 text-primary" />Verify first</h3>
      <p class="mt-1 text-[13px] text-muted-foreground">
        Link your account on <button class="text-secondary hover:underline" onclick={() => openUrl(DISCORD_URL)}>Discord</button>
        before you jump in.
      </p>
    </div>
  </div>
</section>
