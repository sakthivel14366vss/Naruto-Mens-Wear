<script>
	import Form from '$lib/component/Form.svelte';
	import Combo from '$lib/component/Combo.svelte';
	import Input from '$lib/component/Input.svelte';
	import formatter from '$lib/utils/formatter.js';
	import { initialPaymentItemState } from './state.js';

	let { editableItem = $bindable(), handleFormClose, handleBarcodeKey } = $props();

	// Local controller helper fields for new payment insertions
	let newPaymentAmount = $state('');
	let newPaymentType = $state('Cash');
	let newPaymentDirection = $state(1); // 1 = Received, -1 = Given back

	// --- RE-ARCHITECTED CART REACTIVE RUNES ---

	// Purchase Totals
	const pSubTotal = $derived(
		editableItem.purchaseCart.itemList.reduce((s, i) => s + i.qty * i.price, 0)
	);
	const pDiscountedSubTotal = $derived(
		editableItem.purchaseCart.itemList.reduce((s, i) => s + i.qty * i.discountedPrice, 0)
	);
	const pItemDiscountTotal = $derived(pSubTotal - pDiscountedSubTotal);
	const pExtraDiscountAmount = $derived(
		formatter.number(editableItem.purchaseCart.extraDiscountAmount || 0)
	);
	const purchaseFinalAmount = $derived(pDiscountedSubTotal - pExtraDiscountAmount);

	// Return Totals
	const rSubTotal = $derived(
		editableItem.returnCart.itemList.reduce((s, i) => s + i.qty * i.price, 0)
	);
	const rDiscountedSubTotal = $derived(
		editableItem.returnCart.itemList.reduce((s, i) => s + i.qty * i.discountedPrice, 0)
	);
	const returnFinalAmount = $derived(rDiscountedSubTotal);

	// Dynamic Ledger Pipeline Operations
	const oldInvoicePending = $derived(formatter.number(editableItem.ledger.oldInvoicePending || 0));
	const advanceClaimed = $derived(formatter.number(editableItem.ledger.advanceClaimed || 0));

	// netPayable = (Purchase demand - Return Value Credit) + Arrears - Advance Vouchers Used
	const netPayable = $derived(
		purchaseFinalAmount - returnFinalAmount + oldInvoicePending - advanceClaimed
	);

	// Real-Time Total Paid calculation aggregate mirroring item directions
	const totalPaid = $derived(
		editableItem.ledger.payments.reduce((s, p) => s + formatter.number(p.amount) * p.accountType, 0)
	);
	const pendingAmount = $derived(netPayable - totalPaid);

	// Svelte Effects sync values smoothly back to server model fields before posting
	$effect(() => {
		editableItem.purchaseCart.subTotal = pSubTotal;
		editableItem.purchaseCart.itemDiscountTotal = pItemDiscountTotal;
		editableItem.purchaseCart.finalAmount = purchaseFinalAmount;

		editableItem.returnCart.subTotal = rSubTotal;
		editableItem.returnCart.finalAmount = returnFinalAmount;

		editableItem.ledger.netPayable = netPayable;
		editableItem.ledger.totalPaid = totalPaid;
		editableItem.ledger.pendingAmount = pendingAmount;
	});

	function addPaymentRow() {
		const amt = formatter.number(newPaymentAmount);
		if (amt <= 0) return;

		editableItem.ledger.payments.push({
			amount: amt,
			amountType: newPaymentType,
			accountType: Number(newPaymentDirection)
		});

		newPaymentAmount = ''; // Reset entry input fields
	}

	function removePaymentRow(index) {
		editableItem.ledger.payments.splice(index, 1);
	}
</script>

