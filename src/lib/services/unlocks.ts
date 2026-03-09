// unlocks.ts — Progressive disclosure system
// Features unlock over 30 days to avoid overwhelming ADHD brains on day 1

export interface FeatureUnlock {
	id: string;
	name: string;
	description: string;
	unlockDay: number;
	category: 'location' | 'tool' | 'feature';
	icon: string;
}

export const FEATURE_SCHEDULE: FeatureUnlock[] = [
	// Day 1 (immediate)
	{ id: 'checkin', name: 'Daily Check-In', description: 'How are you today?', unlockDay: 0, category: 'tool', icon: '\u2600\uFE0F' },
	{ id: 'cottage', name: 'The Cottage', description: 'Your cozy home base', unlockDay: 0, category: 'location', icon: '\uD83C\uDFE0' },

	// Day 2
	{ id: 'garden', name: 'The Garden', description: 'Watch things grow', unlockDay: 1, category: 'location', icon: '\uD83C\uDF31' },

	// Day 4
	{ id: 'breathing', name: 'Breathing Exercise', description: 'A moment of calm', unlockDay: 3, category: 'tool', icon: '\uD83C\uDF2C\uFE0F' },
	{ id: 'journal', name: 'The Reading Nook', description: 'A place for your thoughts', unlockDay: 3, category: 'location', icon: '\uD83D\uDCD6' },

	// Day 7
	{ id: 'stickers', name: 'The Marketplace', description: 'Collect and trade', unlockDay: 6, category: 'location', icon: '\u2B50' },
	{ id: 'insights', name: 'The Observatory', description: 'See your patterns', unlockDay: 6, category: 'feature', icon: '\uD83D\uDD2D' },

	// Day 14
	{ id: 'habits', name: 'Habit Garden', description: 'Plant daily seeds', unlockDay: 13, category: 'tool', icon: '\uD83C\uDF3B' },

	// Day 21
	{ id: 'exercises', name: 'The Workshop', description: 'CBT & DBT tools', unlockDay: 20, category: 'location', icon: '\uD83D\uDD28' },

	// Day 30
	{ id: 'inventory', name: 'The Library', description: 'Deep self-reflection', unlockDay: 29, category: 'location', icon: '\uD83D\uDCDA' },
];

const FIRST_OPEN_KEY = 'burrow-first-open';
const SEEN_UNLOCKS_KEY = 'burrow-seen-unlocks';

export function getFirstOpenDate(): Date | null {
	if (typeof localStorage === 'undefined') return null;
	const stored = localStorage.getItem(FIRST_OPEN_KEY);
	return stored ? new Date(stored) : null;
}

export function setFirstOpenDate(): void {
	if (typeof localStorage === 'undefined') return;
	if (!localStorage.getItem(FIRST_OPEN_KEY)) {
		localStorage.setItem(FIRST_OPEN_KEY, new Date().toISOString());
	}
}

export function getDaysSinceFirstOpen(): number {
	const firstOpen = getFirstOpenDate();
	if (!firstOpen) return 0;
	const now = new Date();
	const diffMs = now.getTime() - firstOpen.getTime();
	return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function getUnlockedFeatures(): FeatureUnlock[] {
	const days = getDaysSinceFirstOpen();
	return FEATURE_SCHEDULE.filter((f) => f.unlockDay <= days);
}

export function getNextUnlock(): { feature: FeatureUnlock; daysUntil: number } | null {
	const days = getDaysSinceFirstOpen();
	const locked = FEATURE_SCHEDULE
		.filter((f) => f.unlockDay > days)
		.sort((a, b) => a.unlockDay - b.unlockDay);
	if (locked.length === 0) return null;
	return { feature: locked[0], daysUntil: locked[0].unlockDay - days };
}

export function isUnlocked(featureId: string): boolean {
	const days = getDaysSinceFirstOpen();
	const feature = FEATURE_SCHEDULE.find((f) => f.id === featureId);
	if (!feature) return true; // Unknown features default to unlocked
	return feature.unlockDay <= days;
}

function getSeenUnlockIds(): string[] {
	if (typeof localStorage === 'undefined') return [];
	const stored = localStorage.getItem(SEEN_UNLOCKS_KEY);
	return stored ? JSON.parse(stored) : [];
}

export function getNewUnlocks(): FeatureUnlock[] {
	const unlocked = getUnlockedFeatures();
	const seen = getSeenUnlockIds();
	return unlocked.filter((f) => !seen.includes(f.id));
}

export function markUnlockSeen(featureId: string): void {
	if (typeof localStorage === 'undefined') return;
	const seen = getSeenUnlockIds();
	if (!seen.includes(featureId)) {
		seen.push(featureId);
		localStorage.setItem(SEEN_UNLOCKS_KEY, JSON.stringify(seen));
	}
}
