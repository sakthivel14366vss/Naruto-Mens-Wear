import { configStore } from '$lib/store/config.store.svelte';
import { ESCPOSPrinter } from '$lib/utils/escpos';
import { sendPrintJob } from '$lib/utils/printer.svelte';
import { reCalculateItem } from './calculation';

export function printBillBeforePayment(item) {
	item = JSON.parse(JSON.stringify(item));
	item = reCalculateItem(item);
	console.log(item.ledger);

	// Define Columns
	// 1. Cart Column
	const cartColumns = [
		{ key: 'name', width: 22, align: 'left' },
		{ key: 'quantity', width: 3, align: 'center' },
		{ key: 'unitPrice', width: 5, align: 'right' },
		{ key: 'grossAmount', width: 5, align: 'right' }
	];
	const summaryColumn = [
		{ key: 'name', width: 25, align: 'right' },
		{ key: 'mediator', width: 1, align: 'center' },
		{ key: 'value', width: 6, align: 'right' }
	];

	// Define Rows
	// 1. Purchase Cart
	const purchaseRows = item.purchaseCart.lineItems.map(
		({ name, quantity, unitPrice, grossAmount }) => ({
			name,
			quantity,
			unitPrice,
			grossAmount
		})
	);
	purchaseRows.unshift({
		name: 'Item Name',
		quantity: 'Qty',
		unitPrice: 'Price',
		grossAmount: 'Total'
	});
	// 2. Purchase Summary
	const purchaseSummaryRow = [
		{ name: 'Total Purchase Amount', value: item.purchaseCart.subTotal },
		{ name: 'Discount Amount', value: `-${item.purchaseCart.totalDiscount}` },
		{ name: 'Final Purchase Amount', value: item.purchaseCart.finalAmount }
	].map((v) => ({ ...v, mediator: ':' }));

	const receipt = new ESCPOSPrinter();
	receipt
		.reset()
		.align('center')
		.setTextSize(1, 1)
		.line('Amount Details')
		.setTextSize(0, 0)

		.tableBorder(purchaseRows, cartColumns)
		.align('right')
		.table(purchaseSummaryRow, summaryColumn)

		.feed(6)
		.cut();
	const binaryPayload = receipt.getRawBytes();
	sendPrintJob(configStore.value.printer.value, binaryPayload);
}
