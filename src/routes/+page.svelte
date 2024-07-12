<script lang="ts">
  import AlertDialog from '$lib/components/AlertDialog.svelte';

  import Form from '$lib/components/Form.svelte';
  import { launchError } from '$lib/stores/launchStore';
</script>

<div class="grid grid-cols-1 gap-x-8 minWindowSize:grid-cols-2" style="grid-template-rows: 800px;">
  <div class="grid-item flex flex-col justify-center p-16">
    <h1 class="text-4xl font-display py-4">Official Refitted Servers:</h1>
    <p class="text-md font-medium text-muted-foreground">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
      laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
      voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
      non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </p>
  </div>
  <div class="grid-item flex flex-col justify-center mt-36">
    <Form />
  </div>
</div>

<AlertDialog bind:open={$launchError.show} error={$launchError.code}></AlertDialog>
