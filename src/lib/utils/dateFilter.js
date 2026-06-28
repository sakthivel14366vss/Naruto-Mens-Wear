export function getDateFilter(fromDate, toDate, field = 'createdAt') {
	// 1. Fallback to "now" if not provided, and handle string/number parsing Safely
	const start = fromDate ? new Date(Number(fromDate)) : new Date();
	const end = toDate ? new Date(Number(toDate)) : new Date();

	// 2. Always normalize boundaries so you don't miss records due to timestamps
	start.setHours(0, 0, 0, 0); // Start of the day
	end.setHours(23, 59, 59, 999); // End of the day

	return {
		[field]: { $gte: start, $lte: end }
	};
}

export function getDayBounds(date = new Date()) {
	const fromDate = new Date(date);
	fromDate.setHours(0, 0, 0, 0);
	const toDate = new Date(date);
	toDate.setHours(23, 59, 59, 999);
	return { fromDate, toDate };
}

export function getWeekBounds(date = new Date()) {
	const fromDate = new Date(date);
	const day = fromDate.getDay();
	// Adjusts to Monday as the start of the week
	const diff = fromDate.getDate() - day + (day === 0 ? -6 : 1);
	fromDate.setDate(diff);
	fromDate.setHours(0, 0, 0, 0);

	const toDate = new Date(fromDate);
	toDate.setDate(fromDate.getDate() + 6);
	toDate.setHours(23, 59, 59, 999);
	return { fromDate, toDate };
}

export function getMonthBounds(date = new Date()) {
	const fromDate = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
	const toDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
	return { fromDate, toDate };
}

/**
 * Calculates the fromDate and toDate for a relative cycle.
 * @param {string|Date} currentRefDateStr - The base reference date
 * @param {string} duration - 'Daily', 'Weekly', or 'Monthly'
 * @param {number} direction - 1 for next cycle, -1 for previous cycle
 * @returns { {fromDate: Date, toDate: Date} }
 */
export function calculateNewReferenceBounds(currentRefDateStr, duration, direction) {
	// 1. Parse the incoming date safely
	const current = currentRefDateStr ? new Date(currentRefDateStr) : new Date();

	// Ensure direction is treated strictly as a number multiplier (e.g., 1 or -1)
	const offset = Number(direction) || 0;

	// 2. Shift the reference date based on duration and direction
	if (duration === 'Weekly') {
		current.setDate(current.getDate() + 7 * offset);
		// 3. Return the calculated bounds for that entire target week
		return getWeekBounds(current);
	}

	if (duration === 'Monthly') {
		current.setMonth(current.getMonth() + offset);
		return getMonthBounds(current);
	}

	// Default to 'Daily'
	current.setDate(current.getDate() + offset);
	return getDayBounds(current);
}
