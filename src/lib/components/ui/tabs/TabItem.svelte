<script lang="ts">
  import { Menubar } from "bits-ui";
  import type { Component } from "svelte";
  import type { IconComponentProps } from "phosphor-svelte/lib/shared";
  import { Play } from "phosphor-svelte";
  
  import { page } from "$app/stores";

  export let path = "/";
  export let Icon: Component<IconComponentProps> = Play;
  export let text = "";
  $: active = path === $page.url.pathname;
  $: bgActive = active ? "bg-white/10" : "bg-transparent";
  $: textActive = active ? "text-primary" : "text-unselected";
</script>

<Menubar.Menu>
  <a
    href={path}
    class={`flex flex-row items-center w-full h-16 pl-6 gap-4 rounded-md text-unselected bg-transparent py-2 ${bgActive}`}
  >
    <svelte:component
      this={Icon}
      weight="bold"
      size="26"
      class={`${textActive}`}
    />
    <h4 class={`font-display ${textActive} whitespace-nowrap`}>{text}</h4>
  </a>
</Menubar.Menu>
