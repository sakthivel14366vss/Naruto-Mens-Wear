/**
 * Individual payment line-item structure inside the ledger.payments array.
 * Tracks structural cash drawer inflows and outflows split by payment channel.
 */
export const initialPaymentItemState = {
	// 1. TRANSACTION VALUE
	amount: 0.0, // Numeric transaction value (Default to 0.00, never string '')

	// 2. PAYMENT CHANNEL / MODE
	// Standard Modes: 'Cash', 'UPI' (Handles GPay/PhonePe/Paytm), 'Card', or 'StoreCredit'
	amountType: 'Cash',

	// 3. CASH FLOW DIRECTION (Cashier Counter Audit Rule)
	// +1 = INFLOW  : Money received from customer (Increases store cash/bank balance)
	// -1 = OUTFLOW : Money returned to customer as change or return refund balance
	accountType: 1
};

/**
 * Individual row item data structure for both purchaseCart and returnCart line-items.
 */
export const initialCartItemState = {
	// 1. PRODUCT IDENTIFICATION
	barcode: '', // Unique product identifier / SKU (e.g., "PR-0001")
	name: '', // Product title printed on bill (e.g., "Naruto Slim-Fit Shirt")
	category: '', // Analytics categorisation (e.g., "Mens Wear", "Bottoms")

	// 2. QUANTITY
	qty: 1, // Default quantity multiplier initialized to 1

	// 3. PRICING & VALUATION METRICS (Per Single Unit)
	price: 0.0, // Base unit retail sticker price before any deductions
	discountPercentage: 0, // Direct line-item percentage reduction (e.g., 20 for 20%)
	discountedPrice: 0.0, // Calculated: unit price after item discount has been subtracted

	// 4. CUMULATIVE ROW TOTALS
	amount: 0.0, // Calculated Raw Subtotal: qty * price
	discountedAmount: 0.0 // Calculated Real Value: qty * discountedPrice (Pushed directly to Cart finalAmount)
};

/**
 * Global Master Transaction Object.
 * Unified Single Source of Truth for Purchases, Advances, Redemptions, and Exchanges.
 */
export const initialBillState = {
	// 1. ROOT INVOICE META
	billNo: '', // Unique database transaction ID string (e.g., "INV-2026-0001")
	billDayCount: 0, // Daily token index sequence (Resets back to 1 every morning)
	date: '', // ISO Generation date footprint (YYYY-MM-DD)

	// CROSS-BILL RELATIONSHIP HOOKS (Audit Trail Links for Double-Entry Verification)
	advanceAdjustedFromBill: null, // String: ID of the historical Advance Deposit bill being redeemed today
	advanceAdjustedAgainstBill: null, // String: ID of the new checkout bill absorbing an active advance balance
	returnClaimedFromBill: null, // String: ID of the original sales invoice where returned products originated
	returnClaimedAgainstBill: null, // String: ID of the new hybrid bill handling this exchange inflow

	// 2. INVENTORY MOVEMENT CARTS
	purchaseCart: {
		itemList: [], // Dynamic array of initialCartItemState objects leaving the store
		subTotal: 0.0, // Combined base sum of row-level item.amount properties
		itemDiscountTotal: 0.0, // Total currency value cut due to item-level percentage discounts
		extraDiscountAmount: 0.0, // Manual flat cash discount subtracted over the bill at checkout
		finalAmount: 0.0 // Net Purchase Demand: subTotal - itemDiscountTotal - extraDiscountAmount
	},
	returnCart: {
		itemList: [], // Dynamic array of initialCartItemState objects entering back into store stock
		subTotal: 0.0, // Combined original base value of returned elements
		itemDiscountTotal: 0.0, // Combined original historical discount values
		extraDiscountAmount: 0.0, // Flat offset if any historical discount adjustments are made
		finalAmount: 0.0 // Net Return Credit: Total value return asset value balance credited to customer
	},

	// 3. THE LIVE ACCOUNTING ENGINE
	ledger: {
		oldInvoicePending: 0.0, // Unpaid debt / dynamic arrears retrieved from a linked historical invoice
		advanceClaimed: 0.0, // Credit pool extracted from a linked historical advance deposit account

		// CORE INTEGRATED FORMULA PIPELINE:
		// netPayable = (purchaseCart.finalAmount - returnCart.finalAmount) + oldInvoicePending - advanceClaimed
		netPayable: 0.0, // Positive = Customer pays shop. Negative = Shop owes refund/credit.

		payments: [], // Dynamic collection of structural initialPaymentItemState operations
		totalPaid: 0.0, // Runtime dynamic aggregation: Sum of (payment.amount * payment.accountType)

		// FINAL CLOSE-OUT BALANCING METRIC:
		// pendingAmount = netPayable - totalPaid
		pendingAmount: 0.0 // Must equal 0.00 to safely dispatch/print invoice without saving debt
	}
};
