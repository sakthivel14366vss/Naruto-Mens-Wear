import { writable } from 'svelte/store';

export function useHash() {
	const getHashData = () => {
		if (typeof window === 'undefined') {
			return { path: '', segments: [] };
		}

		// Remove the leading '#'
		const path = window.location.hash.replace('#', '');

		// Split by '/' and filter out empty strings (e.g., '#/users//123/' -> ['users', '123'])
		const segments = path.split('/').filter(Boolean);

		return { path, segments };
	};

	// Initialize store with current hash data object
	const { subscribe, set } = writable(getHashData());

	// Update function to handle programmatically setting the hash
	const updateHash = (newHash) => {
		if (typeof window !== 'undefined') {
			let cleanHash = newHash;
			// If passed an array of segments, join them with '/'
			if (Array.isArray(newHash)) {
				cleanHash = newHash.join('/');
			}
			// Clean up leading '#' if present
			if (cleanHash.startsWith('#')) {
				cleanHash = cleanHash.slice(1);
			}
			window.location.hash = cleanHash;
		}
	};

	if (typeof window !== 'undefined') {
		const handleHashChange = () => {
			set(getHashData());
		};

		window.addEventListener('hashchange', handleHashChange);
	}

	return {
		subscribe,
		set: updateHash
	};
}

export const hash = useHash();
