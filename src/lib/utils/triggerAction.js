// src/lib/utils/triggerAction.js
import { deserialize } from '$app/forms';

export default async function (url, data = {}) {
	const formData = new FormData();

	// Append your data to the FormData object
	Object.entries(data).forEach(([key, value]) => {
		formData.set(key, value);
	});

	// Correct fetch signature: url, then options object
	const response = await fetch(url, {
		method: 'POST',
		body: formData,
		headers: {
			'x-sveltekit-action': 'true' // Lets SvelteKit know it's an action request
		}
	});

	// Properly deserialize the SvelteKit action response
	const result = deserialize(await response.text());
	console.log('Action result:', result);

	return result;
}
