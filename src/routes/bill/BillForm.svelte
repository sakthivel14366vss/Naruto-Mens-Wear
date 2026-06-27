<script>
	import { untrack } from 'svelte';
	import Combo from '$lib/component/Combo.svelte';
	import Form from '$lib/component/Form.svelte';
	import Input from '$lib/component/Input.svelte';
	import formatter from '$lib/utils/formatter';
	import { toastStore } from '$lib/utils/toast.svelte';
	import { hash } from '$lib/utils/useHash.js';
	import { initialBillState, initialPaymentItemState } from './state';
	import { reCalculateItem } from './calculation';
	import Button from '$lib/component/Button.svelte';
	import { env } from '$env/dynamic/public';

	let {
		item = $bindable(),
		handleFormClose,
		handleBillBarCode,
		stocks = [],
		outstandings = []
	} = $props();
	let purchaseCartFocused = $state(true);
	let barcode = $state('');
	let isCreditExist = $derived(item.ledger.payments.find((p) => p.paymentMode === 'Credit'));
	let advanceAmountExist = $state(0);
	let balanceAmountExist = $state(0);
	let barcodeElement = $state(null);
	let referenceBillData = $state(null);

	let isTodayBill = $derived(
		item?._id
			? new Date(item.createdAt).toLocaleDateString() === new Date().toLocaleDateString()
			: true
	);
	let isReturnBill = $derived(item.metadata?.referenceBill);
	let isReturnClaimed = $derived(item.metadata?.referByBill);
	let isEligibleToReturn = $derived(
		item?._id
			? (() => {
					const creationDate = new Date(item.createdAt);
					const expiryDate = new Date(creationDate);
					expiryDate.setDate(creationDate.getDate() + Number(env.PUBLIC_BILL_RETURN_ELIGABLE));
					return expiryDate >= new Date();
				})() &&
					!item.metadata.referenceBill &&
					!isReturnClaimed
			: false
	);

	function handleBarcode({ value }) {
		barcode = '';
		if (value.startsWith('PR')) {
			const scannedItem = stocks.find((s) => s.barcode === value);
			const cartKey = purchaseCartFocused ? 'purchaseCart' : 'returnCart';
			const currentLineItems = $state.snapshot(item[cartKey]?.lineItems) || [];
			const tempCart = [...currentLineItems];
			const existingItem = tempCart.find((i) => i.barcode === value);
			const purchasedItem = referenceBillData?.purchaseCart?.lineItems?.find(
				(i) => i.barcode === value
			);

			// Validation
			if (purchaseCartFocused) {
				if (!scannedItem) {
					toastStore.show('Item not found in stocks', 'error');
					return;
				} else if (!scannedItem.count) {
					toastStore.show('Product Out of Stock', 'error');
					return;
				}
			} else {
				if (!purchasedItem) {
					toastStore.show('User can not return non purchased item', 'error');
					return;
				}
				if (existingItem?.quantity > purchasedItem?.quantity - 1) {
					toastStore.show('User can not return extra quantity', 'error');
					return;
				}
			}

			// Cart Modification
			if (existingItem) {
				existingItem.quantity += 1;
			} else {
				tempCart.push({
					barcode: scannedItem.barcode,
					name: purchaseCartFocused ? scannedItem.name : purchasedItem.name,
					quantity: 1,
					unitPrice: purchaseCartFocused ? scannedItem.salesPrice : purchasedItem.unitPrice,
					discountPercentage: purchaseCartFocused
						? scannedItem.discount || 0
						: purchasedItem.discountPercentage || 0,
					discountedUnitPrice: 0,
					grossAmount: 0,
					netAmount: 0
				});
			}

			item[cartKey].lineItems = tempCart;
			// Clear input field
			barcode = '';
			item = reCalculateItem(item);
		} else if (value.startsWith('BL')) {
			handleBillBarCode(value);
			barcode = '';
		} else if (value.startsWith('RETURN')) {
			barcode = '';
			handleReturnBill();
		} else if (/^\d+[+=]\d+$/.test(value)) {
			barcode = '';
			// Shortcut for quantity update, e.g., "2+3" means add 3 to item at serial 2
			const [serial, qty] = value.split(/[+=]/).map(Number);
			const cartKey = purchaseCartFocused ? 'purchaseCart' : 'returnCart';
			const currentLineItems = $state.snapshot(item[cartKey]?.lineItems) || [];
			const tempCart = [...currentLineItems];

			if (!tempCart[serial - 1]) {
				toastStore.show(`No item at serial ${serial} to update`, 'error');
				return;
			}
			if (purchaseCartFocused) {
				const scannedItem = stocks.find((s) => s.barcode === tempCart[serial - 1].barcode);
				if (scannedItem && scannedItem.count - qty < 0) {
					toastStore.show(`Only ${scannedItem.count} left for ${scannedItem.name}`, 'error');
					return;
				}
			} else {
				const purchasedItem = referenceBillData.purchaseCart.lineItems.find(
					(i) => i.barcode === tempCart[serial - 1].barcode
				);
				if (qty > purchasedItem?.quantity) {
					toastStore.show('User can not return extra quantity', 'error');
					return;
				}
			}

			tempCart[serial - 1].quantity = qty;
			item[cartKey].lineItems = tempCart;
			barcode = '';
			item = reCalculateItem(item);
		} else if (/^\d+-$/.test(value)) {
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
			barcode = '';
			item = reCalculateItem(item);
		} else {
			toastStore.show('Unidentified Barcode', 'error');
		}
	}

	$effect(() => {
		// 1. Explicitly read only the inputs we want to react to
		const triggeradvanceAmount = item.ledger?.advanceAmount;
		const triggerbalanceAmount = item.ledger?.balanceAmount;
		const triggerDiscount = item.ledger?.extraDiscount;

		// 2. Deep-track inner objects inside the payments array
		// This tells Svelte's reactivity engine to listen to deep mutations within each row
		if (item.ledger?.payments) {
			item.ledger.payments.forEach((p) => {
				const _trackFlow = p.flowDirection;
				const _trackAmount = p.amount;
				const _trackMode = p.paymentMode;
			});
		}

		// 3. Wrap the calculation in untrack so its internal writes don't re-trigger the effect
		untrack(() => {
			item = reCalculateItem(item);
			handleCustomerNameSelection(item.metadata.customer.name);
			barcode = '';
		});
	});

	function handleSwitchCart() {
		if (isReturnBill) {
			purchaseCartFocused = !purchaseCartFocused;
		}
	}

	function handleCustomerNameSelection(value) {
		const outStanding = outstandings.find((os) => os.name == value);
		if (outStanding) {
			item.metadata.customer.phone = outStanding.phone;
			if (outStanding.amount > 0) balanceAmountExist = outStanding.amount;
			else advanceAmountExist = outStanding.amount * -1;
		} else {
			balanceAmountExist = 0;
			advanceAmountExist = 0;
		}
	}

	function handlePaymentRowKey(event, index) {
		const key = event.key.toUpperCase();
		if (key == 'DELETE' || key == 'ARROWDOWN') {
			event.preventDefault();
			event.stopPropagation();
		}
		if (key == 'ARROWDOWN') item.ledger.payments.push({ ...initialPaymentItemState });
		else if (key == 'DELETE' && item.ledger.payments.length > 1) {
			item.ledger.payments.splice(index, 1);
		}
	}

	function getInitialItem() {
		return structuredClone(initialBillState);
	}

	function navigateReferenceBill() {
		let billNo = item.metadata?.referenceBill ? item.metadata.referenceBill : '';
		billNo = item.metadata?.referByBill ? item.metadata.referByBill : billNo;
		if (billNo) {
			handleBillBarCode(billNo);
		}
	}

	function handleReturnBill() {
		if (isEligibleToReturn) {
			referenceBillData = item;
			item = getInitialItem();
			item.metadata.referenceBill = referenceBillData.metadata.billNo;
			barcodeElement?.focus();
			purchaseCartFocused = false;
		} else {
			toastStore.show(`Can't returnable, may be expired or alredy returned`, 'error');
		}
	}
