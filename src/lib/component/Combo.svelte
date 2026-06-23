<script>
	const dummyFunction = () => {};

	// -------------------------------------
	// Core Selection & Data Props
	// -------------------------------------
	let {
		value = $bindable('s'),
		options = ['Seeni', 'Vasan', 'Adsk', 'Sakthi'],
		fullSearch = false,
		newValue = 'ignore', // ignore | accept | create
		placeholder = '',
		key = 'Key',
		caseMode = 'none',
		createOption = dummyFunction,
		onValueChange = dummyFunction,
		onValueSelected = dummyFunction,
		onBlur = dummyFunction
	} = $props();

	// -------------------------------------
	// Reactive State
	// -------------------------------------
	let showOptions = $state(true);
	let selectedOptionIndex = $state(0);

	// Derived filtering logic
	const derivedPlaceholder = $derived(placeholder ? placeholder : formatter.camelToTitle(key));
	let filtered = $derived(
		fullSearch
			? options.filter((o) => o?.toLowerCase()?.includes(value?.toLowerCase()))
			: options.filter((o) => o?.toLowerCase()?.startsWith(value?.toLowerCase()))
	);

	// -------------------------------------
	// Keyboard / Navigation Logic
	// -------------------------------------
	function handleOptionNavigation(e) {
		if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)) {
			e.preventDefault();
		}

		if (e.key === 'ArrowDown' && showOptions) {
			if (selectedOptionIndex < filtered.length - 1) {
				selectedOptionIndex++;
			} else {
				selectedOptionIndex = 0; // Loop back to top
			}
		} else if (e.key === 'ArrowUp' && showOptions) {
			if (selectedOptionIndex > 0) {
				selectedOptionIndex--;
			} else {
				selectedOptionIndex = filtered.length - 1; // Loop to bottom
			}
		} else if (e.key === 'Enter') {
			if (newValue === 'create' && filtered.length === 0) {
				createOption(value);
			} else if (filtered.length > 0) {
				value = filtered[selectedOptionIndex];
				showOptions = false;
			}
			onValueSelected(value);
		} else if (e.key === 'Escape') {
			showOptions = false;
		} else if (e.key === 'Tab') {
			if (filtered.length > 0 && value && showOptions) {
				value = filtered[selectedOptionIndex];
			}
			showOptions = false;
		}
	}

	// -------------------------------------
	// Interaction Event Handlers
	// -------------------------------------
	function handleInput(e) {
		const input = event.target.value;
		let newValue = input;
		switch (caseMode) {
			case 'capitalize': {
				newValue = input
					.split(' ')
					.map((word) => (word ? word[0].toUpperCase() + word.slice(1) : ''))
					.join(' ');
				break;
			}
		}

		showOptions = true;
		value = newValue;
		selectedOptionIndex = 0;
		onValueChange(newValue);
	}

	function handleOptionClick(index) {
		value = filtered[index];
		showOptions = false;
		onValueSelected(value);
	}

	function handleOnBlur() {
		if (options.length) {
			showOptions = false;
			const isValueExist = Array.isArray(filtered) ? filtered.includes(value) : false;

			// Strict enforcement: if option doesn't exist and we don't 'accept' custom values, clear it
			if (!isValueExist && newValue !== 'accept') {
				value = '';
			}
		}
		onBlur(value);
		onValueSelected(value);
	}
</script>

<div class="relative not-last:mb-4">
	<input
		class="w-full rounded border-2 border-black/50 px-2 py-1 outline-none focus:border-blue-500 focus:bg-blue-50 focus:placeholder:text-blue-400
		{options.length && showOptions && filtered.length && value ? 'rounded-b-none' : ''}"
		type="text"
		placeholder={derivedPlaceholder}
		bind:value
		oninput={handleInput}
		onkeydown={handleOptionNavigation}
		onfocus={() => (showOptions = true)}
		onblur={handleOnBlur}
	/>

	{#if options.length && showOptions}
		{#if filtered.length && value}
			<ul
				class="absolute top-full w-full divide-y divide-black/50 rounded border-2 border-blue-500 bg-blue-50
				{options.length && showOptions ? 'rounded-t-none border-t-0' : ''}"
			>
				{#each filtered as option, index}
					<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
					<li
						class="cursor-pointer px-2 py-0.5 text-left
						{selectedOptionIndex === index && 'bg-blue-300'}"
						onmousedown={() => handleOptionClick(index)}
					>
						{option}
					</li>
				{/each}
			</ul>
		{/if}
	{/if}
</div>
