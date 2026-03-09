// app.svelte.ts — Global app state using Svelte 5 runes

// Time of day drives the world scene visuals
export const appState = $state({
	timeOfDay: 'morning' as 'dawn' | 'morning' | 'afternoon' | 'dusk' | 'night',
	isCheckInOpen: false,
	currentEnergy: 3,
	todayEmotions: [] as string[],
});

// Derived values
// TODO: export derived computations for UI bindings
