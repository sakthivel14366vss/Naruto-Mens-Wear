<script>
	import { goto } from '$app/navigation';
	import ToastContainer from '$lib/component/ToastContainer.svelte';
	import './layout.css';
	let { children } = $props();

	function handleKeyDown(event) {
		const key = event.key.toUpperCase();
		const altKey = event.altKey;
		if (altKey) {
			switch (key) {
				case 'H':
					navigations.Home();
					break;
				case 'B':
					navigations.Bill();
					break;
				case 'P':
					navigations.Payment();
					break;
				case 'S':
					navigations.Stock();
					break;
				case 'O':
					navigations.Outstanding();
					break;
				case 'C':
					navigations.Configuration();
					break;
			}
		}
	}

	const navigations = {
		Home: () => goto('/'),
		Stock: () => goto('/stock'),
		Bill: () => goto('/bill'),
		Payment: () => goto('/payment'),
		Outstanding: () => goto('/outstanding'),
		Configuration: () => goto('/config')
	};
</script>

{@render children()}
<svelte:window onkeydown={handleKeyDown} />
<ToastContainer />
