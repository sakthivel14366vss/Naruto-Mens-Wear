<script>
	import Table from '$lib/component/Table.svelte';
	import { getFormattedDate, getFormattedTime } from '$lib/utils/dateTime.js';
	import { goto, invalidate } from '$app/navigation';
	import { page } from '$app/state';
	import formatter from '$lib/utils/formatter.js';
	import {
		getDayBounds,
		getWeekBounds,
		getMonthBounds,
		calculateNewReferenceBounds
	} from '$lib/utils/dateFilter';

	const sideInputStyle =
		'rounded border-2 cursor-pointer border-gray-400 px-3 py-1 text-gray-500 outline-none focus:border-blue-600 focus:text-blue-600 hover:border-blue-600 hover:text-blue-600';

	const { data } = $props();

	// Single source of truth pulled directly from the URL params
	let duration = $derived(page.url.searchParams.get('duration') || 'Daily');
	let fromParam = $derived(page.url.searchParams.get('fromDate'));
	let toParam = $derived(page.url.searchParams.get('toDate'));

	let filterPeriod = $derived.by(() => {
		const referenceDate = fromParam ? new Date(Number(fromParam)) : new Date();
		if (duration === 'Weekly') return getWeekBounds(referenceDate);
		if (duration === 'Monthly') return getMonthBounds(referenceDate);
		return getDayBounds(referenceDate);
	});

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

	// 3. Centralized URL Committer
	function updateUrlParams(newParams = {}) {
		const newUrl = new URL(page.url);

		Object.entries(newParams).forEach(([key, value]) => {
			if (value === null || value === undefined) {
				newUrl.searchParams.delete(key);
			} else {
				newUrl.searchParams.set(key, String(value));
			}
		});

		goto(newUrl.toString(), { replaceState: true, keepFocus: true });
	}

	// 4. Interactivity changes calculate boundaries and commit them explicitly
	function handleDurationChange(e) {
		const newDuration = e.target.value;
		// Recalculate bounds for today using the new duration format
		let bounds = getDayBounds(new Date());
		if (newDuration === 'Weekly') bounds = getWeekBounds(new Date());
		if (newDuration === 'Monthly') bounds = getMonthBounds(new Date());

		updateUrlParams({
			duration: newDuration,
			fromDate: bounds.fromDate.getTime(),
			toDate: bounds.toDate.getTime()
		});
	}

	function stepCycle(directionStr) {
		// Convert 'next'/'prev' strings directly into numbers for calculateNewReferenceBounds
		const direction = directionStr === 'next' ? 1 : -1;

		// Calculate new boundary dates relative to the current timeframe
		const targetBounds = calculateNewReferenceBounds(filterPeriod.fromDate, duration, direction);

		updateUrlParams({
			duration: duration,
			fromDate: targetBounds.fromDate.getTime(),
			toDate: targetBounds.toDate.getTime()
		});
	}

	function resetToToday() {
		let bounds = getDayBounds(new Date());
		if (duration === 'Weekly') bounds = getWeekBounds(new Date());
		if (duration === 'Monthly') bounds = getMonthBounds(new Date());

		updateUrlParams({
			duration: duration,
			fromDate: bounds.fromDate.getTime(),
			toDate: bounds.toDate.getTime()
		});
	}
</script>

<div class="flex items-start gap-2">
	<div class="w-fit">
		<div class="flex">
			<Table items={cashPayment} title="Cash Payment" />
			<Table items={gpayPayment} title="Gpay Payment" />
		</div>
	</div>

	<div class="w-60 p-5">
		<div class="mb-3 w-full">
			<select
				class="w-full appearance-none text-center {sideInputStyle}"
				value={duration}
				onchange={handleDurationChange}
			>
				<option>Daily</option>
				<option>Weekly</option>
				<option>Monthly</option>
			</select>
		</div>

		<div class="mb-3 flex w-full items-center gap-3">
			<button class="rotate-180 {sideInputStyle}" onclick={() => stepCycle('prev')}> ➤ </button>
			<button class="flex-1 {sideInputStyle}" onclick={resetToToday}> Current </button>
			<button class={sideInputStyle} onclick={() => stepCycle('next')}> ➤ </button>
		</div>

		{#if duration === 'Daily'}
			<div class="mb-3 flex flex-col gap-2">
				<div class="{sideInputStyle} text-center">{getFormattedDate(filterPeriod.fromDate)}</div>
			</div>
		{:else}
			<div class="mb-3 flex flex-col gap-2">
				<div class="{sideInputStyle} text-center">{getFormattedDate(filterPeriod.fromDate)}</div>
				<div class="-my-2 text-center">to</div>
				<div class="{sideInputStyle} text-center">{getFormattedDate(filterPeriod.toDate)}</div>
			</div>
		{/if}
	</div>
</div>
