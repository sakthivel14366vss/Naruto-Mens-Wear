<script>
	import formatter from '$lib/utils/formatter';

	let {
		key,
		placeholder = '',
		hotKeys = {},
		value = $bindable(),
		caseMode = 'none',
		...props
	} = $props();
	const derivedPlaceholder = $derived(placeholder ? placeholder : formatter.camelToTitle(key));
	function handleInput(event) {
		const input = event.target.value;
		switch (caseMode) {
			case 'capitalize': {
				value = input
					.split(' ')
					.map((word) => (word ? word[0].toUpperCase() + word.slice(1) : ''))
					.join(' ');
				break;
			}
		}
	}

	function handleKeyDown(event) {
		const key = event.key.toUpperCase();
		if (key === 'ENTER') event.preventDefault();
		if (Object.keys(hotKeys).includes(key)) {
			event.preventDefault();
			hotKeys[key]({ event, value: event.target.value, element: event.target, key });
		}
	}
</script>

<input
	name={key}
	placeholder={derivedPlaceholder}
	bind:value
	oninput={handleInput}
	onkeydown={handleKeyDown}
	class="w-full rounded border-2 border-black/50 px-2 py-1 outline-none not-last:mb-4 focus:border-blue-500 focus:bg-blue-50 focus:placeholder:text-blue-400"
	{...props}
/>
