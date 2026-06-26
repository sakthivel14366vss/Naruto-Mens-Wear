<script>
	import formatter from '$lib/utils/formatter';

	let {
		key,
		placeholder = '',
		hotKeys = {},
		color = 'blue',
		value = $bindable(),
		element = $bindable(),
		caseMode = 'none',
		...props
	} = $props();

	const colorStylesClass = {
		blue: 'focus:border-blue-600 focus:bg-blue-50 focus:placeholder:text-blue-500',
		green: 'focus:border-green-600 focus:bg-green-50 focus:placeholder:text-green-500',
		red: 'focus:border-red-600 focus:bg-red-50 focus:placeholder:text-red-500'
	};

	const derivedPlaceholder = $derived(placeholder ? placeholder : formatter.camelToTitle(key));
	const colorClass = $derived(colorStylesClass[color]);
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
	bind:this={element}
	oninput={handleInput}
	onkeydown={handleKeyDown}
	class="w-full rounded border-2 border-black/50 px-2 py-1 outline-none not-last:mb-4 {colorClass}"
	{...props}
/>
