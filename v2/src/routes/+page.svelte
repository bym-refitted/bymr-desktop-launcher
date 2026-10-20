<script lang="ts">
  import Play from "@lucide/svelte/icons/play";
  import Map from "@lucide/svelte/icons/map";
  import ShieldCheck from "@lucide/svelte/icons/shield-check";
  import Trash from "@lucide/svelte/icons/trash-2";
  import X from "@lucide/svelte/icons/x";
  import Button from "#lib/components/ui/Button.svelte";
  import korath from "#lib/assets/art/korath.png";
  import pokey from "#lib/assets/art/pokey.png";

  const swatches = [
    "background",
    "card",
    "sunken",
    "accent",
    "border",
    "border-strong",
    "primary",
    "secondary",
    "success",
    "warning",
    "destructive",
    "muted-foreground",
  ];
</script>

<div class="grid h-full grid-cols-2 overflow-auto">
  {#each ["dark", "light"] as mode (mode)}
    <section
      data-theme={mode}
      class="relative flex flex-col gap-5 overflow-hidden border-r bg-background p-8 text-foreground"
    >
      <div class="contours absolute inset-0"></div>

      <div class="relative">
        <p class="eyebrow">
          <span class="num">0{mode === "dark" ? 1 : 2}</span> &nbsp;/&nbsp; {mode}
          theme
        </p>
        <h1 class="mt-2 display text-5xl">Your yard is <em>waiting.</em></h1>
        <p class="mt-3 max-w-sm text-[15px] text-muted-foreground">
          Inter body text on the slate palette. Your monsters have been very
          patient.
        </p>
      </div>

      <div class="relative flex flex-wrap items-center gap-2">
        <Button size="lg"><Play class="fill-current" />Sign in & Play</Button>
        <Button variant="secondary">Create account</Button>
        <Button variant="outline">Sign out</Button>
        <Button variant="ghost" size="icon" aria-label="Close"><X /></Button>
        <Button variant="destructive"><Trash />Remove</Button>
        <Button variant="link">Forgot?</Button>
      </div>

      <div class="relative grid grid-cols-6 gap-2">
        {#each swatches as name (name)}
          <div class="grid gap-1">
            <div
              class="h-9 rounded-md border"
              style="background: var(--{name})"
            ></div>
            <span class="truncate text-[10.5px] text-muted-foreground"
              >{name}</span
            >
          </div>
        {/each}
      </div>

      <div class="relative mt-auto grid grid-cols-[1fr_180px] items-end gap-4">
        <div class="relative grid grid-cols-2 border bg-card">
          <img
            src={pokey}
            alt=""
            class="absolute bottom-full left-3 -mb-1.5 w-11 -rotate-6"
          />
          <div class="relative p-4">
            <span class="absolute top-3.5 right-4 num">01</span>
            <h3 class="flex items-center gap-2 text-sm font-semibold">
              <Map class="size-4 text-primary" />Map Rooms 1–3
            </h3>
            <p class="mt-1 text-[13px] text-muted-foreground">
              All three world maps.
            </p>
          </div>
          <div class="relative border-l p-4">
            <span class="absolute top-3.5 right-4 num">02</span>
            <h3 class="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck class="size-4 text-primary" />Fair play
            </h3>
            <p class="mt-1 text-[13px] text-muted-foreground">
              Cheats mean a permanent ban.
            </p>
          </div>
        </div>
        <figure>
          <img src={korath} alt="Korath" class="mx-auto" />
          <figcaption
            class="mt-2 flex justify-between border-t pt-2 text-[11.5px] text-muted-foreground"
          >
            <span>Fig. 01</span><span
              ><b class="font-semibold text-foreground">Korath</b> · Champion</span
            >
          </figcaption>
        </figure>
      </div>
    </section>
  {/each}
</div>
