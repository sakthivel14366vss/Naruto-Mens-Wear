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
