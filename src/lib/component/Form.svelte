<script>
	import { enhance } from '$app/forms';
	import { hash } from '$lib/utils/useHash';
	import Button from './Button.svelte';

	let {
		children = () => {},
		large = false,
		title,
		isEdit = false,
		disableSubmitButton = false,
		close = () => {},
		...props
	} = $props();
</script>

{#if $hash.segments.at(-1) == 'form'}
	<div class="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
		<form
			class="max-h-[90vh] w-full overflow-auto rounded bg-white p-5
			{large ? 'max-w-3xl' : 'max-w-xl'}"
			action="?/save"
			method="POST"
			autocomplete="off"
			{...props}
			use:enhance
		>
			<div class="mb-4 text-xl">{title}</div>
			{@render children()}
			<div class="flex gap-2">
				<Button type="submit" isDisabled={disableSubmitButton}>
					{isEdit ? 'Update' : 'Create'}
				</Button>
				<Button color="gray" onclick={close}>Cancel</Button>
			</div>
		</form>
	</div>
{/if}
