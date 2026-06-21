<script>
	import formatter from '$lib/utils/formatter';

	let { key, placeholder = '', value = $bindable(), caseMode = 'none', ...props } = $props();
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
</script>

<input
	name={key}
	placeholder={derivedPlaceholder}
	bind:value
	oninput={handleInput}
	class="w-full rounded border-2 border-black/50 px-2 py-1 outline-none not-last:mb-4 focus:border-blue-500 focus:bg-blue-50 focus:placeholder:text-blue-400"
	{...props}
/>
