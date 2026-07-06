import { configStore } from '$lib/store/config.store.svelte';
import { ESCPOSPrinter } from '$lib/utils/escpos';
import { sendPrintJob } from '$lib/utils/printer.svelte';
import { reCalculateItem } from './calculation';

function getTableData(receipt, item) {
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
		{ name: 'Discount Amount', value: `-${item.purchaseCart.totalDiscount}` }
	];
	if (item.returnCart.lineItems.length || item.ledger?.extraDiscount) {
		purchaseSummaryRow.push({
			name: 'Final Purchase Cart Amount',
			value: item.purchaseCart.finalAmount
		});
	}
	if (item.returnCart.lineItems.length) {
		purchaseSummaryRow.push({
			name: 'Final Return Cart Amount',
			value: `-${item.returnCart.finalAmount}`
		});
	}
	if (item.ledger?.extraDiscount) {
		purchaseSummaryRow.push({
			name: 'Extra Dicount',
			value: `-${item.ledger?.extraDiscount}`
		});
	}
	purchaseSummaryRow.push({
		name: 'Net Amount Payable',
		value: item.ledger?.netPayable
	});
	purchaseSummaryRow.map((v) => ({ ...v, mediator: ':' }));

	// 3. Return Cart
	const returnRows = item.returnCart.lineItems.map(
		({ name, quantity, unitPrice, grossAmount }) => ({
			name,
			quantity,
			unitPrice,
			grossAmount
		})
	);
	returnRows.unshift({
		name: 'Item Name',
		quantity: 'Qty',
		unitPrice: 'Price',
		grossAmount: 'Total'
	});

	// 4. Return Summary
	const returnSummaryRow = [
		{ name: 'Total Return Amount', value: item.returnCart.subTotal },
		{ name: 'Discount Amount', value: `-${item.returnCart.totalDiscount}` },
		{ name: 'Final Return Amount', value: item.returnCart.finalAmount }
	].map((v) => ({ ...v, mediator: ':' }));

	// Construct the Printable Data
	if (item.returnCart.lineItems.length) {
		receipt
			.feed(1)
			.align('center')
			.line('Return Cart')
			.tableBorder(returnRows, cartColumns)
			.align('right')
			.table(returnSummaryRow, summaryColumn);
	}
	receipt
		.feed(1)
		.align('center')
		.line('Purchase Cart')
		.tableBorder(purchaseRows, cartColumns)
		.align('right')
		.table(purchaseSummaryRow, summaryColumn);
}

export function printAmountDetails(item) {
	item = JSON.parse(JSON.stringify(item));
	item = reCalculateItem(item);
	console.log(item.ledger);

	// Printing Logics
	const receipt = new ESCPOSPrinter();
	receipt.reset().align('center').setTextSize(1, 1).line('Amount Details').setTextSize(0, 0);
	getTableData(receipt, item);
	receipt.feed(6).cut();
	const binaryPayload = receipt.getRawBytes();
	sendPrintJob(configStore.value.printer.value, binaryPayload);
}

export function printBill(item) {
	item = JSON.parse(JSON.stringify(item));
	item = reCalculateItem(item);
	console.log(item.ledger);

	// Printing Logics
	const receipt = new ESCPOSPrinter();
	receipt.reset().align('center').setTextSize(1, 1).line('Bill').setTextSize(0, 0);
	getTableData(receipt, item);
	receipt.feed(6).cut();
	const binaryPayload = receipt.getRawBytes();
	sendPrintJob(configStore.value.printer.value, binaryPayload);
}
