<script lang="ts">
  import { Menubar } from 'bits-ui';
  import Controller from 'phosphor-svelte/lib/GameController';
  import type { IconProps, SvelteComponent } from 'phosphor-svelte/lib/shared';
  import { page } from '$app/stores';

  export let path = '/';
  export let Icon: typeof SvelteComponent<IconProps> = Controller;
  export let text;
  $: active = path === $page.url.pathname;
  $: activeStyle = active ? 'bg-white/10 text-primary' : '';
</script>

<Menubar.Menu>
  <a
    href={path}
    class={`flex flex-row items-center w-full h-16 pl-6 gap-4 rounded-md text-unselected bg-transparent py-2 ${activeStyle}`}
  >
    <svelte:component this={Icon} weight="bold" size="26" />
    <h4 class="font-display">{text}</h4>
  </a>
</Menubar.Menu>
