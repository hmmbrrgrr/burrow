// app.svelte.ts — Global app state using Svelte 5 runes

import type { EmberState } from '$lib/types/ember';
import { getTimeOfDay } from '$lib/utils/time';

// Time of day drives the world scene visuals
export const appState = $state({
	timeOfDay: getTimeOfDay() as 'dawn' | 'morning' | 'afternoon' | 'dusk' | 'night',
	isCheckInOpen: false,
	currentEnergy: 3,
	todayEmotions: [] as string[],
	checkedInToday: false,
	emberState: 'idle' as EmberState,
	emberMessage: '',
	daysSinceFirstOpen: 0,
	unlockedFeatures: [] as string[],
});
