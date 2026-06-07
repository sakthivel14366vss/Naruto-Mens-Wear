<script>
	import ToastContainer from '$lib/component/ToastContainer.svelte';
	import './layout.css';
	let { children } = $props();
</script>

{@render children()}

<ToastContainer />
