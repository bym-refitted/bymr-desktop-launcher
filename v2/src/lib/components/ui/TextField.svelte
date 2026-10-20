<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLInputAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLInputAttributes, "value"> {
    label: string;
    value?: string | number;
    error?: string;
    aside?: Snippet;
  }

  let { label, value = $bindable(), error, aside, ...rest }: Props = $props();

  const id = $props.id();
</script>

<div class="grid content-start gap-1.5">
  <div class="flex items-center justify-between text-[12.5px] font-medium text-muted-foreground">
    <label for={id}>{label}</label>
    {@render aside?.()}
  </div>
  <input
    {id}
    bind:value
    aria-invalid={error ? true : undefined}
    class="h-10 w-full rounded-lg border border-border-strong bg-sunken px-3 transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground/50 focus:border-primary focus:ring-3 focus:ring-primary/20 aria-invalid:border-destructive"
    {...rest}
  />
  {#if error}
    <p class="text-xs text-destructive">{error}</p>
  {/if}
</div>
