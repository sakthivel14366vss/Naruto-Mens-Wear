<script>
	import Combo from '$lib/component/Combo.svelte';
	import Form from '$lib/component/Form.svelte';
	import Input from '$lib/component/Input.svelte';
	import formatter from '$lib/utils/formatter';
	import { toastStore } from '$lib/utils/toast.svelte';
	import { hash } from '$lib/utils/useHash.js';

	let { item = $bindable(), handleFormClose, stocks } = $props();
	let purchaseCartFocused = $state(true);

	function handleBarcode({ value }) {
		if (value.startsWith('PR')) {
			const scannedItem = stocks.find((s) => s.barcode === value);
			if (!scannedItem) {
				toastStore.show('Item not found in stocks', 'error');
				return;
			} else if (!scannedItem.count) {
				toastStore.show('Out of Stock', 'error');
				return;
			}

			// 1. Determine which cart we are targeting
			const cartKey = purchaseCartFocused ? 'purchaseCart' : 'returnCart';

			// 2. Safely get a snapshot of the current line items array
			// (If lineItems doesn't exist yet, default to an empty array)
			const currentLineItems = $state.snapshot(item[cartKey]?.lineItems) || [];

			// 3. Create a shallow copy of the array so we don't mutate state directly
			const tempCart = [...currentLineItems];

			// 4. Find if the item already exists in this cart copy
			const existingItem = tempCart.find((i) => i.barcode === value);

			if (existingItem) {
				// Update quantities and totals on the existing item reference
				existingItem.quantity += 1;
				existingItem.grossAmount = existingItem.quantity * existingItem.unitPrice;
				existingItem.netAmount = existingItem.quantity * existingItem.discountedUnitPrice;
			} else {
				// Push a new plain object if it doesn't exist
				tempCart.push({
					barcode: scannedItem.barcode,
					name: scannedItem.name,
					quantity: 1,
					unitPrice: scannedItem.salesPrice,
					discountPercentage: scannedItem.discount || 0,
					discountedUnitPrice: scannedItem.salesPrice * (1 - (scannedItem.discount || 0) / 100),
					grossAmount: scannedItem.salesPrice,
					netAmount: scannedItem.salesPrice * (1 - (scannedItem.discount || 0) / 100)
				});
			}

			// 5. FIX: Update the .lineItems property, DO NOT overwrite the cart object
			item[cartKey].lineItems = tempCart;
			item[cartKey].subTotal = tempCart.reduce((sum, i) => sum + i.grossAmount, 0);
			item[cartKey].finalAmount = tempCart.reduce((sum, i) => sum + i.netAmount, 0);
			item[cartKey].totalDiscount = item[cartKey].subTotal - item[cartKey].finalAmount;

			// Clear input field
			item.barcode = '';
		} else if (value.startsWith('BL')) {
			// Handle BL barcodes here
		} else if (/\d+[+=]\d+/.test(value)) {
			// Shortcut for quantity update, e.g., "2+3" means add 3 to item at serial 2, here + and = are interchangeable
			const [serial, qty] = value.split(/[+=]/).map(Number);
			const cartKey = purchaseCartFocused ? 'purchaseCart' : 'returnCart';
			const currentLineItems = $state.snapshot(item[cartKey]?.lineItems) || [];
			const tempCart = [...currentLineItems];

			if (!tempCart[serial - 1]) {
				toastStore.show(`No item at serial ${serial} to update`, 'error');
				return;
			}

			tempCart[serial - 1].quantity = qty;
			tempCart[serial - 1].grossAmount = qty * tempCart[serial - 1].unitPrice;
			tempCart[serial - 1].netAmount = qty * tempCart[serial - 1].discountedUnitPrice;

			item[cartKey].lineItems = tempCart;
			item[cartKey].subTotal = tempCart.reduce((sum, i) => sum + i.grossAmount, 0);
			item[cartKey].finalAmount = tempCart.reduce((sum, i) => sum + i.netAmount, 0);
			item[cartKey].totalDiscount = item[cartKey].subTotal - item[cartKey].finalAmount;
			item.barcode = '';
		} else if (/\d+-/.test(value)) {
			// Shortcut for delete item, e.g., "2-" means delete item at serial 2
			const [serial] = value.split('-').map(Number);
			const cartKey = purchaseCartFocused ? 'purchaseCart' : 'returnCart';
			const currentLineItems = $state.snapshot(item[cartKey]?.lineItems) || [];
			const tempCart = [...currentLineItems];

			if (!tempCart[serial - 1]) {
				toastStore.show(`No item at serial ${serial} to delete`, 'error');
				return;
			}

			tempCart.splice(serial - 1, 1);

			item[cartKey].lineItems = tempCart;
			item[cartKey].subTotal = tempCart.reduce((sum, i) => sum + i.grossAmount, 0);
			item[cartKey].finalAmount = tempCart.reduce((sum, i) => sum + i.netAmount, 0);
			item[cartKey].totalDiscount = item[cartKey].subTotal - item[cartKey].finalAmount;
			item.barcode = '';
		} else {
			toastStore.show('Unidentified Barcode', 'error');
		}
	}

	function handleSwitchCart() {
		purchaseCartFocused = !purchaseCartFocused;
	}
