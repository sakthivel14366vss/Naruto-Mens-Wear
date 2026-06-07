<script>
	import formatter from '$lib/utils/formatter.js';

	const { items = [] } = $props();
	const HIDDEN_KEYS = new Set(['_id', 'id', 'createdAt', 'updatedAt', '__v']);

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
</script>

<div class="p-5">
	<table class="w-full **:px-1">
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
		<tbody class="**:border *:hover:bg-black/20">
			{#each items as item, index}
				<tr>
					<td>{index + 1}</td>
					{#each header as head}
						<td>{item[head.key] || ''}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
