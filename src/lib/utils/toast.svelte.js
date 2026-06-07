// src\lib\utils\toast.svelte.js
let toasts = $state([]);

export const toastStore = {
	get all() {
		return toasts;
	},

	show(message, type = 'success', duration = 3000) {
		const id = crypto.randomUUID();
		toasts.push({ id, message, type });

		setTimeout(() => {
			this.dismiss(id);
		}, duration);
	},

	dismiss(id) {
		toasts = toasts.filter((t) => t.id !== id);
	}
};
