<script>
	import Table from '$lib/component/Table.svelte';
	import { toastStore } from '$lib/utils/toast.svelte.js';
	import { hash } from '$lib/utils/useHash.js';
	import { invalidate } from '$app/navigation';
	import { useFormHandler } from '$lib/utils/formHandler.svelte.js';
	import triggerAction from '$lib/utils/triggerAction.js';
	import BillForm from './BillForm.svelte';
	import { initialBillState } from './state.js';
	import { getFormattedDate, getFormattedTime } from '$lib/utils/dateTime';
	import formatter from '$lib/utils/formatter';

	const { form = null, data } = $props();

	const formattedBill = $derived(
		data.bills.map((b) => ({
			_id: b._id,
			date: getFormattedDate(b.createdAt),
			time: getFormattedTime(b.createdAt),
			billCount: b.metadata.dailySequenceCount,
			billNo: b.metadata.billNo,
			customerName: b.metadata.customer.name,
			netPayable: formatter.numberWithCommas(b.ledger.netPayable),
			exchangeBill: b?.returnCart?.lineItems?.length ? 'Yes' : 'No',
			exchangeClaimed: b.isReturnClaimed ? 'Yes' : 'No'
		}))
	);

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
		const foundedItem = data.bills.find((b) => b._id === item._id);
		editableItem = structuredClone(foundedItem);
		$hash = ['form'];
	}

	function onCreate() {
		editableItem = getInitialItem();
		$hash = ['form'];
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

	async function handleBillBarCode(barcode) {
		const result = await triggerAction('?/findBill', { barcode });
		if (result.type == 'success' && result.data) {
			editableItem = result.data;
		} else {
			toastStore.show('Faild to load Bill', 'error');
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<Table items={formattedBill} {onCreate} {onEdit} title="Bills" hiddenKeys={['_id']}>
	{#snippet titleStart()}
		23-06-2025
	{/snippet}
	{#snippet titleEnd()}
		<button class="mr-2 cursor-pointer rounded-full hover:bg-white hover:text-red-800">🢀</button>
		<button class="mr-2 cursor-pointer rounded-full hover:bg-white hover:text-red-800">🢂</button>
	{/snippet}
</Table>

{#if $hash.segments.at(-1) === 'form'}
	<BillForm
		bind:item={editableItem}
		{handleFormClose}
		{handleBillBarCode}
		stocks={data.stocks}
		outstandings={data.outstandings}
	/>
{/if}
