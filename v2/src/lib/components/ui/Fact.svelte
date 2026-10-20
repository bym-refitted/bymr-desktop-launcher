<script lang="ts">
  import type { LucideIcon } from "@lucide/svelte";
  import type { Snippet } from "svelte";

  interface Props {
    number: string;
    icon: LucideIcon;
    title: string;
    children: Snippet;
  }

  let { number, icon: Icon, title, children }: Props = $props();
</script>

<div class="relative px-5 pt-4 pb-[18px]">
  <span class="absolute top-[15px] right-[18px] num">{number}</span>
  <h3 class="flex items-center gap-2 pr-6 text-sm font-semibold"><Icon class="size-4 text-primary" />{title}</h3>
  <p class="mt-1 text-[13px] text-muted-foreground">{@render children()}</p>
</div>
