function createDateFilter({ field = 'createdAt', fromDate = new Date(), toDate = new Date() }) {
	const start = new Date(fromDate);
	start.setHours(0, 0, 0, 0);

	const end = new Date(toDate ?? fromDate);
	end.setHours(23, 59, 59, 999);

	return {
		[field]: {
			$gte: start,
			$lte: end
		}
	};
}
