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
		onBlur = dummyFunction,
		...props
	} = $props();

	// -------------------------------------
	// Reactive State
	// -------------------------------------
	let showOptions = $state(false); // Default to false until focused
	let selectedOptionIndex = $state(0);

	// Derived filtering logic
	const derivedPlaceholder = $derived(placeholder ? placeholder : formatter.camelToTitle(key));

	// Shows all options if empty, otherwise filters based on input
	let filtered = $derived(
		!value
			? options
			: fullSearch
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
		} else if (e.key === 'Enter' && showOptions) {
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
		const input = e.target.value; // Fixed: altered 'event' to 'e'
		let updatedValue = input;

		switch (caseMode) {
			case 'capitalize': {
				updatedValue = input
					.split(' ')
					.map((word) => (word ? word[0].toUpperCase() + word.slice(1) : ''))
					.join(' ');
				break;
			}
		}

		showOptions = true;
		value = updatedValue;
		selectedOptionIndex = 0;
		onValueChange(updatedValue);
	}

	function handleOptionClick(index) {
		value = filtered[index];
		showOptions = false;
		onValueSelected(value);
	}

	function handleOnBlur() {
		if (options.length) {
			showOptions = false;
			// Check against full list or filtered list depending on your preference
			const isValueExist = options.includes(value);

			// Strict enforcement: if option doesn't exist and we don't 'accept' custom values, clear it
			if (!isValueExist && newValue !== 'accept') {
				value = '';
			}
		}
		onBlur(value);
		onValueSelected(value);
	}

	function handleFocus() {
		showOptions = true;
		selectedOptionIndex = 0; // Reset index placement on opening
	}
</script>

<div class="relative not-last:mb-4">
	<input
		class="w-full rounded border-2 border-black/50 px-2 py-1 outline-none focus:border-blue-500 focus:bg-blue-50 focus:placeholder:text-blue-400
        {options.length && showOptions && filtered.length ? 'rounded-b-none' : ''}"
		type="text"
		placeholder={derivedPlaceholder}
		bind:value
		oninput={handleInput}
		onkeydown={handleOptionNavigation}
		onfocus={handleFocus}
		onblur={handleOnBlur}
		{...props}
	/>

	{#if options.length && showOptions && filtered.length}
		<ul
			class="absolute top-full z-10 w-full divide-y divide-black/50 rounded border-2 border-blue-500 bg-blue-50
            {options.length && showOptions ? 'rounded-t-none border-t-0' : ''}"
		>
			{#each filtered as option, index}
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<li
					class="cursor-pointer px-2 py-0.5 text-left
                    {selectedOptionIndex === index ? 'bg-blue-300' : ''}"
					onmousedown={() => handleOptionClick(index)}
				>
					{option}
				</li>
			{/each}
		</ul>
	{/if}
</div>
