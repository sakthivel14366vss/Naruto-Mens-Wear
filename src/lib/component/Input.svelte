<script>
	import formatter from '$lib/utils/formatter';

	let { key, keySuffix, value = $bindable(), ...props } = $props();
	const placeholder = $derived(formatter.camelToTitle(key) + (keySuffix ? ` ${keySuffix}` : ''));
</script>

<input
	name={key}
	{placeholder}
	bind:value
	class="w-full rounded border-2 border-black/50 px-2 py-1 outline-none not-last:mb-4 focus:border-blue-500 focus:bg-blue-50 focus:placeholder:text-blue-400"
	{...props}
/>
