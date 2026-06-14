<script>
	import formatter from '$lib/utils/formatter.js';

	const { items = [], onEdit = () => {}, onCreate = () => {}, onDelete = () => {} } = $props();
	const HIDDEN_KEYS = new Set(['_id', 'id', 'createdAt', 'updatedAt', '__v']);
	let overRowIndex = $state(0);

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
				event.preventDefault();
				onEdit(items[overRowIndex]);
				break;
			case 'DELETE':
				event.preventDefault();
				onDelete(items[overRowIndex]);
				break;
			case ' ':
				event.preventDefault();
				onCreate();
				break;
		}
	}

	$effect(() => {
		const activeRowEl = document.querySelector(`[data-index="${overRowIndex}"]`);
		if (activeRowEl) activeRowEl.scrollIntoView({ behavior: 'auto', block: 'nearest' });
	});
</script>

<svelte:window onkeydown={handleKeyDown} />

<div class="h-dvh p-5">
	<div class="h-full overflow-auto border-2 border-black">
		{#if items.length}
			<table class="w-full border-separate border-spacing-0 **:px-1">
				<thead class="sticky top-0 z-10 text-white">
					<tr class="bg-red-800 *:border-b *:border-black *:border-b-white">
						<th colspan={header.length + 1}>Stock</th>
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
								: ''} scroll-mt-16 *:border-r *:border-b *:border-black last:*:border-b-0"
							onmousemove={() => (overRowIndex = index)}
							data-index={index}
						>
							<td>{index + 1}</td>
							{#each header as head}
								<td class="last:border-r-0">{item[head.key] || ''}</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		{:else}
			<div class="border border-black p-5 text-center text-black/50">No Data</div>
		{/if}
	</div>
</div>