</script>

<Form
	close={handleFormClose}
	title={`POS Billing Engine - ${item._id ? 'Update' : 'Create'} Bill ${item._id && item.metadata.billNo ? ` - ${item.metadata.billNo}` : ''}`}
	large={true}
	isEdit={item._id}
	disableSubmitButton={!isTodayBill ||
		item.ledger.pendingAmount !== 0 ||
		(isCreditExist && !item.metadata.customer.name) ||
		(item.metadata.customer.name && !/^\d{10}$/.test(item.metadata.customer.phone))}
>
	{#if item._id}
		<input type="hidden" name="_id" value={item._id} />
	{/if}
	<input type="hidden" name="data" value={JSON.stringify(item)} />
	{#if isReturnBill}
		<button
			tabindex="-1"
			class="mb-4 w-full cursor-pointer"
			onclick={navigateReferenceBill}
			type="button"
		>
			<div class="rounded bg-blue-100 px-4 py-2">
				<span>Exchange Bill Against: </span>
				<span class="font-bold! text-blue-700">
					{item.metadata.referenceBill}
				</span>
			</div>
		</button>
	{/if}
	{#if isReturnClaimed}
		<button
			tabindex="-1"
			class="mb-4 w-full cursor-pointer"
			onclick={navigateReferenceBill}
			type="button"
		>
			<div class="rounded bg-red-100 px-4 py-2">
				<span>Exchange Bill Claimed on: </span>
				<span class="font-bold! text-red-700">
					{item.metadata.referByBill}
				</span>
			</div>
		</button>
	{/if}

	<Input
		placeholder={`Barcode - ${purchaseCartFocused ? 'Purchase Cart' : 'Return Cart'}`}
		autofocus
		color={purchaseCartFocused ? 'blue' : 'green'}
		hotKeys={{ ENTER: handleBarcode, ' ': handleSwitchCart }}
		bind:value={barcode}
		bind:element={barcodeElement}
	/>

	{#if item.returnCart?.lineItems && item.returnCart.lineItems.length}
		<table class="mb-5 w-full">
			<caption class="border border-b-0 bg-green-100">Return Cart</caption>
			<thead>
				<tr class="bg-green-100 *:border *:px-1">
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
				{#each item.returnCart.lineItems as lineItem, index (lineItem.barcode)}
					<tr class="text-center *:border *:px-1">
						<td>{index + 1}</td>
						<td>{lineItem.barcode}</td>
						<td>{lineItem.name}</td>
						<td>{lineItem.quantity}</td>
						<td>{lineItem.unitPrice}</td>
						<td>{lineItem.discountPercentage}</td>
						<td>{lineItem.discountedUnitPrice}</td>
						<td>{lineItem.grossAmount}</td>
						<td>{lineItem.netAmount}</td>
					</tr>
				{/each}
				<tr class="bg-green-100 text-center *:border *:px-1">
					<td colspan="7" class="text-right">
						Total Amount <span class="font-bold! text-red-600">
							(-{formatter.numberWithCommas(item.returnCart.totalDiscount)})
						</span>
					</td>
					<td>{formatter.numberWithCommas(item.returnCart.subTotal)}</td>
					<td>{formatter.numberWithCommas(item.returnCart.finalAmount)}</td>
				</tr>
			</tbody>
		</table>
	{/if}

	{#if item.purchaseCart?.lineItems && item.purchaseCart.lineItems.length}
		<table class="mb-5 w-full">
			<caption class="border border-b-0 bg-blue-100">Purchase Cart</caption>
			<thead>
				<tr class="bg-blue-100 *:border *:px-1">
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
				{#each item.purchaseCart.lineItems as lineItem, index (lineItem.barcode)}
					<tr class="text-center *:border *:px-1">
						<td>{index + 1}</td>
						<td>{lineItem.barcode}</td>
						<td>{lineItem.name}</td>
						<td>{lineItem.quantity}</td>
						<td>{lineItem.unitPrice}</td>
						<td>{lineItem.discountPercentage}</td>
						<td>{lineItem.discountedUnitPrice}</td>
						<td>{lineItem.grossAmount}</td>
						<td>{lineItem.netAmount}</td>
					</tr>
				{/each}
				<tr class="bg-blue-100 text-center *:border *:px-1">
					<td colspan="7" class="text-right">
						Total Amount <span class="font-bold! text-red-600">
							(-{formatter.numberWithCommas(item.purchaseCart.totalDiscount)})
						</span>
					</td>
					<td>{formatter.numberWithCommas(item.purchaseCart.subTotal)}</td>
					<td>{formatter.numberWithCommas(item.purchaseCart.finalAmount)}</td>
				</tr>
			</tbody>
		</table>
	{/if}

	<div class="mb-5 flex gap-5 *:flex-1">
		<div class="text-left">
			<Combo
				placeholder="Customer Name"
				options={outstandings.map((os) => os.name)}
				bind:value={item.metadata.customer.name}
				caseMode="capitalize"
				onBlur={handleCustomerNameSelection}
				disabled={!isTodayBill}
			/>
			{#if item.metadata.customer.name}
				<Input
					placeholder="Customer Phone"
					bind:value={item.metadata.customer.phone}
					caseMode="capitalize"
					disabled={!isTodayBill}
				/>
				<div class="mb-4 flex gap-4">
					<div>
						<Input
							placeholder="Advance Amount"
							bind:value={item.ledger.advanceAmount}
							disabled={!isTodayBill}
						/>
						<span class="-mt-3 block text-green-700">
							Advance: {formatter.numberWithCommas(advanceAmountExist)}
						</span>
					</div>
					<div>
						<Input
							placeholder="Balance Amount"
							bind:value={item.ledger.balanceAmount}
							disabled={!isTodayBill}
						/>
						<span class="-mt-3 block text-red-700">
							Balance: {formatter.numberWithCommas(balanceAmountExist)}
						</span>
					</div>
				</div>
			{/if}
			{#if item.ledger.netPayable && !item.metadata.customer.name}
				<Input
					placeholder="Extra Discount"
					bind:value={item.ledger.extraDiscount}
					disabled={!isTodayBill}
				/>
			{/if}
		</div>
		<div class="text-right *:*:nth-[2]:font-bold!">
			{#if item.ledger.netPayable && item.metadata.customer.name}
				<Input
					placeholder="Extra Discount"
					bind:value={item.ledger.extraDiscount}
					disabled={!isTodayBill}
				/>
			{/if}
			{#if item.purchaseCart.subTotal}
				<div>
					<span class="text-sm text-black/60">Total Cart Amount = ₹ </span>
					<span>{formatter.numberWithCommas(item.purchaseCart.subTotal)}</span>
				</div>
				<div>
					<span class="text-sm text-black/60">Discount Cart Amount = ₹ </span>
					<span class="text-red-600">
						- {formatter.numberWithCommas(item.purchaseCart.totalDiscount)}
					</span>
				</div>
				<div>
					<span class="text-sm text-black/60">Final Purchase Cart Amount = ₹ </span>
					<span>{formatter.numberWithCommas(item.purchaseCart.finalAmount)}</span>
				</div>
				{#if item.returnCart.finalAmount}
					<div>
						<span class="text-sm text-black/60">Final Return Cart Amount = ₹ </span>
						<span class="text-red-600">
							- {formatter.numberWithCommas(item.returnCart.finalAmount)}
						</span>
					</div>
				{/if}
				<hr class="ml-auto w-60" />
			{/if}

			{#if item.ledger.advanceAmount}
				<div>
					<span class="text-sm text-black/60"> Claimed Advance Amount = ₹ </span>
					<span class="text-green-600">
						- {formatter.numberWithCommas(item.ledger.advanceAmount)}
					</span>
				</div>
			{/if}
			{#if item.ledger.balanceAmount}
				<div>
					<span class="text-sm text-black/60"> Pending Balance Amount = ₹ </span>
					<span class="text-red-600">
						+ {formatter.numberWithCommas(item.ledger.balanceAmount)}
					</span>
				</div>
			{/if}
			{#if item.ledger.advanceAmount || item.ledger.balanceAmount}
				<hr class="ml-auto w-60" />
			{/if}

			{#if item.ledger.extraDiscount}
				<div>
					<span class="text-sm text-black/60"> Extra Discount = ₹ </span>
					<span class="text-red-600">
						- {formatter.numberWithCommas(item.ledger.extraDiscount)}
						<span class="text-sm">
							({formatter.number(item.purchaseCart.totalDiscount) +
								formatter.number(item.ledger.extraDiscount)})
						</span>
					</span>
				</div>
			{/if}
			<div>
				<span class="text-sm text-black/60"> Net Amount Payable = ₹ </span>
				<span class="text-lg text-blue-600">
					{formatter.numberWithCommas(item.ledger.netPayable)}
				</span>
			</div>
		</div>
	</div>

	{#if item.ledger.netPayable}
		<table class="mb-4 w-full">
			<caption class="border border-b-0 bg-amber-100">Payment Details</caption>
			<thead>
				<tr class="bg-amber-100 *:border *:px-1">
					<th>SN</th>
					<th>Flow Direction</th>
					<th>Payment Mode</th>
					<th>Amount</th>
				</tr>
			</thead>
			<tbody>
				{#each item.ledger.payments as payment, index (index)}
					<tr class="*:border" onkeydown={(e) => handlePaymentRowKey(e, index)}>
						<td class="text-center">{index + 1}</td>
						<td>
							<select
								bind:value={payment.flowDirection}
								onkeydown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										e.stopPropagation();
									}
								}}
								disabled={!isTodayBill}
								class="w-full cursor-pointer rounded-xs outline-blue-700 focus:bg-blue-50 focus:text-blue-700 focus:outline-2"
							>
								<option value={1}>In Flow</option>
								<option value={-1}>Out Flow</option>
							</select>
						</td>
						<td>
							<select
								disabled={!isTodayBill}
								bind:value={payment.paymentMode}
								onkeydown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										e.stopPropagation();
									}
								}}
								class="w-full cursor-pointer rounded-xs outline-blue-700 focus:bg-blue-50 focus:text-blue-700 focus:outline-2"
							>
								<option>Cash</option>
								<option>Gpay</option>
								<option>Credit</option>
							</select>
						</td>
						<td>
							<input
								disabled={!isTodayBill}
								bind:value={payment.amount}
								class="w-full cursor-pointer rounded-xs px-1 outline-blue-700 focus:bg-blue-50 focus:text-blue-700 focus:outline-2"
								type="text"
							/>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}

	<div class="mb-5 flex *:flex-1">
		<div class="text-left">
			{#if item.ledger.pendingAmount !== 0}
				<div
					class="mb-3 ml-auto rounded border-2 border-amber-700 bg-amber-100 px-2 text-sm text-amber-700"
				>
					<span class="text-base">⚠&#xFE0E;</span> Pending Amount must be 0 to save a bill
				</div>
			{/if}
			{#if isCreditExist && !item.metadata.customer.name}
				<div
					class="mb-3 ml-auto rounded border-2 border-amber-700 bg-amber-100 px-2 text-sm text-amber-700"
				>
					<span class="text-base">⚠&#xFE0E;</span> Credit Payment need customer name
				</div>
			{/if}
			{#if item.metadata.customer.name && !/^\d{10}$/.test(item.metadata.customer.phone)}
				<div
					class="mb-3 ml-auto rounded border-2 border-amber-700 bg-amber-100 px-2 text-sm text-amber-700"
				>
					<span class="text-base">⚠&#xFE0E;</span> Phone number is wrong OR missing
				</div>
			{/if}
		</div>
		<div class="text-right">
			{#if item.ledger.totalInflowAmount || item.ledger.totalOutflowAmount}
				<div>
					<span class="text-sm text-black/60">Net Amount Payable = ₹</span>
					<span class="text-blue-600">{formatter.numberWithCommas(item.ledger.netPayable)}</span>
				</div>
				{#if item.ledger.totalInflowAmount}
					<div>
						<span class="text-sm text-black/60">Total Inflow Amount = ₹</span>
						<span class="text-green-600">
							+ {formatter.numberWithCommas(item.ledger.totalInflowAmount)}
						</span>
					</div>
				{/if}
				{#if item.ledger.totalOutflowAmount}
					<div>
						<span class="text-sm text-black/60">Total Outflow Amount = ₹</span>
						<span class="text-red-600">
							- {formatter.numberWithCommas(item.ledger.totalOutflowAmount)}
						</span>
					</div>
				{/if}
				<div>
					<span class="text-sm text-black/60">Pending Amount = ₹ </span>
					<span class="text-lg font-bold! text-violet-500">
						{formatter.numberWithCommas(item.ledger.pendingAmount)}
					</span>
				</div>
			{/if}
		</div>
	</div>

	{#snippet extraButtons()}
		{#if isEligibleToReturn}
			<Button onclick={handleReturnBill}>Create Return Bill</Button>
		{/if}
	{/snippet}
</Form>
