<script>
  import Navbar from "$lib/components/Navbar.svelte";
  import { getVersion } from "@tauri-apps/api/app";
  import "../app.pcss";
  let current_launcher_version = "0.0.0";

  (async () => {
    current_launcher_version = await getVersion();
  })();
</script>

<div class="flex flex-col h-screen">
  <main
    class="flex-1 overflow-auto bg-background text-foreground flex flex-col gap-4 p-4 antialiased select-none font-sans"
  >
    <Navbar />
    <slot />
  </main>
  <footer
    class="bg-black px-4 py-1 flex-none flex flex-row-reverse bg-opacity-25 mt-2"
  >
    <p class="font-display"><small>v{current_launcher_version}</small></p>
  </footer>
</div>
