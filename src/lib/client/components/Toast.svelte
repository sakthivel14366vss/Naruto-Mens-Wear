<!-- src/lib/client/components/Toast.svelte -->
<script lang="ts">
  import Teleport from './Teleport.svelte';
  import { toastStore } from '$lib/common/store/toast';

  let { position = 'top-right' } = $props<{
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  }>();

  const positionClass = $derived.by(() => {
    switch (position) {
      case 'top-left':
        return 'top-5 left-5';
      case 'bottom-right':
        return 'bottom-5 right-5';
      case 'bottom-left':
        return 'bottom-5 left-5';
      default:
        return 'top-5 right-5';
    }
  });
</script>

<Teleport to="body">
  <div class="fixed z-50 flex flex-col gap-2 {positionClass}">
    {#each $toastStore as t (t.id)}
      {@const color =
        t.type == 'red'
          ? 'bg-red-300'
          : t.type == 'green'
            ? 'bg-green-300'
            : t.type == 'blue'
              ? 'bg-blue-300'
              : 'bg-white'}
      <div
        class="animate-fade-in shadow-lg} flex max-w-xs min-w-62.5 items-center justify-between rounded bg-black px-4 py-2 {color} font-semibold"
      >
        <span>{t.message}</span>

        <button
          type="button"
          class="ml-3 cursor-pointer text-sm opacity-70 hover:opacity-50"
          onclick={() => toastStore.remove(t.id)}
        >
          ✕
        </button>
      </div>
    {/each}
  </div>
</Teleport>

<style>
  .animate-fade-in {
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
