// ember-insights.ts — Contextual Ember messages based on check-in patterns, streaks, and journaling
// Never negative. Always encouraging.

import type { CheckInData } from './checkins';
import type { JournalEntry } from './journal';
import type { EmberState } from '$lib/types/ember';

export interface EmberInsight {
	message: string;
	emberState: EmberState;
}

export interface StreakDisplay {
	count: number;
	message: string;
	icon: '🔥';
}

// ─── Insight Message (priority-ordered) ───

export function getEmberInsightMessage(
	checkIns: CheckInData[],
	journalEntries: JournalEntry[],
	streak: number
): EmberInsight | null {
	// Sort check-ins by timestamp descending (most recent first)
	const sorted = [...checkIns].sort(
		(a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
	);

	// 1. Low energy 3 days in a row (highest priority — compassion first)
	if (sorted.length >= 3) {
		const lastThree = sorted.slice(0, 3);
		if (lastThree.every((c) => c.energy === 'low')) {
			return {
				message: 'Hey, be gentle with yourself 💛',
				emberState: 'thinking',
			};
		}
	}

	// 2. Streak milestones (descending so highest milestone wins)
	if (streak >= 30) {
		return {
			message: 'Incredible! 30 days! 🌟',
			emberState: 'celebrating',
		};
	}

	if (streak >= 14) {
		return {
			message: "Two weeks strong! You're amazing! ✨",
			emberState: 'celebrating',
		};
	}

	if (streak >= 7) {
		return {
			message: "A whole week! I'm so proud of you! 🎉",
			emberState: 'celebrating',
		};
	}

	// 3. First journal entry ever
	if (journalEntries.length === 1) {
		return {
			message: "Writing things down helps. I'm glad you're here 📝",
			emberState: 'happy',
		};
	}

	// 4. All habits completed today
	if (sorted.length > 0) {
		const todayCheckIn = sorted[0];
		const todayDate = new Date().toDateString();
		const checkInDate = new Date(todayCheckIn.timestamp).toDateString();

		if (checkInDate === todayDate && todayCheckIn.habits) {
			const habitValues = Object.values(todayCheckIn.habits);
			if (habitValues.length > 0 && habitValues.every(Boolean)) {
				return {
					message: 'Look at you taking care of yourself! 🌿',
					emberState: 'happy',
				};
			}
		}
	}

	// 5. High energy 3 days in a row
	if (sorted.length >= 3) {
		const lastThree = sorted.slice(0, 3);
		if (lastThree.every((c) => c.energy === 'high')) {
			return {
				message: "You've been radiating good energy! 🌞",
				emberState: 'happy',
			};
		}
	}

	return null;
}

// ─── Streak Display (never negative) ───

export function getStreakDisplay(streak: number): StreakDisplay {
	let message: string;

	if (streak >= 30) {
		message = 'Incredible!';
	} else if (streak >= 14) {
		message = 'Two weeks strong!';
	} else if (streak >= 7) {
		message = 'A whole week!';
	} else if (streak >= 3) {
		message = 'On a roll!';
	} else if (streak >= 1) {
		message = 'Getting started!';
	} else {
		// 0 streak — still encouraging, never punishing
		message = 'Ready when you are!';
	}

	return {
		count: streak,
		message,
		icon: '🔥',
	};
}
