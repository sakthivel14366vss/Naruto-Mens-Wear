import { getFormattedDate } from '$lib/utils/dateTime';
import { ESCPOSPrinter } from '$lib/utils/escpos';

export function printAdvanceReceipt(data) {
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
		.line('Advance Receipt')
		.microSpace()
		.align('left')
		.pairs('Date', getFormattedDate(data.createdAt))
		.pairs('Description', data.description)
		.pairs('Amount', data.amount)
		.pairsOptional('Phone', data.phone)
		.microSpace()
		.barcode(data.barcode)
		.flushPairs()
		.feed(5)
		.cut();
}
