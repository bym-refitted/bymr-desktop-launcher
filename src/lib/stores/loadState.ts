import { writable } from 'svelte/store';

export let hasLoaded = writable(false);

export const setLoaded = async () => hasLoaded.set(true);
