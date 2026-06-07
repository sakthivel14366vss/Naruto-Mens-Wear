// src/lib/utils/formHandler.svelte.js
import { toastStore } from '$lib/utils/toast.svelte.js';
import { hash } from '$lib/utils/useHash.js';
import { untrack } from 'svelte';

/**
 * Handles boilerplate SvelteKit form actions and notifications safely in Svelte 5.
 * @param {Function} formGetter - A function returning the active form prop.
 * @param {Function} [onSuccess] - Optional callback for page-specific operations
 */
export function useFormHandler(formGetter, onSuccess) {
	// Track a simple string or unique property rather than the object instance itself
	let lastProcessedId = $state(null);

	$effect(() => {
		const form = formGetter();

		if (form) {
			// Generate a unique footprint for this form action response
			// If your form responses contain a unique timestamp or ID, use that instead.
			const currentFormId = form.responseAt;

			// Use untrack to safely read your local state without registration loops
			const previousId = untrack(() => lastProcessedId);

			if (currentFormId !== previousId) {
				lastProcessedId = currentFormId; // Lock it down immediately

				if (form.success) {
					toastStore.show(form.message || 'Saved successfully!', 'success');

					// Reset custom route hash if needed safely
					hash.set([]);

					if (onSuccess) {
						onSuccess(form);
					}
				} else {
					toastStore.show(form.message || 'An error occurred', 'error');
				}
			}
		}
	});
}
