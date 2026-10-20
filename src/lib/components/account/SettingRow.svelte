<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    title: string;
    description: string;
    icon: Snippet;
    children: Snippet;
  }

  let { title, description, icon, children }: Props = $props();
</script>

<section class="grid grid-cols-[minmax(0,500px)_minmax(0,360px)] gap-12 border-b px-7 py-6 max-[1100px]:gap-8">
  <div class="flex gap-4">
    <div class="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
      {@render icon()}
    </div>
    <div>
      <h2 class="font-semibold">{title}</h2>
      <p class="mt-1 max-w-[440px] text-[13px] leading-relaxed text-muted-foreground">{description}</p>
    </div>
  </div>
  <div class="grid content-start gap-2.5">
    {@render children()}
  </div>
</section>
