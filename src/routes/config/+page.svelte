<script>
	import { configStore } from '$lib/store/config.store.svelte.js';
</script>

<div class="mx-auto mt-10 w-full max-w-xl rounded-xl border-2 bg-white p-6 shadow-md">
	<h1 class="mb-6 text-center text-2xl font-bold text-gray-800">Configuration</h1>

	<div class="space-y-4">
		{#each Object.entries(configStore.value) as [key, item]}
			<div class="rounded-lg border-2 bg-gray-50 p-4">
				{#if item.type === 'boolean'}
					<div class="flex items-center justify-between">
						<div>
							<div class="text-sm font-semibold text-gray-800">{item.label}</div>
							{#if item.description}
								<div class="text-xs text-gray-500">{item.description}</div>
							{/if}
						</div>
						<label class="relative inline-flex cursor-pointer items-center select-none">
							<input type="checkbox" bind:checked={item.value} class="peer sr-only" />
							<div
								class="h-6 w-11 rounded-full bg-gray-400 transition peer-checked:bg-indigo-600"
							></div>
							<div
								class="absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-5"
							></div>
						</label>
					</div>
				{:else if item.type === 'select'}
					<div class="flex flex-col gap-1.5">
						<label for={key} class="text-sm font-semibold text-gray-800">{item.label}</label>
						<select
							id={key}
							bind:value={item.value}
							class="w-full rounded-md border-2 bg-white p-2 text-sm focus:outline-indigo-500"
						>
							{#each item.options || [] as option}
								<option value={option}>{option}</option>
							{/each}
						</select>

						{#if item.deletable && item.options.length > 1}
							<div class="mt-2 flex flex-wrap gap-1.5">
								{#each item.options as option, index}
									{#if index !== 0}
										<span
											class="inline-flex items-center gap-1.5 rounded bg-gray-200/80 px-2 py-0.5 text-xs font-medium text-gray-700"
										>
											{option}
											<button
												type="button"
												onclick={() => configStore.deleteOption(key, option)}
												class="-mt-1 text-lg font-bold text-gray-500 hover:text-red-600 focus:outline-none"
												title="Delete option"
											>
												&times;
											</button>
										</span>
									{/if}
								{/each}
							</div>
						{/if}
					</div>
				{:else if item.type === 'button'}
					<div class="flex items-center justify-between">
						<div>
							<div class="text-sm font-semibold text-gray-800">{item.label}</div>
							{#if item.description}
								<div class="text-xs text-gray-500">{item.description}</div>
							{/if}
						</div>
						<button
							type="button"
							onclick={item.action}
							class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
						>
							{item.buttonText || 'Execute'}
						</button>
					</div>
				{:else}
					<div class="flex flex-col gap-1.5">
						<label for={key} class="text-sm font-semibold text-gray-800">{item.label}</label>
						<input
							id={key}
							type="text"
							placeholder={item.placeholder || ''}
							bind:value={item.value}
							class="w-full rounded-md border-2 p-2 text-sm focus:outline-indigo-500"
						/>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
