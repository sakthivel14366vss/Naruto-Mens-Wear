// src\routes\bill\state.js
/**
 * Individual payment line-item structure inside the ledger.payments array.
 * Tracks cash drawer and digital inflows and outflows split by payment channel.
 */
export const initialPaymentItemState = {
	// 1. TRANSACTION VALUE
	amount: 0.0, // Numeric transaction value (Always a float, never a string)

	// 2. PAYMENT CHANNEL / MODE
	// Allowed values: 'Cash', 'UPI', 'Card', 'StoreCredit'
	paymentMode: 'Cash',

	// 3. CASH FLOW DIRECTION (Cashier Counter Audit Rule)
	//  1 = INFLOW  : Money received from the customer (Increases cash drawer/bank balance)
	// -1 = OUTFLOW : Money returned to the customer (Change given back or cash refund)
	flowDirection: 1
};

/**
 * Individual row item data structure for both purchaseCart and returnCart line items.
 */
export const initialCartItemState = {
	// 1. PRODUCT IDENTIFICATION
	barcode: '', // Unique product identifier / SKU (e.g., "SKU-99234")
	name: '', // Product title printed on the invoice (e.g., "Naruto Slim-Fit Shirt")

	// 2. QUANTITY
	quantity: 1, // Number of units of this specific item

	// 3. PRICING & VALUATION METRICS (Per Single Unit)
	unitPrice: 0.0, // Base retail sticker price before any discounts
	discountPercentage: 0, // Direct line-item percentage reduction (e.g., 20 for 20% off)
	discountedUnitPrice: 0.0, // Calculated: unitPrice * (1 - discountPercentage / 100)

	// 4. CUMULATIVE LINE TOTALS
	grossAmount: 0.0, // Calculated Raw Subtotal: quantity * unitPrice
	netAmount: 0.0 // Calculated Real Value: quantity * discountedUnitPrice
};

/**
 * Global Master Transaction Object.
 * Unified Single Source of Truth for Purchases, Returns, Advances, and Exchange Transactions.
 */
export const initialBillState = {
	// 1. ROOT INVOICE METADATA
	metadata: {
		billNo: '', // Unique database transaction ID string (e.g., "Bill-2026-0001")
		dailySequenceCount: 0, // Daily token index sequence (Resets back to 1 every morning)
		createdDate: '', // ISO Generation date footprint (YYYY-MM-DD)
		referenceBill: '', // Array of linked historical Invoice IDs involved in an exchange/return
		referByBill: '',
		customer: {
			name: '', // Customer name (Default to empty string for walk-in anonymous customers)
			phone: '' // Customer contact number
		}
	},

	// 2. INVENTORY MOVEMENT CARTS
	purchaseCart: {
		lineItems: [], // Dynamic array of initialCartItemState objects leaving the store stock
		subTotal: 0.0, // Combined gross sum of row-level item.grossAmount properties
		totalDiscount: 0.0, // Total currency value cut due to item-level percentage discounts
		finalAmount: 0.0 // Net Purchase Demand: subTotal - totalDiscount - cartDiscountAmount
	},

	returnCart: {
		lineItems: [], // Dynamic array of initialCartItemState objects entering back into store stock
		subTotal: 0.0, // Combined original gross value of returned elements
		totalDiscount: 0.0, // Combined original historical discount values
		finalAmount: 0.0 // Net Return Credit: Total asset value credited back to the customer
	},

	// 3. THE ACCOUNTING & LEDGER ENGINE
	ledger: {
		// FINANCIAL INPUTS (Historical adjustments tracked outside the current carts)
		advanceAmount: 0.0, // Retained deposit money previously paid by customer for this order
		balanceAmount: 0.0, // Historical debt from previous credit purchases being cleared now
		extraDiscount: 0.0, // Additional manual discount applied on the entire bill (e.g., festive offer)

		/**
		 * RUNTIME CALCULATION RULES:
		 * * 1. totalDebits (What the customer owes for this session)
		 * = purchaseCart.finalAmount + previousBalanceDue
		 * * 2. totalCredits (What the store owes/offsets for this session)
		 * = returnCart.finalAmount + previousAdvancePaid
		 * * 3. netPayable (The actual balance settlement required right now)
		 * = totalDebits - totalCredits
		 * Note: A positive value means the customer owes money. A negative value means store owes a refund.
		 */
		netPayable: 0.0,

		// PAYMENTS LOG
		payments: [{ ...initialPaymentItemState }], // Dynamic collection of initialPaymentItemState objects processed right now
		totalInflowAmount: 0.0,
		totalOutflowAmount: 0.0,
		pendingAmount: 0.0
	}
};
