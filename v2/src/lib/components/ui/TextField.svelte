<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLInputAttributes, "value"> {
    label: string;
    value?: string | number;
    error?: string;
    aside?: Snippet;
    trailing?: Snippet;
  }

  let { label, value = $bindable(), error, aside, trailing, ...rest }: Props = $props();

  const id = $props.id();
</script>

<div class="grid content-start gap-1.5">
  <div class="flex items-center justify-between text-[12.5px] font-medium text-muted-foreground">
    <label for={id}>{label}</label>
    {@render aside?.()}
  </div>
  <div class="flex gap-2">
    <input
      {id}
      bind:value
      aria-invalid={error ? true : undefined}
      class="h-10 w-full min-w-0 rounded-lg border border-border-strong bg-sunken px-3 transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground/50 focus:border-primary focus:ring-3 focus:ring-primary/20 disabled:cursor-not-allowed disabled:text-muted-foreground disabled:opacity-70 aria-invalid:border-destructive"
      {...rest}
    />
    {@render trailing?.()}
  </div>
  {#if error}
    <p class="text-xs text-destructive">{error}</p>
  {/if}
</div>
