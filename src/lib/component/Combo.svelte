<script>
	import formatter from '$lib/utils/formatter';

	let { key, hotKeys = {}, value = $bindable(), ...props } = $props();
	const placeholder = $derived(formatter.camelToTitle(key));
	let inputEl = $state(null);

	function handleKeyDown(event) {
		if (document.activeElement === inputEl) {
			const key = event.key.toUpperCase();
			if (Object.keys(hotKeys).includes('ALL')) {
				hotKeys.ALL({ event, value: event.target.value, element: event.target, key });
			}
			if (Object.keys(hotKeys).includes(key)) {
				hotKeys[key]({ event, value: event.target.value, element: event.target, key });
			}
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />
<input
	bind:this={inputEl}
	bind:value
	name={key}
	{placeholder}
	class="w-full rounded border-2 border-black/50 px-2 py-1 outline-none not-last:mb-4 focus:border-blue-500 focus:bg-blue-50 focus:placeholder:text-blue-400"
	{...props}
/>
