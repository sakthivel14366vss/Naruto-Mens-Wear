<script>
	let { children, color = 'blue', type = 'button', ...props } = $props();

	const colorClassList = $state({
		blue: 'bg-blue-500',
		red: 'bg-red-500',
		green: 'bg-green-500',
		amber: 'bg-amber-500',
		gray: 'bg-gray-500'
	});

	const colorClass = $derived(colorClassList[color]);
</script>

<button class="rounded px-2 py-1 text-white {colorClass}" {type} {...props}>
	{@render children()}
</button>
