<script>
	import Table from '$lib/component/Table.svelte';
	import { toastStore } from '$lib/utils/toast.svelte.js';
	import { hash } from '$lib/utils/useHash.js';
	import { invalidate } from '$app/navigation';
	import { useFormHandler } from '$lib/utils/formHandler.svelte.js';
	import triggerAction from '$lib/utils/triggerAction.js';
	import BillForm from './BillForm.svelte';
	import { initialBillState } from './state.js';

	const { form = null, data } = $props();

	let editableItem = $state(getInitialItem());

	useFormHandler(
		() => form,
		() => {
			invalidate('stock');
			handleFormClose();
		}
	);

	function getInitialItem() {
		return structuredClone(initialBillState);
	}

	function onEdit(item) {
		editableItem = structuredClone(item);
		$hash = ['form'];
	}

	function onCreate() {
		editableItem = getInitialItem();
		$hash = ['form'];
	}

	async function onDelete(item) {
		if (item && (await triggerAction('?/delete', { _id: item._id }))) {
			invalidate('stock');
		}
	}

	function handleFormClose() {
		$hash = [''];
		editableItem = getInitialItem();
	}

	function handleKeyDown(event) {
		if (event.key?.toUpperCase() === 'ESCAPE') {
			handleFormClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<Table items={data.bills} {onCreate} {onEdit} {onDelete} title="Bills">
	{#snippet titleStart()}
		23-06-2025
	{/snippet}
	{#snippet titleEnd()}
		<button class="mr-2 cursor-pointer rounded-full hover:bg-white hover:text-red-800">🢀</button>
		<button class="mr-2 cursor-pointer rounded-full hover:bg-white hover:text-red-800">🢂</button>
	{/snippet}
</Table>

<BillForm bind:editableItem {handleFormClose} stocks={data.stocks} />
