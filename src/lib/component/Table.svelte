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
				overRowIndex = overRowIndex - 1 >= 0 ? overRowIndex - 1 : overRowIndex;
				break;
			case 'ARROWDOWN':
				overRowIndex = overRowIndex + 1 <= items.length - 1 ? overRowIndex + 1 : overRowIndex;
				break;
			case 'HOME':
				overRowIndex = 0;
				break;
			case 'END':
				overRowIndex = items.length - 1;
				break;
			case 'ENTER':
				onEdit(items[overRowIndex]);
				break;
			case 'DELETE':
				onDelete(items[overRowIndex]);
				break;
			case ' ':
				onCreate();
				break;
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<div class="p-5">
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
		<div class="border-2 p-5 text-center text-black/50">No Data</div>
	{/if}
</div>