</script>

<Form close={handleFormClose} title="POS Billing Engine - Create New Bill" large={true}>
	<!-- Referance Bill Part -->
	{#if item.referenceBill}
		<div class="mb-5 flex items-center justify-between rounded bg-black/20 px-4 py-2">
			<span>
				<span>Exchange Bill Against: </span>
				<span class="font-bold! text-green-700">
					{item.referenceBill}
				</span>
			</span>
			<button
				class="-mt-1 cursor-pointer text-2xl text-red-700"
				onclick={() => (item.referenceBill = '')}
				type="button"
			>
				&times;
			</button>
		</div>
	{/if}

	<!-- Master Barcode Part -->
	<Combo
		key="barcode"
		autofocus
		hotKeys={{ ENTER: handleBarcode, ' ': handleSwitchCart }}
		bind:value={item.barcode}
	/>

	<!-- Item Cart List table -->
	{#if item.purchaseCart.lineItems && item.purchaseCart.lineItems.length}
		<table class="mb-5 w-full">
			<caption class="border border-b-0 bg-black/10">Purchase Cart</caption>
			<thead>
				<tr class="bg-black/10 *:border *:px-1">
					<th>SN</th>
					<th>Barcode</th>
					<th>Name</th>
					<th>Qty</th>
					<th>Price</th>
					<th>Dis %</th>
					<th>Dis Price</th>
					<th>Gross</th>
					<th>Net</th>
				</tr>
			</thead>
			<tbody>
				{#each item.purchaseCart.lineItems as item, index (item.barcode)}
					<tr class="text-center *:border *:px-1">
						<td>{index + 1}</td>
						<td>{item.barcode}</td>
						<td>{item.name}</td>
						<td>{item.quantity}</td>
						<td>{item.unitPrice}</td>
						<td>{item.discountPercentage}</td>
						<td>{item.discountedUnitPrice}</td>
						<td>{item.grossAmount}</td>
						<td>{item.netAmount}</td>
					</tr>
				{/each}
				<tr class="bg-black/10 text-center *:border *:px-1">
					<td colspan="7" class="text-right">
						Total Amount <span class="font-bold! text-red-700">
							(-{formatter.numberWithCommas(item.purchaseCart.totalDiscount)})
						</span>
					</td>
					<td>{formatter.numberWithCommas(item.purchaseCart.subTotal)}</td>
					<td>{formatter.numberWithCommas(item.purchaseCart.finalAmount)}</td>
				</tr>
			</tbody>
		</table>
	{/if}

	<!-- Item Cart List table -->
	<div class="mb-5 flex *:flex-1">
		<div class="text-left">
			<Input key="" placeholder="Customer Name" />
			<div class="mb-4 flex gap-4">
				<div><Input key="AOS" placeholder="AOS" /></div>
				<div><Input key="DOS" placeholder="DOS" /></div>
			</div>
			<Input key="extraDiscount" />
		</div>
		<div class="text-right">
			<div>
				<span>Total Cart Amount = </span>
				<span>{formatter.numberWithCommas(item.purchaseCart.subTotal)}</span>
			</div>
			<div>
				<span>Discount Cart Amount = </span>
				<span>{formatter.numberWithCommas(item.purchaseCart.totalDiscount)}</span>
			</div>
			<div>
				<span>Final Cart Amount = </span>
				<span>{formatter.numberWithCommas(item.purchaseCart.finalAmount)}</span>
			</div>
		</div>
	</div>
</Form>
