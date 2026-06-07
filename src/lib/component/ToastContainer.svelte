<script>
	import { toastStore } from '$lib/utils/toast.svelte';

	// Map toast types cleanly to Tailwind configurations
	const theme = {
		success: 'bg-emerald-600 border-emerald-500 text-white',
		error: 'bg-rose-600 border-rose-500 text-white',
		info: 'bg-blue-600 border-blue-500 text-white'
	};
</script>

<div
	class="pointer-events-none fixed right-5 bottom-5 z-9999 flex w-full max-w-sm flex-col gap-3 sm:w-80"
>
	{#each toastStore.all as toast (toast.id)}
		<div
			class="animate-in slide-in-from-right pointer-events-auto flex items-center justify-between gap-4 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm duration-200 {theme[
				toast.type
			] || theme.info}"
		>
			<span class="text-sm font-medium tracking-wide">
				{toast.message}
			</span>

			<button
				onclick={() => toastStore.dismiss(toast.id)}
				class="text-xl leading-none font-bold opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
				aria-label="Close notification"
			>
				&times;
			</button>
		</div>
	{/each}
</div>
