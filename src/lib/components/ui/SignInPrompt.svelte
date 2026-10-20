<script lang="ts">
  import { goto } from "$app/navigation";
  import brain from "#lib/assets/art/brain.png";
  import Button from "#lib/components/ui/Button.svelte";

  interface Props {
    title: string;
    description: string;
  }

  let { title, description }: Props = $props();
</script>

<div class="grid flex-1 place-content-center justify-items-center gap-3 text-center">
  <img src={brain} alt="" class="w-20" />
  <p class="font-semibold">{title}</p>
  <p class="text-muted-foreground">{description}</p>
  <Button class="mt-2" onclick={() => goto("/")}>Go to sign in</Button>
</div>
