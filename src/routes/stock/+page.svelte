<script>
	import Input from '$lib/component/Input.svelte';
	import Form from '$lib/component/Form.svelte';
	import Table from '$lib/component/Table.svelte';
	import { toastStore } from '$lib/utils/toast.svelte.js';
	import { hash } from '$lib/utils/useHash.js';
	import { invalidate } from '$app/navigation';
	import { useFormHandler } from '$lib/utils/formHandler.svelte.js';
	import triggerAction from '$lib/utils/triggerAction.js';

	const { form = null, data } = $props();

	useFormHandler(
		() => form,
		() => invalidate('stock')
	);

	function onEdit(item) {
		console.log('edit', item);
	}
	function onCreate() {
		$hash = ['create'];
	}
	async function onDelete(item) {
		if (item) {
			await triggerAction('?/delete', { _id: item._id });
			invalidate('stock');
		}
	}

	function handleKeyDown(event) {
		const key = event.key?.toUpperCase();
		switch (key) {
			case 'ESCAPE':
				$hash = [''];
				break;
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<Table items={data.stocks} {onCreate} {onEdit} {onDelete} />

<Form title="Stock">
	<Input key="barcode" autofocus />
	<Input key="name" />
	<Input key="description" />
	<Input key="purchasePrice" />
	<Input key="salesPrice" />
	<Input key="count" />
</Form>
