<script lang="ts">
  import type { Snippet } from 'svelte';

  // Type Declration
  interface Props {
    href?: string;
    children: Snippet;
    color?: keyof typeof colors;
    onclick?: (e: Event) => void;
  }

  // Const Declration
  const emptyFunction = () => {};
  const commonClass =
    'cursor-pointer rounded px-3 py-1 outline-offset-2 hover:outline-2 focus:outline-2 inline-block';
  const colors = {
    blue: 'bg-blue-600 outline-blue-700 hover:bg-blue-700 focus:bg-blue-700',
    red: 'bg-red-600 outline-red-700 hover:bg-red-700 focus:bg-red-700',
    green: 'bg-green-600 outline-green-700 hover:bg-green-700 focus:bg-green-700',
    amber: 'bg-amber-600 outline-amber-700 hover:bg-amber-700 focus:bg-amber-700',
    gray: 'bg-gray-500 outline-gray-600 hover:bg-gray-600 focus:bg-gray-600',
  };

  // Props Declation
  let { href = '', children, onclick = emptyFunction, color = 'blue' }: Props = $props();

  //Derived Declation
  const buttonColor = $derived(colors[color]);
</script>

{#if href}
  <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
  <a {href} class="{buttonColor} {commonClass}">
    {@render children()}
  </a>
{:else}
  <button type="button" {onclick} class="{buttonColor} {commonClass}">
    {@render children()}
  </button>
{/if}
