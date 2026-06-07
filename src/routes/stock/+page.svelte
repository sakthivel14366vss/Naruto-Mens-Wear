<script>
	import Input from '$lib/component/Input.svelte';
	import Form from '$lib/component/Form.svelte';
	import Table from '$lib/component/Table.svelte';
</script>

<Table />

<Form title="Stock">
	<Input key="barcode" />
	<Input key="name" />
	<Input key="description" />
	<Input key="purchasePrice" />
	<Input key="salesPrice" />
	<Input key="count" />
</Form>
