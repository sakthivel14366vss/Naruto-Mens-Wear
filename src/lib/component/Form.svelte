<script>
	import { enhance } from '$app/forms';
	import { hash } from '$lib/utils/useHash';
	import Button from './Button.svelte';

	let { children = () => {}, title, isEdit = false, close = () => {}, ...props } = $props();
</script>

{#if $hash.segments.at(-1) == 'form'}
	<div class="absolute inset-0 flex items-center justify-center bg-black/60">
		<form
			class="w-full max-w-xl rounded bg-white p-5"
			action="?/save"
			method="POST"
			autocomplete="off"
			{...props}
			use:enhance
		>
			<div class="mb-4 text-xl">{title}</div>
			{@render children()}
			<div class="flex gap-2">
				<Button type="submit">{isEdit ? 'Update' : 'Create'}</Button>
				<Button color="gray" onclick={close}>Cancel</Button>
			</div>
		</form>
	</div>
{/if}
