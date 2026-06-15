<script>
	import Input from '$lib/component/Input.svelte';
	import Form from '$lib/component/Form.svelte';
	import Table from '$lib/component/Table.svelte';
	import Combo from '$lib/component/Combo.svelte';
	import { toastStore } from '$lib/utils/toast.svelte.js';
	import { hash } from '$lib/utils/useHash.js';
	import { invalidate } from '$app/navigation';
	import { useFormHandler } from '$lib/utils/formHandler.svelte.js';
	import triggerAction from '$lib/utils/triggerAction.js';
	import formatter from '$lib/utils/formatter.js';

	const DEFAULT_DISCOUNT = 20;

	const { form = null, data } = $props();

	// State Management
	let editableItem = $state(getInitialItem());

	// Helper to calculate unit discounted price
	function calcDiscountedPrice(price, discount) {
		return price - price * (discount / 100);
	}

	// --- Derived Calculations (Reactive for UI & Backend Payload) ---

	// 1. Total Base Price before any discount
	const grandTotalAmount = $derived(
		editableItem.cart.reduce((sum, item) => sum + item.qty * item.price, 0)
	);

	// 2. Total Price after structural product discounts
	const grandTotalDiscountedAmount = $derived(
		editableItem.cart.reduce(
			(sum, item) => sum + item.qty * calcDiscountedPrice(item.price, item.discount),
			0
		)
	);

	// 3. Absolute savings from structural discounts
	const totalProductDiscountSaved = $derived(grandTotalAmount - grandTotalDiscountedAmount);

	// 4. Safe conversion of manual extra discount input
	const extraDiscountAmount = $derived(formatter.number(editableItem.extraDiscountAmount || 0));

	// 5. Final aggregate checkout amount sent to backend
	const finalAmount = $derived(grandTotalDiscountedAmount - extraDiscountAmount);

	// 6. Cumulative savings amount (Product discounts + Extra overlay manual discount)
	const cumulativeSavings = $derived(totalProductDiscountSaved + extraDiscountAmount);

	useFormHandler(
		() => form,
		() => {
			invalidate('stock');
			handleFormClose();
		}
	);

	function getInitialItem() {
		return { cart: [], barcode: '', extraDiscountAmount: 0 };
	}

	function onEdit(item) {
		$hash = ['form'];
		editableItem = item;
	}

	function onCreate() {
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
		if (barcode.startsWith('PR')) {
			const product = data.stocks.find((s) => s.barcode === barcode);

			if (!product) {
				return toastStore.show('Product Not Found', 'error');
			}

			const existingItem = editableItem.cart.find((c) => c.barcode === barcode);

			if (existingItem) {
				existingItem.qty += 1;
			} else {
				editableItem.cart.push({
					barcode: product.barcode,
					name: product.name,
					price: product.salesPrice,
					discount: DEFAULT_DISCOUNT,
					qty: 1
				});
			}

			editableItem.barcode = '';
		} else if (barcode.startsWith('BILL')) {
			// Handle bill scanning logic here
		} else {
			toastStore.show('Unidentified Barcode', 'error');
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

<Form title="Bills" isEdit={!!editableItem?._id} close={handleFormClose}>
	{#if editableItem?._id}
		<input type="hidden" name="_id" value={editableItem._id} />
	{/if}

	<input type="hidden" name="cart" value={JSON.stringify(editableItem.cart)} />
	<input type="hidden" name="grandTotalAmount" value={grandTotalAmount} />
	<input type="hidden" name="grandTotalDiscountedAmount" value={grandTotalDiscountedAmount} />
	<input type="hidden" name="extraDiscountAmount" value={extraDiscountAmount} />
	<input type="hidden" name="finalAmount" value={finalAmount} />
	<input type="hidden" name="totalSaved" value={cumulativeSavings} />

	<Combo
		key="barcode"
		autofocus
		bind:value={editableItem.barcode}
		hotKeys={{ ALL: handleBarcodeKey }}
	/>

	{#if editableItem.cart.length}
		<table class="mb-5 w-full">
			<thead>
				<tr class="bg-black/10 *:border *:px-1">
					<th>S.No</th>
					<th>Name</th>
					<th>Qty</th>
					<th>Price</th>
					<th>Dis</th>
					<th>Dis Price</th>
					<th>Amount</th>
					<th>Dis Amount</th>
				</tr>
			</thead>
			<tbody>
				{#each editableItem.cart as item, index (item.barcode)}
					{@const disPrice = calcDiscountedPrice(item.price, item.discount)}
					{@const amount = item.qty * item.price}
					{@const disAmount = item.qty * disPrice}

					<tr class="text-center *:border *:px-1">
						<td>{index + 1}</td>
						<td class="text-left">{item.name}</td>
						<td>{item.qty}</td>
						<td>{item.price}</td>
						<td>{item.discount}%</td>
						<td>{disPrice}</td>
						<td>{amount}</td>
						<td>{disAmount}</td>
					</tr>
				{/each}

				<tr class="bg-black/5 text-center font-bold *:border *:px-1">
					<td colspan="6" class="text-right">Grand Totals:</td>
					<td>{grandTotalAmount}</td>
					<td>
						{grandTotalDiscountedAmount}
						<span class="text-red-600">(-{totalProductDiscountSaved})</span>
					</td>
				</tr>
			</tbody>
		</table>
	{/if}

	{#if grandTotalAmount}
		<div class="flex">
			<div class="flex-1">
				<label class="text-gray-500">Extra Discount Amount:</label>
				<Input key="extraDiscountAmount" bind:value={editableItem.extraDiscountAmount} />
			</div>
			<div class="ml-auto flex-1 text-right">
				<div>
					<span class="text-sm text-gray-500">Grand Total:</span>
					<span class="font-extrabold!">₹ {formatter.numberWithCommas(grandTotalAmount)}</span>
				</div>
				<div>
					<span class="text-sm text-gray-500">Discounted Amount:</span>
					<span class="font-extrabold!">
						₹ {formatter.numberWithCommas(totalProductDiscountSaved)}
					</span>
				</div>
				{#if extraDiscountAmount > 0}
					<div>
						<span class="text-sm text-gray-500">Extra Discount Amount:</span>
						<span class="font-extrabold!">
							₹ {formatter.numberWithCommas(extraDiscountAmount)}
						</span>
					</div>
				{/if}
				<div class="mb-5">
					<span class="text-sm text-gray-500">Final Amount:</span>
					<span class="font-extrabold!">
						₹ {formatter.numberWithCommas(finalAmount)}
						{#if extraDiscountAmount > 0}
							<span class="text-red-600">(-{cumulativeSavings})</span>
						{/if}
					</span>
				</div>
			</div>
		</div>
	{/if}
</Form>
