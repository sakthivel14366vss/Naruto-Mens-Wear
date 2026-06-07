import { fail } from '@sveltejs/kit';

export function responseInvalid(message) {
	return fail(400, {
		success: false,
		responseAt: Date.now(),
		message
	});
}

export function responseSuccess(message) {
	return fail(400, {
		success: true,
		responseAt: Date.now(),
		message
	});
}
