<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '../app.css';
  import favicon from '$lib/client/assets/favicon.svg';

  let { children } = $props();

  const siteTitle = 'Naruto Mens Wear';
  const description =
    'An application designed to manage bills, stocks, and accounts for Naruto Mens Wear';
</script>

<svelte:head>
  <title>{siteTitle}</title>
  <meta name="description" content={description} />
  <link rel="icon" type="image/svg+xml" href={favicon} />

  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta charset="utf-8" />
</svelte:head>

<main id="main-content">
  {@render children()}
</main>

<style>
  main {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
</style>
