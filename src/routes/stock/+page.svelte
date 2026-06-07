<script>
	import Input from '$lib/component/Input.svelte';
	import Form from '$lib/component/Form.svelte';
	import Table from '$lib/component/Table.svelte';
	import { toastStore } from '$lib/utils/toast.svelte.js';
	import { hash } from '$lib/utils/useHash.js';
	import { invalidate } from '$app/navigation';
	import { useFormHandler } from '$lib/utils/formHandler.svelte.js';

	const { form = null, data } = $props();

	useFormHandler(
		() => form,
		() => invalidate('stock')
	);
</script>

<Table items={data.stocks} />

<Form title="Stock">
	<Input key="barcode" />
	<Input key="name" />
	<Input key="description" />
	<Input key="purchasePrice" />
	<Input key="salesPrice" />
	<Input key="count" />
</Form>
