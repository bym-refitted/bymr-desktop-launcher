<script lang="ts">
  import HandFist from "@lucide/svelte/icons/hand-fist";
  import Play from "@lucide/svelte/icons/play";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import Sprout from "@lucide/svelte/icons/sprout";
  import pokey from "#lib/assets/art/pokey.png";
  import Button from "#lib/components/ui/Button.svelte";
  import Fact from "#lib/components/ui/Fact.svelte";
  import { launch } from "#lib/state/launch.svelte.js";
</script>

<section class="relative grid h-full grid-rows-[1fr_auto] overflow-hidden">
  <div class="absolute inset-0 contours"></div>

  <div class="relative flex flex-col justify-center px-11 max-[1100px]:px-8">
    <p class="eyebrow text-primary">Minigame</p>
    <h1 class="mt-3 mb-4 display text-[clamp(46px,5.2vw,70px)]">Attack of the<br /><em>Pokies.</em></h1>
    <p class="max-w-[440px] text-[15px] leading-relaxed text-muted-foreground">
      The original Backyard Monsters minigame, once only seen while the game was down for maintenance. No account needed.
    </p>
    <Button size="lg" class="mt-7 w-fit" onclick={() => launch.startPokies()} disabled={launch.launching}>
      <Play class="fill-current" />
      {launch.launching ? "Launching..." : "Play Pokies"}
    </Button>

    <figure class="absolute right-16 bottom-8 w-[200px] max-[1180px]:right-9 max-[1180px]:w-[160px]">
      <img src={pokey} alt="Pokey" class="-rotate-6" />
      <figcaption class="mt-3 flex justify-between border-t pt-2 text-[11.5px] text-muted-foreground">
        <span>Fig. 02</span>
        <span><b class="font-semibold text-foreground">Pokey</b> · Menace</span>
      </figcaption>
    </figure>
  </div>

  <div class="relative grid grid-cols-3 divide-x border-t">
    <Fact number="01" icon={Sprout} title="Collect mushrooms">Guide the worker to the mushrooms while dodging the Pokies.</Fact>
    <Fact number="02" icon={Sparkles} title="Go golden">Every 20 mushrooms, a golden one appears. Eat it to turn invincible.</Fact>
    <Fact number="03" icon={HandFist} title="Smash the Pokies">While it lasts, crush the Pokies by running straight into them.</Fact>
  </div>
</section>