<Form title="Retail POS Terminal Engine" isEdit={!!editableItem?._id} close={handleFormClose}>
	{#if editableItem?._id}
		<input type="hidden" name="_id" value={editableItem._id} />
	{/if}

	<input type="hidden" name="billNo" value={editableItem.billNo} />
	<input type="hidden" name="date" value={editableItem.date} />
	<input type="hidden" name="purchaseCart" value={JSON.stringify(editableItem.purchaseCart)} />
	<input type="hidden" name="returnCart" value={JSON.stringify(editableItem.returnCart)} />
	<input type="hidden" name="ledger" value={JSON.stringify(editableItem.ledger)} />

	<input
		type="hidden"
		name="advanceAdjustedFromBill"
		value={editableItem.advanceAdjustedFromBill}
	/>
	<input type="hidden" name="returnClaimedFromBill" value={editableItem.returnClaimedFromBill} />

	<div class="mb-4 grid grid-cols-2 gap-4 rounded border border-gray-200 bg-gray-50 p-3">
		<div>
			<label class="block text-xs font-bold text-gray-600">Link Advance Bill Number:</label>
			<input
				type="text"
				class="w-full border bg-white p-1 text-sm"
				placeholder="INV-XXXX-X"
				bind:value={editableItem.advanceAdjustedFromBill}
			/>
		</div>
		<div>
			<label class="block text-xs font-bold text-gray-600">Link Return Origin Bill:</label>
			<input
				type="text"
				class="w-full border bg-white p-1 text-sm"
				placeholder="INV-XXXX-X"
				bind:value={editableItem.returnClaimedFromBill}
			/>
		</div>
	</div>

	<div class="mb-4">
		<label class="mb-1 block text-xs font-bold text-red-800"
			>SCAN COMPONENT BARCODE / SKU ENTRY:</label
		>
		<Combo
			key="barcode"
			autofocus
			bind:value={editableItem.barcode}
			hotKeys={{ ALL: handleBarcodeKey }}
		/>
	</div>

	{#if editableItem.purchaseCart.itemList.length}
		<div class="mb-6">
			<h3 class="mb-2 border-b border-black pb-1 text-sm font-bold text-gray-800">
				🛒 Outflow Purchases Cart
			</h3>
			<table class="w-full border-separate border-spacing-0">
				<thead>
					<tr class="bg-gray-800 text-xs text-white *:border *:px-2 *:py-1">
						<th>S.No</th>
						<th>Barcode/SKU</th>
						<th>Product Details</th>
						<th>Qty</th>
						<th>Price</th>
						<th>Dis %</th>
						<th>Unit Net</th>
						<th>Row Final</th>
					</tr>
				</thead>
				<tbody>
					{#each editableItem.purchaseCart.itemList as item, index (item.barcode)}
						<tr class="text-center text-sm font-medium *:border *:px-2 *:py-1">
							<td>{index + 1}</td>
							<td class="font-mono text-xs">{item.barcode}</td>
							<td class="text-left font-semibold">{item.name}</td>
							<td class="w-16"
								><input
									type="number"
									class="w-full border text-center font-bold"
									bind:value={item.qty}
									min="1"
									oninput={() => {
										item.amount = item.qty * item.price;
										item.discountedAmount = item.qty * item.discountedPrice;
									}}
								/></td
							>
							<td>₹{item.price}</td>
							<td class="w-16"
								><input
									type="number"
									class="w-full border text-center"
									bind:value={item.discountPercentage}
									min="0"
									max="100"
									oninput={() => {
										item.discountedPrice =
											item.price - item.price * (item.discountPercentage / 100);
										item.discountedAmount = item.qty * item.discountedPrice;
									}}
								/>%</td
							>
							<td class="bg-gray-50">₹{item.discountedPrice}</td>
							<td class="bg-green-50/50 font-bold">₹{item.discountedAmount}</td>
						</tr>
					{/each}
					<tr class="bg-gray-100 text-xs font-bold *:border *:px-2 *:py-1">
						<td colspan="7" class="text-right">Aggregate Item Total:</td>
						<td class="text-center text-sm font-extrabold text-green-800">₹{pDiscountedSubTotal}</td
						>
					</tr>
				</tbody>
			</table>
		</div>
	{/if}

	<div class="mb-6 rounded border border-black bg-gray-50/50 p-3">
		<h3 class="mb-3 border-b border-black pb-1 text-sm font-bold text-black">
			💳 Live Multi-Split Settlement Ledger
		</h3>

		<div class="mb-4 grid grid-cols-4 items-end gap-2 rounded border bg-white p-2 shadow-sm">
			<div>
				<label class="mb-1 block text-xs font-bold text-gray-500">Value Amount:</label>
				<input
					type="number"
					class="w-full rounded border p-1 font-mono text-sm font-bold"
					bind:value={newPaymentAmount}
					placeholder="0.00"
				/>
			</div>
			<div>
				<label class="mb-1 block text-xs font-bold text-gray-500">Channel Channel:</label>
				<select
					class="w-full rounded border bg-gray-50 p-1 text-sm font-medium"
					bind:value={newPaymentType}
				>
					<option value="Cash">Cash Currency</option>
					<option value="UPI">UPI (GPay/Paytm)</option>
					<option value="Card">Credit/Debit Card</option>
					<option value="StoreCredit">Store Credit/Voucher</option>
				</select>
			</div>
			<div>
				<label class="mb-1 block text-xs font-bold text-gray-500">Direction Flow:</label>
				<select
					class="w-full rounded border bg-gray-50 p-1 text-sm font-medium"
					bind:value={newPaymentDirection}
				>
					<option value={1}>[+] Cash Received In</option>
					<option value={-1}>[-] Counter Change Paid Out</option>
				</select>
			</div>
			<button
				type="button"
				class="w-full rounded bg-black py-2 text-xs font-bold tracking-wider text-white uppercase hover:bg-neutral-800"
				onclick={addPaymentRow}>Commit Row</button
			>
		</div>

		{#if editableItem.ledger.payments.length}
			<table class="mb-2 w-full border-separate border-spacing-0 bg-white">
				<thead>
					<tr class="bg-neutral-200 text-left text-xs font-bold *:border *:px-2 *:py-1">
						<th class="w-12 text-center">Index</th>
						<th>Payment Modality</th>
						<th>Cash Flow Track</th>
						<th>Collected Amount</th>
						<th class="w-12 text-center">Action</th>
					</tr>
				</thead>
				<tbody>
					{#each editableItem.ledger.payments as pay, index}
						<tr class="font-mono text-sm *:border *:px-2 *:py-1">
							<td class="text-center">{index + 1}</td>
							<td class="font-sans text-xs font-semibold">{pay.amountType}</td>
							<td
								class="font-sans text-xs font-bold {pay.accountType === 1
									? 'text-green-700'
									: 'text-red-600'}"
							>
								{pay.accountType === 1 ? 'INCOMING INFLOW' : 'REFUND OUTFLOW'}
							</td>
							<td class="pr-6 text-right font-bold">₹{pay.amount}</td>
							<td class="text-center"
								><button
									type="button"
									class="text-xs text-red-600 hover:font-bold"
									onclick={() => removePaymentRow(index)}>✖</button
								></td
							>
						</tr>
					{/each}
				</tbody>
			</table>
			{#if totalPaid > 0}
				<div class="mb-2 text-right font-mono text-xs font-bold text-neutral-600">
					Aggregated Counter Registry Inflow: <span class="text-sm text-black underline"
						>₹{totalPaid}</span
					>
				</div>
			{/if}
		{/if}
	</div>

	{#if pSubTotal > 0 || oldInvoicePending > 0 || advanceClaimed > 0}
		<div class="mt-4 flex gap-6 border-t-2 border-black bg-white pt-4">
			<div class="flex-1 space-y-3">
				<div>
					<label class="mb-1 block text-xs font-bold text-neutral-500"
						>Manual Overlay Extra Discount (Flat Cash):</label
					>
					<Input
						key="extraDiscountAmount"
						bind:value={editableItem.purchaseCart.extraDiscountAmount}
					/>
				</div>
				<div class="grid grid-cols-2 gap-2 pt-1">
					<div>
						<label class="block text-xs font-bold text-neutral-500"
							>Arrears / Debt Brought Forward:</label
						>
						<input
							type="number"
							class="w-full rounded border bg-red-50/50 p-1 text-sm font-bold text-red-900"
							bind:value={editableItem.ledger.oldInvoicePending}
						/>
					</div>
					<div>
						<label class="block text-xs font-bold text-neutral-500"
							>Advance Deductible Pool Balance:</label
						>
						<input
							type="number"
							class="w-full rounded border bg-blue-50/50 p-1 text-sm font-bold text-blue-900"
							bind:value={editableItem.ledger.advanceClaimed}
						/>
					</div>
				</div>
			</div>

			<div
				class="ml-auto w-80 space-y-1 rounded border border-neutral-200 bg-neutral-50 p-3 text-right"
			>
				<div>
					<span class="text-xs font-medium text-neutral-500">Cart Gross Subtotal:</span>
					<span class="ml-2 font-mono font-bold">₹{formatter.numberWithCommas(pSubTotal)}</span>
				</div>
				<div>
					<span class="text-xs font-medium text-neutral-500">Structural Item Discounts:</span>
					<span class="ml-2 font-mono font-semibold text-red-600"
						>-₹{formatter.numberWithCommas(pItemDiscountTotal)}</span
					>
				</div>
				{#if pExtraDiscountAmount > 0}
					<div>
						<span class="text-xs font-medium text-neutral-500">Flat Overlay Extra Discount:</span>
						<span class="ml-2 font-mono font-semibold text-red-600"
							>-₹{formatter.numberWithCommas(pExtraDiscountAmount)}</span
						>
					</div>
				{/if}
				{#if oldInvoicePending > 0}
					<div>
						<span class="text-xs font-semibold text-red-800">Arrears Pending Added:</span>
						<span class="ml-2 font-mono font-bold text-red-800"
							>+₹{formatter.numberWithCommas(oldInvoicePending)}</span
						>
					</div>
				{/if}
				{#if advanceClaimed > 0}
					<div>
						<span class="text-xs font-semibold text-blue-800">Advance Store-Credit Claimed:</span>
						<span class="ml-2 font-mono font-bold text-blue-800"
							>-₹{formatter.numberWithCommas(advanceClaimed)}</span
						>
					</div>
				{/if}
				<hr class="my-2 border-dashed border-neutral-300" />
				<div>
					<span class="text-sm font-bold text-neutral-800">Target Net Payable Demanded:</span>
					<span class="ml-2 font-mono text-base font-extrabold"
						>₹{formatter.numberWithCommas(netPayable)}</span
					>
				</div>
				<div>
					<span class="text-xs text-neutral-500">Total Tendered Payments Settled:</span>
					<span class="ml-2 font-mono font-bold text-green-700"
						>₹{formatter.numberWithCommas(totalPaid)}</span
					>
				</div>
				<div class="mt-2 border-t pt-2">
					<span class="text-sm font-black tracking-tight text-neutral-900 uppercase"
						>Remaining Counter Balance:</span
					>
					<div
						class="font-mono text-xl font-black tracking-tighter {pendingAmount === 0
							? 'text-green-600'
							: 'text-red-600'}"
					>
						₹{formatter.numberWithCommas(pendingAmount)}
					</div>
				</div>

				{#if pendingAmount !== 0}
					<div
						class="mt-3 animate-pulse rounded bg-red-100 p-1 text-right text-xs font-bold tracking-tight text-red-800"
					>
						⚠️ Counter Registry Must Equal Zero Prior to Dispatch
					</div>
				{/if}
			</div>
		</div>
	{/if}
</Form>
