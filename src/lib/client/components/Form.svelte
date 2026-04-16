<!-- src\lib\client\components\Form.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
    className?: string;
  }

  let { children, className = '' }: Props = $props();
</script>

<form class={className}>
  {@render children()}
</form>
