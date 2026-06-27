// src\lib\utils\dateFilter.js
export function getDayBounds(date) {
	const fromDate = new Date(date);
	fromDate.setHours(0, 0, 0, 0);
	const toDate = new Date(date);
	toDate.setHours(23, 59, 59, 999);
	return { fromDate, toDate };
}

export function getWeekBounds(date) {
	const fromDate = new Date(date);
	const day = fromDate.getDay();
	const diff = fromDate.getDate() - day + (day === 0 ? -6 : 1);
	fromDate.setDate(diff);
	fromDate.setHours(0, 0, 0, 0);

	const toDate = new Date(fromDate);
	toDate.setDate(fromDate.getDate() + 6);
	toDate.setHours(23, 59, 59, 999);
	return { fromDate, toDate };
}

export function getMonthBounds(date) {
	const fromDate = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
	const toDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
	return { fromDate, toDate };
}

export function calculateNewReferenceDate(currentRefDateStr, duration, direction) {
	const current = currentRefDateStr ? new Date(currentRefDateStr) : new Date();
	const offset = direction === 'next' ? 1 : -1;

	if (duration === 'Weekly') {
		current.setDate(current.getDate() + 7 * offset);
	} else if (duration === 'Monthly') {
		current.setMonth(current.getMonth() + offset);
	} else {
		current.setDate(current.getDate() + offset);
	}
	return current.toISOString().split('T')[0];
}
