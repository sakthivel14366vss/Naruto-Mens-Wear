<script>
	import Table from '$lib/component/Table.svelte';
	import { toastStore } from '$lib/utils/toast.svelte.js';
	import { hash } from '$lib/utils/useHash.js';
	import { goto, invalidate } from '$app/navigation';
	import { useFormHandler } from '$lib/utils/formHandler.svelte.js';
	import triggerAction from '$lib/utils/triggerAction.js';
	import BillForm from './BillForm.svelte';
	import { page } from '$app/state';
	import { initialBillState } from './state.js';
	import { getFormattedDate, getFormattedTime } from '$lib/utils/dateTime';
	import formatter from '$lib/utils/formatter';
	import {
		getDayBounds,
		getWeekBounds,
		getMonthBounds,
		calculateNewReferenceBounds
	} from '$lib/utils/dateFilter';
	import { printBill } from './printFormat';

	const sideInputStyle =
		'rounded border-2 cursor-pointer border-gray-400 px-3 py-1 text-gray-500 outline-none focus:border-blue-600 focus:text-blue-600 hover:border-blue-600 hover:text-blue-600';

	const { form = null, data } = $props();

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

	const formattedBill = $derived(
		data.bills.map((b) => ({
			_id: b._id,
			date: getFormattedDate(b.createdAt),
			time: getFormattedTime(b.createdAt),
			billCount: b.metadata.dailySequenceCount,
			billNo: b.metadata.billNo,
			customerName: b.metadata.customer.name,
			netPayable: formatter.numberWithCommas(b.ledger.netPayable),
			exchangeBill: b?.returnCart?.lineItems?.length ? '🟢 Yes' : '🔴 No',
			exchangeClaimed: b.metadata.referByBill ? '🟢 Yes' : '🔴 No'
		}))
	);

	let editableItem = $state(getInitialItem());

	useFormHandler(
		() => form,
		(result) => {
			if (result?.data?._id) printBill(result?.data);
			invalidate('stock');
			handleFormClose();
		}
	);

	function getInitialItem() {
		return structuredClone(initialBillState);
	}

	function onEdit(item) {
		const foundedItem = data.bills.find((b) => b._id === item._id);
		editableItem = structuredClone(foundedItem);
		$hash = ['form'];
	}

	function onCreate() {
		editableItem = getInitialItem();
		$hash = ['form'];
	}

	function handleFormClose() {
		$hash = [''];
		editableItem = getInitialItem();
	}

	function handleKeyDown(event) {
		if (event.key?.toUpperCase() === 'ESCAPE') {
			handleFormClose();
		}
	}

	async function handleBillBarCode(barcode) {
		const result = await triggerAction('?/findBill', { barcode });
		if (result.type == 'success' && result.data) {
			editableItem = result.data;
		} else {
			toastStore.show('Failed to load Bill', 'error');
		}
	}

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

<svelte:window onkeydown={handleKeyDown} />

<div class="flex items-start gap-2">
	<div class="w-fit">
		<Table items={formattedBill} {onCreate} {onEdit} title="Bills" hiddenKeys={['_id']} />
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

{#if $hash.segments.at(-1) === 'form'}
	<BillForm
		bind:item={editableItem}
		{handleFormClose}
		{handleBillBarCode}
		stocks={data.stocks}
		outstandings={data.outstandings}
	/>
{/if}
