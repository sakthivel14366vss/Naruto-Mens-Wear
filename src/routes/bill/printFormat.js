import { configStore } from '$lib/store/config.store.svelte';
import { getFormattedTimestamp } from '$lib/utils/dateTime';
import { ESCPOSPrinter } from '$lib/utils/escpos';
import { sendPrintJob } from '$lib/utils/printer.svelte';
import { reCalculateItem } from './calculation';

function getTableData(receipt, item) {
	// Define Columns
	// 1. Cart Column
	const cartColumns = [
		{ key: 'serial', width: 2, align: 'left' },
		{ key: 'name', width: 20, align: 'left' },
		{ key: 'quantity', width: 3, align: 'center' },
		{ key: 'unitPrice', width: 5, align: 'right' },
		{ key: 'discountPercentage', width: 3, align: 'center' },
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
		({ name, quantity, unitPrice, discountPercentage, grossAmount }, index) => ({
			serial: index + 1,
			name,
			quantity,
			unitPrice,
			discountPercentage: `${discountPercentage}%`,
			grossAmount
		})
	);
	purchaseRows.unshift({
		serial: 'Sn',
		name: 'Item Name',
		quantity: 'Qty',
		unitPrice: 'Price',
		discountPercentage: 'Dis %',
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
	purchaseSummaryRow.map((v) => ({ ...v, mediator: ':' }));

	// 3. Return Cart
	const returnRows = item.returnCart.lineItems.map(
		({ name, quantity, unitPrice, discountPercentage, grossAmount }, index) => ({
			serial: index + 1,
			name,
			quantity,
			unitPrice,
			discountPercentage,
			grossAmount
		})
	);
	returnRows.unshift({
		serial: 'Sn',
		name: 'Item Name',
		quantity: 'Qty',
		unitPrice: 'Price',
		discountPercentage: 'Dis %',
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
			.tableLine(returnRows, cartColumns)
			.align('right')
			.table(returnSummaryRow, summaryColumn);
	}
	receipt
		.feed(1)
		.align('center')
		.line('Purchase Cart')
		.tableLine(purchaseRows, cartColumns)
		.align('right')
		.table(purchaseSummaryRow, summaryColumn)
		.setTextSize(1, 1)
		.microSpace()
		.line(`Total: ${item.ledger?.netPayable}`)
		.setTextSize(0, 0);
}

export function printAmountDetails(item) {
	item = JSON.parse(JSON.stringify(item));
	item = reCalculateItem(item);

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

	// Printing Logics
	const receipt = new ESCPOSPrinter();
	receipt
		.reset()
		.align('center')
		.setTextSize(1, 1)
		.bold(true)
		.line('Naruto Mens Wear')
		.bold(false)
		.setTextSize(0, 0)
		.microSpace()
		.line('Khadarpet, Vaniyambadi, Tirupathur 635751')
		.microSpace()
		.bold(true)
		.dual(`Bill No: BL07072605`, getFormattedTimestamp(), 48)
		.bold(false);
	getTableData(receipt, item);
	receipt
		.feed(1)
		.bold(true)
		.setTextSize(1, 0)
		.align('center')
		.line(item.returnCart.lineItems.length ? 'Note: Exchange Claimed' : 'Note: Refund Policy')
		.setTextSize(0, 0)
		.microSpace()
		.line(
			item.returnCart.lineItems.length
				? 'Exchange already claimed. Further refunds or exchanges not allowed.'
				: 'Strictly no refunds. Exchanges allowed within 3 days with original bill.'
		)
		.dashedLine(48)
		.microSpace()
		.setTextSize(1, 0)
		.line('Thank You')
		.bold(false)
		.setTextSize(0, 0)
		.microSpace()
		.line('We were happy with your visit, come again!')
		.microSpace()
		.barcode('BL07072605')
		.line('BL07072605');
	if (item.returnCart.lineItems.length) {
		receipt.microSpace().barcode('BL07072606').line('BL07072606');
	}
	receipt.feed(6).cut();

	const binaryPayload = receipt.getRawBytes();
	sendPrintJob(configStore.value.printer.value, binaryPayload);
}
