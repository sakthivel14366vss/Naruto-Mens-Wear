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
		calculateNewReferenceDate
	} from '$lib/utils/dateFilter';

	const sideInputStyle =
		'rounded border-2 cursor-pointer border-gray-400 px-3 py-1 text-gray-500 outline-none focus:border-blue-600 focus:text-blue-600 hover:border-blue-600 hover:text-blue-600';

	const { form = null, data } = $props();

	let duration = $derived(page.url.searchParams.get('duration') || 'Daily');
	let refDateStr = $derived(
		page.url.searchParams.get('refDate') || new Date().toISOString().split('T')[0]
	);
	let filterPeriod = $derived.by(() => {
		const referenceDate = new Date(refDateStr);
		if (duration === 'weekly') return getWeekBounds(referenceDate);
		if (duration === 'monthly') return getMonthBounds(referenceDate);
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
		() => {
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
			toastStore.show('Faild to load Bill', 'error');
		}
	}

	// Central function to commit URL adjustments
	function updateUrlParams(newParams) {
		const newUrl = new URL(page.url);

		Object.entries(newParams).forEach(([key, value]) => {
			if (value === null) newUrl.searchParams.delete(key);
			else newUrl.searchParams.set(key, value);
		});

		// Push calculated dates into the URL so your backend (+page.server.js) sees them immediately
		newUrl.searchParams.set('fromDate', filterPeriod.fromDate.getTime());
		newUrl.searchParams.set('toDate', filterPeriod.toDate.getTime());

		// SvelteKit native router update (keeps scrolling intact, avoids full page reload)
		goto(newUrl.toString(), { replaceState: true, keepFocus: true });
	}

	// Interactivity triggers
	function handleDurationChange(e) {
		updateUrlParams({
			duration: e.target.value,
			refDate: new Date().toISOString().split('T')[0] // Reset to today when view changes
		});
	}

	function stepCycle(direction) {
		const nextRefStr = calculateNewReferenceDate(refDateStr, duration, direction);
		updateUrlParams({ refDate: nextRefStr });
	}

	function resetToToday() {
		updateUrlParams({ refDate: new Date().toISOString().split('T')[0] });
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

		{#if filterPeriod.duration == 'Daily'}
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
