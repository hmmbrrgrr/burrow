// ember-responses.ts — Contextual Ember speech bubble messages
// Analyzes check-in data to generate personalized responses

import type { EmberState } from '$lib/types/ember';
import { getCurrentStreak, getEnergyTrend, getCheckInHistory } from '$lib/services/insights';
import { safeGetItem } from '$lib/utils/storage';

const JOURNAL_KEY = 'burrow-journal';

function formatDateStr(d: Date): string {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export interface EmberResponse {
	message: string;
	state: EmberState;
}

function getJournalEntryCount(): number {
	if (typeof window === 'undefined') return 0;
	const raw = safeGetItem(JOURNAL_KEY);
	if (!raw) return 0;
	try {
		const entries: unknown = JSON.parse(raw);
		return Array.isArray(entries) ? entries.length : 0;
	} catch {
		return 0;
	}
}

/** Check if energy has been 'low' for N consecutive recent days */
function hasConsecutiveLowEnergy(days: number): boolean {
	const trend = getEnergyTrend(days);
	// Energy 1 = 'low'; must have checked in (not null) and all be low
	return trend.length >= days && trend.slice(-days).every((e) => e.energy === 1);
}

/**
 * Analyze recent check-in data and return a contextual Ember response.
 * Returns null if no special condition is met (default Ember behavior).
 */
export function getContextualResponse(): EmberResponse | null {
	const { count: streak } = getCurrentStreak();
	const history = getCheckInHistory(30);

	// Priority 1: Low energy for 3+ consecutive days
	if (hasConsecutiveLowEnergy(3)) {
		return { message: 'Hey, be gentle with yourself 💛', state: 'thinking' };
	}

	// Priority 2-4: Milestone streaks
	if (streak === 30) {
		return { message: 'A whole month!! I can\'t believe it! 🎉', state: 'celebrating' };
	}
	if (streak === 14) {
		return { message: 'Two weeks! You\'re amazing! ✨', state: 'celebrating' };
	}
	if (streak === 7) {
		return { message: 'A whole week! I\'m so proud of you!', state: 'celebrating' };
	}

	// Priority 5: First journal entry ever
	if (getJournalEntryCount() === 1) {
		return { message: 'Writing things down helps. I\'m glad you\'re here.', state: 'happy' };
	}

	// Priority 6-7: Today's check-in specifics
	if (history.length > 0) {
		const todayStr = formatDateStr(new Date());
		const todayCheckin = history.find((c) => c.checkedIn && c.date === todayStr);

		if (todayCheckin) {
			if (todayCheckin.energy === 'high') {
				return { message: 'You seem bright today! Love that energy ⚡', state: 'happy' };
			}
			if (todayCheckin.emotions?.includes('grateful')) {
				return { message: 'Gratitude looks good on you 🌸', state: 'happy' };
			}
		}
	}

	// Priority 8: General streak (not milestone)
	if (streak >= 3) {
		return { message: `${streak} days in a row! Keep going!`, state: 'waving' };
	}

	// No special condition — let default Ember behavior handle it
	return null;
}
