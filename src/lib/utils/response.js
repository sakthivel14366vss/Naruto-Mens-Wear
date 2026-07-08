import { fail } from '@sveltejs/kit';

export function responseInvalid(message) {
	return fail(400, {
		success: false,
		responseAt: Date.now(),
		message
	});
}

export function responseSuccess(message, data = null) {
	return {
		success: true,
		responseAt: Date.now(),
		message,
		data
	};
}
