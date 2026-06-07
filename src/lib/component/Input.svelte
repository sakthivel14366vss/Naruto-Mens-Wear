<script>
	let { key, ...props } = $props();
	const placeholder = $derived(key[0].toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'));
</script>

<input
	name={key}
	{placeholder}
	class="w-full rounded border-2 border-black/50 px-2 py-1 outline-none not-last:mb-4 focus:border-blue-500 focus:bg-blue-50 focus:placeholder:text-blue-400"
	{...props}
/>
