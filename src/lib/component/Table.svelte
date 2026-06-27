<!-- src\lib\component\Table.svelte -->
<script>
	import formatter from '$lib/utils/formatter.js';
	import Button from './Button.svelte';
	const emptyFunction = () => {};

	const {
		items = [],
		title = 'Title',
		titleStart = emptyFunction,
		titleEnd = emptyFunction,
		onEdit = emptyFunction,
		onCreate = emptyFunction,
		onDelete = emptyFunction,
		hiddenKeys = []
	} = $props();
	const HIDDEN_KEYS = $derived(
		new Set(['_id', 'id', 'createdAt', 'savedAt', 'updatedAt', '__v', ...hiddenKeys])
	);
	let overRowIndex = $state(0);

	const helperOption = [
		{ serial: 1, description: 'To create new Record', key: 'Space' },
		{ serial: 2, description: 'To edit existing Record', key: 'Enter' },
		{ serial: 3, description: 'Go to Top', key: 'Home' },
		{ serial: 4, description: 'Go to Bottom', key: 'End' },
		{ serial: 5, description: 'To move up and down', key: 'Arrow Keys' },
		{ serial: 6, description: 'To delete a record', key: 'Delete' }
	];

	const header = $derived(
		items.length
			? Object.keys(items[0])
					.filter((key) => !HIDDEN_KEYS.has(key))
					.map((key) => ({
						key,
						title: formatter.camelToTitle(key)
					}))
			: []
	);

	function handleKeyDown(event) {
		const key = event.key?.toUpperCase();
		if (['INPUT', 'BUTTON'].includes(event.target.tagName)) return;
		switch (key) {
			case 'ARROWUP':
				event.preventDefault();
				overRowIndex = overRowIndex - 1 >= 0 ? overRowIndex - 1 : overRowIndex;
				break;
			case 'ARROWDOWN':
				event.preventDefault();
				overRowIndex = overRowIndex + 1 <= items.length - 1 ? overRowIndex + 1 : overRowIndex;
				break;
			case 'HOME':
				event.preventDefault();
				overRowIndex = 0;
				break;
			case 'END':
				event.preventDefault();
				overRowIndex = items.length - 1;
				break;
			case 'ENTER':
				if (emptyFunction != onEdit) {
					event.preventDefault();
					onEdit(items[overRowIndex]);
				}
				break;
			case 'DELETE':
				if (emptyFunction != onDelete) {
					event.preventDefault();
					let confirmation = confirm('Are you sure to delete?');
					if (confirmation) onDelete(items[overRowIndex]);
				}
				break;
			case ' ':
				if (emptyFunction != onCreate) {
					event.preventDefault();
					onCreate();
				}
				break;
		}
	}

	$effect(() => {
		const activeRowEl = document.querySelector(`[data-index="${overRowIndex}"]`);
		if (activeRowEl) activeRowEl.scrollIntoView({ behavior: 'auto', block: 'nearest' });
	});
</script>

<svelte:window onkeydown={handleKeyDown} />

<div class="h-dvh p-5 pr-0">
	<div class="h-full w-fit overflow-auto border-2 border-black">
		{#if items.length}
			<table class="border-separate border-spacing-0 **:px-1">
				<thead class="sticky top-0 z-10 text-white">
					<tr class="bg-red-800 *:border-b *:border-black *:border-b-white">
						<th colspan={header.length + 1}>
							<div class="flex justify-between">
								<div class="flex flex-1 justify-start">{@render titleStart()}</div>
								<div class="flex flex-1 justify-center text-nowrap">{title}</div>
								<div class="flex flex-1 justify-end">{@render titleEnd()}</div>
							</div>
						</th>
					</tr>
					<tr class="border-white bg-black *:border-r *:border-b-0">
						<th>S.No</th>
						{#each header as head}
							<th class="last:border-r-black">{head.title}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each items as item, index}
						<tr
							class="{overRowIndex == index
								? 'bg-black/20'
								: ''} scroll-mt-16 *:border-r *:border-b *:border-black"
							onmousemove={() => (overRowIndex = index)}
							data-index={index}
						>
							<td class="text-center">{index + 1}</td>
							{#each header as head}
								<td class="last:border-r-0">{item[head.key] || ''}</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		{:else}
			<div class="px-5 pt-10 text-center text-black/50">
				<div class="mb-5 text-2xl">No Data Found</div>
				<div class="text-wrap">
					To manage records (create, edit, delete) use the Shortcut keys in the below table
				</div>
				<table class="mx-auto mt-5 w-fit">
					<tbody>
						<tr class="bg-gray-200 *:border *:px-1">
							<th>S.No</th>
							<th>Description</th>
							<th>Shortcut Key</th>
						</tr>
						{#each helperOption as option}
							<tr class="*:border *:px-1">
								<td>{option.serial}</td>
								<td class="text-left">{option.description}</td>
								<td>{option.key}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>
