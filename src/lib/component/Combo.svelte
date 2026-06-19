<script>
	import formatter from '$lib/utils/formatter';

	let { key = 'key', placeholder = '', hotKeys = {}, value = $bindable(), ...props } = $props();
	const derivedPlaceholder = $derived(placeholder ? placeholder : formatter.camelToTitle(key));

	function handleKeyDown(event) {
		const key = event.key.toUpperCase();
		if (Object.keys(hotKeys).includes(key)) {
			event.preventDefault();
			hotKeys[key]({ event, value: event.target.value, element: event.target, key });
		}
	}
</script>

<input
	bind:value
	name={key}
	placeholder={derivedPlaceholder}
	onkeydown={handleKeyDown}
	class="w-full rounded border-2 border-black/50 px-2 py-1 outline-none not-last:mb-4 focus:border-blue-500 focus:bg-blue-50 focus:placeholder:text-blue-400"
	{...props}
/>
