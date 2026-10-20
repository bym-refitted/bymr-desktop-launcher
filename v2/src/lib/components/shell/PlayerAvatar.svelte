<script lang="ts">
  import eyera from "#lib/assets/art/eyera.png";
  import { user } from "#lib/state/user.svelte.js";

  interface Props {
    class?: string;
  }

  let { class: className }: Props = $props();

  let failedUrl = $state("");

  const src = $derived(user.avatar && user.avatar !== failedUrl ? user.avatar : eyera);
</script>

<img {src} alt="" class="border bg-accent object-contain {className}" onerror={() => (failedUrl = user.avatar)} />
