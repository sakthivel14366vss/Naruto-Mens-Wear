<script>
	let { children, disabled = false, color = 'blue', type = 'button', ...props } = $props();

	const colorClassList = $state({
		blue: `bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-600 outline-blue-600 active:bg-blue-700
      dark:bg-blue-700 dark:hover:bg-blue-800 dark:focus:bg-blue-800 dark:outline-blue-800 dark:active:bg-blue-900`,
		accent: `bg-amber-500 text-white hover:bg-amber-600 focus:bg-amber-600 outline-amber-600 active:bg-amber-700
      dark:bg-amber-700 dark:hover:bg-amber-800 dark:focus:bg-amber-800 dark:outline-amber-800 dark:active:bg-amber-900`,
		success: `bg-green-500 text-white hover:bg-green-600 focus:bg-green-600 outline-green-600 active:bg-green-700
      dark:bg-green-700 dark:hover:bg-green-800 dark:focus:bg-green-800 dark:outline-green-800 dark:active:bg-green-900`,
		danger: `bg-red-500 text-white hover:bg-red-600 focus:bg-red-600 outline-red-600 active:bg-red-800
      dark:bg-red-700 dark:hover:bg-red-800 dark:focus:bg-red-800 dark:outline-red-800 dark:active:bg-red-900`,
		cyan: `bg-cyan-400 text-white hover:bg-cyan-500 focus:bg-cyan-500 outline-cyan-500 active:bg-cyan-600
      dark:bg-cyan-700 dark:hover:bg-cyan-800 dark:focus:bg-cyan-800 dark:outline-cyan-800 dark:active:bg-cyan-900`,
		fuchsia: `bg-fuchsia-400 text-white hover:bg-fuchsia-500 focus:bg-fuchsia-500 outline-fuchsia-500 active:bg-fuchsia-600
      dark:bg-fuchsia-700 dark:hover:bg-fuchsia-800 dark:focus:bg-fuchsia-800 dark:outline-fuchsia-800 dark:active:bg-fuchsia-900`,
		gray: `bg-gray-400 text-white hover:bg-gray-500 focus:bg-gray-500 outline-gray-500 active:bg-gray-600
      dark:bg-gray-700 dark:hover:bg-gray-800 dark:focus:bg-gray-800 dark:outline-gray-800 dark:active:bg-gray-900`
	});

	const colorClass = $derived(colorClassList[color]);
	const disabledClass = 'cursor-not-allowed bg-gray-500 text-gray-300!';
</script>

<button
	class="inline-flex items-center justify-center rounded px-2 py-1 font-semibold text-white select-none focus:outline-3 focus:outline-offset-2
	{disabled ? disabledClass : colorClass}"
	{type}
	{disabled}
	{...props}
>
	{@render children()}
</button>
