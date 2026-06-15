<script>
	import Table from '$lib/component/Table.svelte';
	import { toastStore } from '$lib/utils/toast.svelte.js';
	import { hash } from '$lib/utils/useHash.js';
	import { invalidate } from '$app/navigation';
	import { useFormHandler } from '$lib/utils/formHandler.svelte.js';
	import triggerAction from '$lib/utils/triggerAction.js';
	import BillForm from './BillForm.svelte';
	import { initialBillState } from './state.js'; // Path to your data structures

	const DEFAULT_DISCOUNT = 20;
	const { form = null, data } = $props();

	// Deep reactive object matching your core architecture layout
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

	function handleBarcodeKey({ key, value, event }) {
		if (key === 'ENTER') {
			event.preventDefault();
			handleBarcode(value);
		}
	}

	function handleBarcode(barcode) {
		if (!barcode) return;
		const targetBarcode = barcode.trim().toUpperCase();

		if (targetBarcode.startsWith('PR')) {
			const product = data.stocks.find((s) => s.barcode === targetBarcode);

			if (!product) {
				return toastStore.show('Product Not Found in Stock Engine', 'error');
			}

			// Target the Purchase Cart array
			const existingItem = editableItem.purchaseCart.itemList.find(
				(c) => c.barcode === targetBarcode
			);

			if (existingItem) {
				existingItem.qty += 1;
				existingItem.amount = existingItem.qty * existingItem.price;
				existingItem.discountedPrice =
					existingItem.price - existingItem.price * (existingItem.discountPercentage / 100);
				existingItem.discountedAmount = existingItem.qty * existingItem.discountedPrice;
			} else {
				const discountedPrice = product.salesPrice - product.salesPrice * (DEFAULT_DISCOUNT / 100);
				editableItem.purchaseCart.itemList.push({
					barcode: product.barcode,
					name: product.name,
					category: product.category || 'Mens Wear',
					qty: 1,
					price: product.salesPrice,
					discountPercentage: DEFAULT_DISCOUNT,
					discountedPrice: discountedPrice,
					amount: product.salesPrice,
					discountedAmount: discountedPrice
				});
			}

			editableItem.barcode = '';
		} else if (targetBarcode.startsWith('BILL')) {
			// Optional: Fetch matching bill data from server to populate return hooks or debt parameters
			toastStore.show(`Linked Reference Invoice: ${targetBarcode}`, 'info');
		} else {
			toastStore.show('Unidentified Barcode Variant Checked', 'error');
		}
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

<BillForm bind:editableItem {handleFormClose} {handleBarcodeKey} />
