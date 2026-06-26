<script>
	import { tick } from 'svelte';
	import { enhance } from '$app/forms';
	import { hash } from '$lib/utils/useHash';
	import Button from './Button.svelte';

	let {
		children = () => {},
		extraButtons = () => {},
		large = false,
		title,
		isEdit = false,
		disableSubmitButton = false,
		close = () => {},
		...props
	} = $props();

	function trapFocus(node) {
		const selector = `
			a[href],
			area[href],
			input:not([disabled]):not([type="hidden"]),
			select:not([disabled]),
			textarea:not([disabled]),
			button:not([disabled]),
			iframe,
			object,
			embed,
			[contenteditable="true"],
			[tabindex]:not([tabindex="-1"])
		`;

		function getFocusableElements() {
			return [...node.querySelectorAll(selector)].filter((el) => {
				return el.tabIndex !== -1 && !el.hasAttribute('disabled') && el.offsetParent !== null;
			});
		}

		tick().then(() => {
			getFocusableElements()[0]?.focus();
		});

		function handleKeyDown(event) {
			if (event.key !== 'Tab') return;

			const elements = getFocusableElements();

			if (!elements.length) return;

			const first = elements[0];
			const last = elements[elements.length - 1];

			// If focus somehow left the dialog
			if (!node.contains(document.activeElement)) {
				first.focus();
				event.preventDefault();
				return;
			}

			if (event.shiftKey) {
				if (document.activeElement === first) {
					last.focus();
					event.preventDefault();
				}
			} else {
				if (document.activeElement === last) {
					first.focus();
					event.preventDefault();
				}
			}
		}

		node.addEventListener('keydown', handleKeyDown);

		return {
			destroy() {
				node.removeEventListener('keydown', handleKeyDown);
			}
		};
	}
</script>

{#if $hash.segments.at(-1) === 'form'}
	<div class="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
		<form
			class="max-h-[90vh] w-full overflow-auto rounded bg-white p-5 {large
				? 'max-w-3xl'
				: 'max-w-xl'}"
			action="?/save"
			method="POST"
			autocomplete="off"
			use:enhance
			use:trapFocus
			{...props}
		>
			<div class="mb-4 text-xl">{title}</div>

			{@render children()}

			<div class="mt-4 flex gap-2">
				<Button type="submit" isDisabled={disableSubmitButton}>
					{isEdit ? 'Update' : 'Create'}
				</Button>

				<Button type="button" color="gray" onclick={close}>Cancel</Button>

				{@render extraButtons()}
			</div>
		</form>
	</div>
{/if}
