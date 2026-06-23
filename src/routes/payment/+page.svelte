<script>
	import Table from '$lib/component/Table.svelte';
	import { getFormattedDate, getFormattedTime } from '$lib/utils/dateTime.js';
	import formatter from '$lib/utils/formatter.js';

	const { data } = $props();

	// 1. Destructure directly from the single-pass derived block to avoid redundant reactivity overhead
	const { cash: cashPayment, gpay: gpayPayment } = $derived.by(() => {
		const cash = [];
		const gpay = [];

		let cashBalance = 0;
		let gpayBalance = 0;

		// 2. Cache references to avoid repeated property lookups in the loop
		const formatNumber = formatter.numberWithCommas;
		const payments = data.payments || [];

		for (let i = 0; i < payments.length; i++) {
			const p = payments[i];
			const mode = p.paymentMode;

			// Fast-path exit
			if (mode !== 'Cash' && mode !== 'Gpay') continue;

			const isIncoming = p.flowDirection === 1;
			const change = p.amount * (isIncoming ? 1 : -1);

			// 3. Optimized string concatenation and formatting
			const formattedAmount = `${isIncoming ? '+' : '-'}${formatNumber(p.amount)}`;

			// 4. Pre-construct the shared object shape
			const row = {
				date: getFormattedDate(p.savedAt),
				time: getFormattedTime(p.savedAt),
				referenceBillNo: p.referenceBillNo,
				amount: formattedAmount,
				balance: ''
			};

			if (mode === 'Cash') {
				cashBalance += change;
				row.balance = formatNumber(cashBalance);
				cash.push(row);
			} else {
				gpayBalance += change;
				row.balance = formatNumber(gpayBalance);
				gpay.push(row);
			}
		}

		return { cash, gpay };
	});
</script>

<div class="flex">
	<Table items={cashPayment} title="Cash Payment" />
	<Table items={gpayPayment} title="Gpay Payment" />
</div>
