import { writable } from 'svelte/store';

export let hasLoaded = writable(false);
export let currentGameVersion = writable('0.0.0');

export const setLoaded = async () => hasLoaded.set(true);
