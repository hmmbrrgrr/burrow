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

/**
 * Reset transient session state to defaults.
 * Call this on component mount to ensure no stale data
 * persists from a previous session or overnight SPA usage.
 */
export function resetSessionState(): void {
	appState.timeOfDay = getTimeOfDay();
	appState.isCheckInOpen = false;
	appState.currentEnergy = 3;
	appState.todayEmotions = [];
	appState.checkedInToday = false;
	appState.emberState = 'idle';
	appState.emberMessage = '';
	appState.daysSinceFirstOpen = 0;
	appState.unlockedFeatures = [];
}
