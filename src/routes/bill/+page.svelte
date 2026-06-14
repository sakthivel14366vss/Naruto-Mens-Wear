<script>
	import Input from '$lib/component/Input.svelte';
	import Form from '$lib/component/Form.svelte';
	import Table from '$lib/component/Table.svelte';
	import { toastStore } from '$lib/utils/toast.svelte.js';
	import { hash } from '$lib/utils/useHash.js';
	import { invalidate } from '$app/navigation';
	import { useFormHandler } from '$lib/utils/formHandler.svelte.js';
	import triggerAction from '$lib/utils/triggerAction.js';
	import Combo from '$lib/component/Combo.svelte';

	const { form = null, data } = $props();
	let editableItem = $state(null);

	useFormHandler(
		() => form,
		() => {
			invalidate('stock');
			handleFormClose();
		}
	);

	function onEdit(item) {
		$hash = ['form'];
		editableItem = item;
	}
	function onCreate() {
		$hash = ['form'];
	}
	async function onDelete(item) {
		if (item) {
			await triggerAction('?/delete', { _id: item._id });
			invalidate('stock');
		}
	}

	function handleFormClose() {
		$hash = [''];
		editableItem = null;
	}

	function handleBarcodeKey({ value }) {
		console.log('scanned value', value);
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

<Table items={data.stocks} {onCreate} {onEdit} {onDelete} />

<Form title="Stock" isEdit={!!editableItem} close={handleFormClose}>
	{#if editableItem?._id}
		<input type="hidden" name="_id" value={editableItem._id} />
	{/if}
	<Combo
		key="barcode"
		autofocus
		value={editableItem?.barcode}
		hotKeys={{ ALL: handleBarcodeKey }}
	/>
</Form>
