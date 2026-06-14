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

	let editableItem = $state({ cart: [], barcode: '' });

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
		editableItem = { cart: [], barcode: '' };
	}

	function handleBarcodeKey({ key, value, event }) {
		switch (key) {
			case 'ENTER':
				event.preventDefault();
				handleBarcode(value);
				break;
		}
	}

	function handleBarcode(barcode) {
		if (barcode.startsWith('PR')) {
			const product = data.stocks.find((s) => s.barcode === barcode);
			if (!product) {
				toastStore.show('Product Not Found', 'error');
				return;
			}
			const item = {
				barcode: product.barcode,
				name: product.name,
				price: product.salesPrice,
				discount: 20,
				amount: product.salesPrice - product.salesPrice * (20 / 100),
				qty: 1,
				finalAmount: 1 * (product.salesPrice - product.salesPrice * (20 / 100))
			};
			const alreadyExist = editableItem.cart.find((c) => c.barcode === barcode);
			if (alreadyExist) {
				const existItem = {
					...alreadyExist,
					qty: alreadyExist.qty + 1,
					finalAmount: (alreadyExist.qty + 1) * alreadyExist.amount
				};
				const existIndex = editableItem.cart.findIndex((c) => c.barcode === barcode);
				editableItem.cart[existIndex] = existItem;
			} else {
				editableItem.cart.push(item);
			}
			editableItem.grandTotal = editableItem.cart.reduce((a, c) => c.finalAmount + a, 0);
			editableItem.barcode = '';
		} else if (barcode.startsWith('BILL')) {
		} else {
			toastStore.show('Unidentified Barcode', 'error');
		}
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

<Table items={data.bills} {onCreate} {onEdit} {onDelete} title="Bills">
	{#snippet titleStart()}
		23-06-2025
	{/snippet}
	{#snippet titleEnd()}
		<button class="mr-2 cursor-pointer rounded-full hover:bg-white hover:text-red-800">🢀</button>
		<button class="mr-2 cursor-pointer rounded-full hover:bg-white hover:text-red-800">🢂</button>
	{/snippet}
</Table>

<Form title="Bills" isEdit={!!editableItem?._id} close={handleFormClose}>
	{#if editableItem?._id}
		<input type="hidden" name="_id" value={editableItem._id} />
	{/if}
	<Combo
		key="barcode"
		autofocus
		bind:value={editableItem.barcode}
		hotKeys={{ ALL: handleBarcodeKey }}
	/>
	{#if editableItem.cart.length}
		<table class="mb-5 w-full">
			<thead>
				<tr class="bg-black/10 *:border">
					<th>S.No</th>
					<th>Name</th>
					<th>Qty</th>
					<th>Price</th>
					<th>Dis</th>
					<th>Amount</th>
					<th>Final</th>
				</tr>
			</thead>
			<tbody>
				{#each editableItem.cart as item, index (item.barcode)}
					<tr class="*:border *:px-1">
						<td>{index + 1}</td>
						<td>{item.name}</td>
						<td>{item.qty}</td>
						<td>{item.price}</td>
						<td>{item.discount}%</td>
						<td>{item.amount}</td>
						<td>{item.finalAmount}</td>
					</tr>
				{/each}
				<tr class="*:border *:px-1">
					<td colspan="6" class="text-right">Grand Total</td>
					<td>{editableItem.grandTotal}</td>
				</tr>
			</tbody>
		</table>
	{/if}
</Form>
