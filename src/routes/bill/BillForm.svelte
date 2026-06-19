<script>
	import Combo from '$lib/component/Combo.svelte';
	import Form from '$lib/component/Form.svelte';
	import Input from '$lib/component/Input.svelte';
	import { toastStore } from '$lib/utils/toast.svelte';
	import { hash } from '$lib/utils/useHash.js';

	let { editableItem = $bindable(), handleFormClose, stocks } = $props();
	let purchaseCartFocused = $state(true);

	function handleBarcode({ value }) {
		if (value.startsWith('PR')) {
			const scannedItem = stocks.find((s) => s.barcode === value);
			console.log(scannedItem);
		} else if (value.startsWith('BL')) {
		} else {
			toastStore.show('Unidentified Barcode', 'error');
		}
	}
	function handleSwitchCart() {
		purchaseCartFocused = !purchaseCartFocused;
	}
</script>

<Form close={handleFormClose} title="POS Billing Engine - Create New Bill">
	<!-- Referance Bill Part -->
	{#if editableItem.referenceBill}
		<div class="mb-5 flex items-center justify-between rounded bg-black/20 px-4 py-2">
			<span>
				<span>Exchange Bill Against: </span>
				<span class="font-bold! text-green-700">
					{editableItem.referenceBill}
				</span>
			</span>
			<button
				class="-mt-1 cursor-pointer text-2xl text-red-700"
				onclick={() => (editableItem.referenceBill = '')}
				type="button"
			>
				&times;
			</button>
		</div>
	{/if}

	<!-- Master Barcode Part -->
	<Combo key="barcode" autofocus hotKeys={{ ENTER: handleBarcode, ' ': handleSwitchCart }} />
</Form>
