<!-- src/lib/client/components/Teleport.svelte -->
<script lang="ts">
  import { type Snippet } from 'svelte';

  let {
    to = 'body',
    children,
  }: {
    to?: string | HTMLElement;
    children: Snippet;
  } = $props();

  function portal(node: HTMLElement, target: string | HTMLElement) {
    let targetEl = typeof target === 'string' ? document.querySelector(target) : target;

    if (!targetEl) {
      console.warn(`Teleport target "${target}" not found`);
      return;
    }

    // Move the node to the target
    targetEl.appendChild(node);

    return {
      update(newTarget: string | HTMLElement) {
        const newTargetEl =
          typeof newTarget === 'string' ? document.querySelector(newTarget) : newTarget;
        newTargetEl?.appendChild(node);
      },
      destroy() {
        // We remove the node when the component is destroyed
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
      },
    };
  }
</script>

<div use:portal={to} style="display: contents;">
  {@render children()}
</div>
