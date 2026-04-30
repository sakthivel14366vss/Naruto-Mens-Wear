<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '../app.css';
  import favicon from '$lib/client/assets/favicon.svg';
  import Toast from '$lib/client/components/Toast.svelte';

  let { children } = $props();

  const siteTitle = 'NMW';
  const description = 'An application designed to manage bills, stocks, and accounts for NMW';
</script>

<svelte:head>
  <title>{siteTitle}</title>
  <meta name="description" content={description} />
  <link rel="icon" type="image/svg+xml" href={favicon} />

  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta charset="utf-8" />
</svelte:head>

<Toast position="top-right" />
<main
  id="main-content"
  class="border-white bg-linear-to-br from-black via-gray-900 to-gray-800 font-semibold text-white"
>
  {@render children()}
</main>

<style>
  main {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
</style>
