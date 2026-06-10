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
	<div class="h-full overflow-auto">
		{#if items.length}
			<table class="w-full border-2 **:px-1">
				<thead>
					<tr
						class="bg-black text-white *:border-r *:first:border-l *:first:border-l-black *:last:border-r-black"
					>
						<th>S.No</th>
						{#each header as head}
							<th>{head.title}</th>
						{/each}
					</tr>
				</thead>
				<tbody class="**:border">
					{#each items as item, index}
						<tr
							class={overRowIndex == index ? 'bg-black/20' : ''}
							onmousemove={() => (overRowIndex = index)}
							data-index={index}
						>
							<td>{index + 1}</td>
							{#each header as head}
								<td>{item[head.key] || ''}</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		{:else}
			<div class="border-2 border-black p-5 text-center text-black/50">No Data</div>
		{/if}
	</div>
</div>
