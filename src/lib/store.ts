import { writable } from 'svelte/store';

export const activeModTab = writable('installed');
export const selectedGame = writable<{id: string, name: string, slug: string, banner: string} | null>(null);
export const globalMods = writable<any[]>([]);
export const isModsLoading = writable(false);
export const focusedMod = writable<any | null>(null);
export const detailTab = writable('README');
export const modsRequiringUpdate = writable<any[]>([]);
export const profileList = writable<string[]>(['Default']);
export const selectedProfile = writable<string>('Default');