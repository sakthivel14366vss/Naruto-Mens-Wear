<script lang="ts">
  import type { Snippet } from 'svelte';
  import { resolve } from '$app/paths';

  interface Props {
    href?: string;
    children: Snippet;
  }

  let { href = '', children }: Props = $props();
</script>

{#if href}
  <a href={resolve(href, {})}>
    {@render children()}
  </a>
{:else}
  <button type="button">
    {@render children()}
  </button>
{/if}
