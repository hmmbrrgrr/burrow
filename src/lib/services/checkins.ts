// checkins.ts — Service layer for checkins functionality
// localStorage for now, Supabase integration later

import { logHabit, getTodayStr } from './habits';

export interface CheckInData {
	energy: 'low' | 'medium' | 'high';
	emotions: string[];
	habits: Record<string, boolean>;
	timestamp: Date;
}

const STORAGE_KEY = 'burrow-checkins';

export function submitCheckin(data: CheckInData): void {
	const checkins = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
	checkins.push({ ...data, timestamp: data.timestamp.toISOString() });
	localStorage.setItem(STORAGE_KEY, JSON.stringify(checkins));

	// Sync habits to the unified habit-logs store
	const today = getTodayStr();
	for (const [habitId, completed] of Object.entries(data.habits)) {
		logHabit(habitId, today, completed);
	}
}

export function getTodayCheckin(): CheckInData | null {
	const checkins = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
	const today = new Date().toDateString();
	const found = checkins.find((c: any) => new Date(c.timestamp).toDateString() === today);
	return found || null;
}

export function getAllCheckIns(): CheckInData[] {
	if (typeof window === 'undefined') return [];
	const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
	return raw.map((c: any) => ({ ...c, timestamp: new Date(c.timestamp) }));
}

export function hasCheckedInToday(): boolean {
	return getTodayCheckin() !== null;
}

export const ENCOURAGING_MESSAGES = [
	'Welcome back! \u{1F33F}',
	"You showed up \u2014 that's what matters \u2728",
	'Ember is happy to see you! \u{1F9E1}',
	'Another day, another check-in \u{1F331}',
	"You're doing great \u{1F49B}",
	'Thanks for checking in with yourself \u{1F343}',
];

export function randomEncouragement(): string {
	return ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)];
}
