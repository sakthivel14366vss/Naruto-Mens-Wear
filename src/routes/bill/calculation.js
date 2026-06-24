// src/routes/bill/calculation.js
import formatter from '$lib/utils/formatter';

export function reCalculateItem(item) {
	// 1. Process Purchase Cart
	if (item.purchaseCart && item.purchaseCart.lineItems) {
		item.purchaseCart.lineItems = item.purchaseCart.lineItems.map((lineItem) => {
			const currentItem = { ...lineItem };
			currentItem.discountedUnitPrice =
				currentItem.unitPrice * (1 - currentItem.discountPercentage / 100);
			currentItem.grossAmount = currentItem.quantity * currentItem.unitPrice;
			currentItem.netAmount = currentItem.quantity * currentItem.discountedUnitPrice;
			return currentItem;
		});

		item.purchaseCart.subTotal = item.purchaseCart.lineItems.reduce(
			(sum, i) => i.grossAmount + sum,
			0
		);
		item.purchaseCart.finalAmount = item.purchaseCart.lineItems.reduce(
			(sum, i) => i.netAmount + sum,
			0
		);
		item.purchaseCart.totalDiscount = item.purchaseCart.subTotal - item.purchaseCart.finalAmount;
	}

	// 2. Process Return Cart
	if (item.returnCart && item.returnCart.lineItems) {
		item.returnCart.lineItems = item.returnCart.lineItems.map((lineItem) => {
			const currentItem = { ...lineItem };
			currentItem.discountedUnitPrice =
				currentItem.unitPrice * (1 - currentItem.discountPercentage / 100);
			currentItem.grossAmount = currentItem.quantity * currentItem.unitPrice;
			currentItem.netAmount = currentItem.quantity * currentItem.discountedUnitPrice;
			return currentItem;
		});

		item.returnCart.subTotal = item.returnCart.lineItems.reduce((sum, i) => i.grossAmount + sum, 0);
		item.returnCart.finalAmount = item.returnCart.lineItems.reduce(
			(sum, i) => i.netAmount + sum,
			0
		);
		item.returnCart.totalDiscount = item.returnCart.subTotal - item.returnCart.finalAmount;
	}

	// 3. Process Accounting Ledger Engine Calculations
	const purchaseFinal = item.purchaseCart?.finalAmount || 0;
	const returnFinal = item.returnCart?.finalAmount || 0;

	const advanceAmountValue = formatter.number(item.ledger?.advanceAmount || 0);
	const balanceAmountValue = formatter.number(item.ledger?.balanceAmount || 0);
	const extraDiscountValue = formatter.number(item.ledger?.extraDiscount || 0);

	item.ledger.netPayable =
		purchaseFinal + balanceAmountValue - (returnFinal + advanceAmountValue + extraDiscountValue);

	item.ledger.totalInflowAmount = (item.ledger.payments || [])
		.filter((x) => x.flowDirection == 1)
		.reduce((sum, i) => formatter.number(i.amount) + sum, 0);

	item.ledger.totalOutflowAmount = (item.ledger.payments || [])
		.filter((x) => x.flowDirection == -1)
		.reduce((sum, i) => formatter.number(i.amount) + sum, 0);

	item.ledger.pendingAmount =
		item.ledger.netPayable - item.ledger.totalInflowAmount + item.ledger.totalOutflowAmount;
	return item;
}

/**
 * Computes net stock delta changes combining old and new bill states.
 * Reverts old bill impact and applies new bill impact in one step.
 */
export function getStockDeltaSummary(oldBill, newBill) {
	const stockSummary = {};

	// 1. Revert Old Bill (Old Purchase decreases stock -> so revert adds it back. Old Return increases -> so revert removes it)
	if (oldBill) {
		(oldBill.purchaseCart?.lineItems || []).forEach((item) => {
			if (item.barcode)
				stockSummary[item.barcode] = (stockSummary[item.barcode] || 0) + item.quantity;
		});
		(oldBill.returnCart?.lineItems || []).forEach((item) => {
			if (item.barcode)
				stockSummary[item.barcode] = (stockSummary[item.barcode] || 0) - item.quantity;
		});
	}

	// 2. Apply New Bill (New Purchase decreases stock. New Return increases stock)
	if (newBill) {
		(newBill.purchaseCart?.lineItems || []).forEach((item) => {
			if (item.barcode)
				stockSummary[item.barcode] = (stockSummary[item.barcode] || 0) - item.quantity;
		});
		(newBill.returnCart?.lineItems || []).forEach((item) => {
			if (item.barcode)
				stockSummary[item.barcode] = (stockSummary[item.barcode] || 0) + item.quantity;
		});
	}

	return stockSummary;
}

/**
 * Calculates the total net "Credit/Outstanding" value generated *by this specific bill session*.
 * Formula: Credit Inflows (Customer owes more) - Credit Outflows (Store owes customer back)
 */
export function getBillCreditContribution(bill) {
	if (!bill || !bill.ledger || !Array.isArray(bill.ledger.payments)) return 0;

	let totalCreditInflow = 0;
	let totalCreditOutflow = 0;

	bill.ledger.payments.forEach((p) => {
		if (p.paymentMode === 'Credit') {
			const amt = parseFloat(p.amount) || 0;
			if (p.flowDirection === 1) totalCreditInflow += amt;
			else if (p.flowDirection === -1) totalCreditOutflow += amt;
		}
	});

	// Net addition to what customer owes from this transaction
	return totalCreditInflow - totalCreditOutflow;
}
