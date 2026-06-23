<script>
	import { goto } from '$app/navigation';

	const menus = [
		{ emoji: '📜', name: 'Bill' },
		{ emoji: '💵', name: 'Payment' },
		{ emoji: '📦', name: 'Stock' },
		{ emoji: '💰', name: 'Outstanding' }
	];

	function handleKeyDown(event) {
		const key = event.key.toUpperCase();
		if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) return;
		switch (key) {
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
		}
	}

	const navigations = {
		Stock: () => goto('/stock'),
		Bill: () => goto('/bill'),
		Payment: () => goto('/payment'),
		Outstanding: () => goto('/outstanding')
	};
</script>

<svelte:window onkeydown={handleKeyDown} />
<div class="mt-20 text-center">
	<h1
		class="bg-linear-to-r from-blue-700 to-orange-700 bg-clip-text text-5xl font-extrabold! text-transparent"
	>
		Naruto Mens Wear
	</h1>
	<div class="mx-auto mt-10 flex w-fit gap-5">
		{#each menus as menu}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="flex w-35 cursor-pointer flex-col gap-3 rounded-lg border-2 bg-linear-to-r from-blue-100 to-red-100 p-3 hover:from-blue-200 hover:to-red-200"
				onclick={() => navigations[menu.name]()}
			>
				<span class="text-4xl">{menu.emoji}</span>
				<span>
					<span class="font-extrabold! underline">{menu.name[0]}</span>{menu.name.slice(1)}
				</span>
				<span class="rounded bg-black/20 p-1 text-sm">Alt + {menu.name[0]}</span>
			</div>
		{/each}
	</div>
</div>
