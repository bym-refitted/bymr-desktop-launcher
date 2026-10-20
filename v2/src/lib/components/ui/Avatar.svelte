<script lang="ts">
  import eyera from "#lib/assets/art/eyera.png";

  interface Props {
    src?: string | null;
    class?: string;
  }

  let { src, class: className }: Props = $props();

  let failedUrl = $state("");

  const shown = $derived(src && src !== failedUrl ? src : eyera);
</script>

<img src={shown} alt="" class="border bg-accent object-contain {className}" onerror={() => (failedUrl = src ?? "")} />
