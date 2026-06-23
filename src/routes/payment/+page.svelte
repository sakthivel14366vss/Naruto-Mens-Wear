<script>
	import Input from '$lib/component/Input.svelte';
	import Table from '$lib/component/Table.svelte';

	const { data } = $props();
</script>

<div class="flex *:flex-1">
	<div>
		<Table
			items={data.payments.filter((p) => p.paymentMode == 'Cash')}
			title="Cash Payment"
			hiddenKeys={['referenceBillId', 'savedAt', 'flowDirection']}
		/>
	</div>
	<div>
		<Table
			items={data.payments.filter((p) => p.paymentMode == 'Gpay')}
			title="Gpay Payment"
			hiddenKeys={['referenceBillId', 'savedAt', 'flowDirection']}
		/>
	</div>
</div>
