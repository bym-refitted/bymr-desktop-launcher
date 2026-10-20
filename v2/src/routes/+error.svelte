<script lang="ts">
  import { page } from "$app/state";
  import pokey from "#lib/assets/art/pokey.png";

  const notFound = $derived(page.status === 404);
</script>

<div class="grid h-full place-items-center">
  <div class="flex items-center gap-6">
    <img src={pokey} alt="" class="w-24 -rotate-6" />
    <div>
      <p class="eyebrow">Error {page.status}</p>
      <h1 class="mt-1 display text-4xl">
        {notFound ? "Nothing here yet." : "Something broke."}
      </h1>
      <p class="mt-2 text-muted-foreground">
        {notFound
          ? "This part of the yard is still being built."
          : page.error?.message}
      </p>
      <a
        href="/"
        class="mt-4 inline-block font-medium text-primary hover:underline"
      >
        Back to Play
      </a>
    </div>
  </div>
</div>
