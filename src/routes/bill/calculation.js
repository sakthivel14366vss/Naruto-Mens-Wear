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

	// totalDebits = purchaseCart.finalAmount + balanceAmount (historical debt customer is clearing)
	// totalCredits = returnCart.finalAmount + advanceAmount (retained balance offset) + extraDiscount
	// netPayable = totalDebits - totalCredits
	item.ledger.netPayable =
		purchaseFinal + balanceAmountValue - (returnFinal + advanceAmountValue + extraDiscountValue);
	item.ledger.totalInflowAmount = item.ledger.payments
		.filter((x) => x.flowDirection == 1)
		.reduce((sum, i) => formatter.number(i.amount) + sum, 0);
	item.ledger.totalOutflowAmount = item.ledger.payments
		.filter((x) => x.flowDirection == -1)
		.reduce((sum, i) => formatter.number(i.amount) + sum, 0);
	item.ledger.pendingAmount =
		item.ledger.netPayable - item.ledger.totalInflowAmount + item.ledger.totalOutflowAmount;
	return item;
}

/**
 * Calculates the net stock changes from purchase and return carts.
 * * - A negative number means stock leaves the store (Decrease).
 * - A positive number means stock enters the store (Increase).
 * * @param {Object} purchaseCart - The purchase cart containing lineItems
 * @param {Object} returnCart - The return cart containing lineItems
 * @returns {Object} Key-value pairs of barcode to net stock delta changes
 */
export function getStockSummary(purchaseCart, returnCart) {
	const stockSummary = {};

	// 1. Process Purchases (Stock decreases -> Negative Impact)
	const purchaseItems = purchaseCart?.lineItems || [];
	purchaseItems.forEach((item) => {
		if (!item.barcode) return; // Skip if barcode is empty

		stockSummary[item.barcode] = (stockSummary[item.barcode] || 0) - item.quantity;
	});

	// 2. Process Returns (Stock increases -> Positive Impact)
	const returnItems = returnCart?.lineItems || [];
	returnItems.forEach((item) => {
		if (!item.barcode) return; // Skip if barcode is empty

		stockSummary[item.barcode] = (stockSummary[item.barcode] || 0) + item.quantity;
	});

	return stockSummary;
}

/**
 * Calculates the final consolidated outstanding amount for a customer.
 * * MATH RULE:
 * Final Balance = (balanceAmount + totalOutflow) - (advanceAmount + totalInflow)
 * * CRITERIA:
 * Only payments with amountType === 'Credit' are factored into totalInflow/totalOutflow.
 * * SIGN INTERPRETATION:
 * * Positive (+) value = Customer owes the store money (Debit balance)
 * * Negative (-) value = Store owes the customer money (Credit balance / Overpayment)
 * * @param {number} advanceAmount - Previous deposit money paid by customer
 * @param {number} balanceAmount - Historical debt being brought forward
 * @param {Array} payments - Array of payment items containing { amount, flowDirection, amountType }
 * @returns {number} Single outstanding balance rounded to 2 decimal places
 */
export function getOutStanding(advanceAmount, balanceAmount, payments) {
	advanceAmount = formatter.number(advanceAmount);
	balanceAmount = formatter.number(balanceAmount);

	let totalInflow = 0.0;
	let totalOutflow = 0.0;

	if (Array.isArray(payments)) {
		payments.forEach((payment) => {
			if (payment.paymentMode === 'Credit') {
				const amt = parseFloat(payment.amount) || 0.0;
				if (payment.flowDirection === 1) {
					totalInflow += amt;
				} else if (payment.flowDirection === -1) {
					totalOutflow += amt;
				}
			}
		});
	}
	return totalInflow + advanceAmount - (totalOutflow + balanceAmount);
}
