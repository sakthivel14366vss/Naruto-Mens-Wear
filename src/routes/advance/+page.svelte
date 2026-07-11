<script>
	import Input from '$lib/component/Input.svelte';
	import Form from '$lib/component/Form.svelte';
	import Table from '$lib/component/Table.svelte';
	import { toastStore } from '$lib/utils/toast.svelte.js';
	import { hash } from '$lib/utils/useHash.js';
	import { invalidate } from '$app/navigation';
	import { useFormHandler } from '$lib/utils/formHandler.svelte.js';
	import triggerAction from '$lib/utils/triggerAction.js';
	import { getFormattedDate } from '$lib/utils/dateTime.js';
	import { printAdvanceReceipt } from './printFormat.js';

	const { form = null, data } = $props();
	let editableItem = $state(null);

	const formattedAdvance = $derived(
		data.advances.map((a) => ({
			_id: a._id,
			Date: getFormattedDate(a.createdAt),
			Barcode: a.barcode,
			Description: a.description,
			Phone: a.phone,
			Amount: a.amount
		}))
	);

	useFormHandler(
		() => form,
		(result) => {
			invalidate('advance');
			handleFormClose();
			printAdvanceReceipt(result.data);
		}
	);

	function onEdit(item) {
		$hash = ['form'];
		editableItem = data.advances.find((a) => a._id == item._id);
	}
	function onCreate() {
		$hash = ['form'];
	}
	async function onDelete(item) {
		if (item) {
			await triggerAction('?/delete', { _id: item._id });
			invalidate('advance');
		}
	}

	function handleFormClose() {
		$hash = [''];
		editableItem = null;
	}

	function handleKeyDown(event) {
		const key = event.key?.toUpperCase();
		switch (key) {
			case 'ESCAPE':
				handleFormClose();
				break;
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<Table items={formattedAdvance} {onCreate} {onEdit} {onDelete} title="Advance" />

<Form title="Advance" isEdit={!!editableItem} close={handleFormClose}>
	{#if editableItem?._id}
		<input type="hidden" name="_id" value={editableItem._id} />
	{/if}
	<Input key="description" caseMode="capitalize" value={editableItem?.description} />
	<Input key="amount" value={editableItem?.amount} />
	<Input key="phone" value={editableItem?.phone} />
</Form>
