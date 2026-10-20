<script lang="ts">
  import { Switch } from "bits-ui";

  interface Props {
    checked: boolean;
    label: string;
    disabled?: boolean;
    onchange?: (checked: boolean) => void;
  }

  let { checked = $bindable(), label, disabled = false, onchange }: Props = $props();
</script>

<Switch.Root
  bind:checked
  {disabled}
  onCheckedChange={onchange}
  aria-label={label}
  class="inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-border-strong bg-sunken px-0.5 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-primary/40 disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
>
  <Switch.Thumb
    class="size-[18px] rounded-full bg-muted-foreground shadow-sm transition-transform data-[state=checked]:translate-x-5 data-[state=checked]:bg-primary-foreground"
  />
</Switch.Root>
