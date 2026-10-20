<script lang="ts">
  import placeholder from "#lib/assets/art/placeholder.jpg";

  interface Props {
    src?: string | null;
    class?: string;
  }

  let { src, class: className }: Props = $props();

  let failedUrl = $state("");

  const shown = $derived(src && src !== failedUrl ? src : placeholder);
</script>

<img src={shown} alt="" class="border bg-accent object-contain {className}" onerror={() => (failedUrl = src ?? "")} />
