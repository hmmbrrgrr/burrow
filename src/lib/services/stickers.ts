// stickers.ts — Service layer for sticker collection & unlocking
// localStorage for now, Supabase integration later

import { getAllHabits, getDailyHabits, getTodayStr as getHabitTodayStr } from './habits';

// ─── Types ───

export type StickerCategory = 'nature' | 'cozy' | 'ember' | 'weather' | 'milestone';

export interface Sticker {
	id: string;
	name: string;
	category: StickerCategory;
	description: string;
	triggerDescription: string;
	emoji: string;
}

interface EarnedSticker {
	id: string;
	earnedAt: string; // ISO date
}

interface StoredCheckin {
	energy: 'low' | 'medium' | 'high';
	emotions: string[];
	habits: Record<string, boolean>;
	timestamp: string; // ISO date
}

interface StoredJournal {
	id: string;
	text: string;
	createdAt: string; // ISO date
	mood?: string;
	isVoice: boolean;
}

interface StoredBreathingSession {
	id: string;
	durationSeconds: number;
	preMood: string;
	postMood: string;
	completedAt: string;
}

// ─── Storage Keys ───

const STICKERS_KEY = 'burrow-stickers-earned';
const CHECKINS_KEY = 'burrow-checkins';
const JOURNAL_KEY = 'burrow-journal';
const BREATHING_KEY = 'burrow-breathing';
const BRAINDUMP_KEY = 'burrow-braindump';

// ─── Sticker Catalog ───

export const STICKER_CATALOG: Sticker[] = [
	// Nature (N1-N6)
	{
		id: 'N1',
		name: 'Daisy',
		category: 'nature',
		description: 'A bright little daisy to mark your first step.',
		triggerDescription: 'Complete your first check-in',
		emoji: '\u{1F33C}'
	},
	{
		id: 'N2',
		name: 'Mushroom',
		category: 'nature',
		description: 'A friendly mushroom sprouting from consistency.',
		triggerDescription: 'Reach a 3-day check-in streak',
		emoji: '\u{1F344}'
	},
	{
		id: 'N3',
		name: 'Acorn',
		category: 'nature',
		description: 'A little acorn full of potential.',
		triggerDescription: 'Complete 3 habits in a single check-in',
		emoji: '\u{1F330}'
	},
	{
		id: 'N4',
		name: 'Sunflower',
		category: 'nature',
		description: 'Bright and early, just like you!',
		triggerDescription: 'Check in during the morning (before noon)',
		emoji: '\u{1F33B}'
	},
	{
		id: 'N5',
		name: 'Fern',
		category: 'nature',
		description: 'Quietly growing, one entry at a time.',
		triggerDescription: 'Write 10 journal entries',
		emoji: '\u{1F33F}'
	},
	{
		id: 'N6',
		name: 'Oak Tree',
		category: 'nature',
		description: 'Deep roots and steady growth.',
		triggerDescription: 'Reach a 30-day check-in streak',
		emoji: '\u{1F333}'
	},
	{
		id: 'N7',
		name: 'Bouquet',
		category: 'nature',
		description: 'Every habit blooming at once — what a day!',
		triggerDescription: 'Complete all habits in a single day for the first time',
		emoji: '\u{1F490}'
	},

	// Cozy (C1-C6)
	{
		id: 'C1',
		name: 'Open Book',
		category: 'cozy',
		description: 'Every story starts with a first page.',
		triggerDescription: 'Write your first journal entry',
		emoji: '\u{1F4D6}'
	},
	{
		id: 'C2',
		name: 'Candle',
		category: 'cozy',
		description: 'A warm glow for winding down.',
		triggerDescription: 'Check in during the evening (after 6 PM)',
		emoji: '\u{1F56F}\uFE0F'
	},
	{
		id: 'C3',
		name: 'Tea Cup',
		category: 'cozy',
		description: 'Take a deep breath and sip slowly.',
		triggerDescription: 'Complete 3 breathing exercises',
		emoji: '\u2615'
	},
	{
		id: 'C4',
		name: 'Blanket',
		category: 'cozy',
		description: 'Cozy weekends are for self-care.',
		triggerDescription: 'Check in on a weekend',
		emoji: '\u{1F9F6}'
	},
	{
		id: 'C5',
		name: 'Cookies',
		category: 'cozy',
		description: 'Five entries \u2014 you deserve a treat!',
		triggerDescription: 'Write 5 journal entries',
		emoji: '\u{1F36A}'
	},
	{
		id: 'C6',
		name: 'Fireplace',
		category: 'cozy',
		description: 'Warmth from showing up again and again.',
		triggerDescription: 'Complete 15 check-ins',
		emoji: '\u{1F525}'
	},

	// Ember (E1-E6)
	{
		id: 'E1',
		name: 'Happy Ember',
		category: 'ember',
		description: 'Ember is beaming with energy!',
		triggerDescription: 'Select high energy in a check-in',
		emoji: '\u{1F60A}'
	},
	{
		id: 'E2',
		name: 'Sleepy Ember',
		category: 'ember',
		description: 'Even Ember needs rest sometimes.',
		triggerDescription: 'Select low energy in a check-in',
		emoji: '\u{1F634}'
	},
	{
		id: 'E3',
		name: 'Dancing Ember',
		category: 'ember',
		description: 'Seven days of showing up \u2014 time to dance!',
		triggerDescription: 'Complete 7 check-ins',
		emoji: '\u{1F483}'
	},
	{
		id: 'E4',
		name: 'Explorer Ember',
		category: 'ember',
		description: 'Ember has tried everything in the toolbox!',
		triggerDescription: 'Try all toolbox exercises (journal, breathing, brain dump)',
		emoji: '\u{1F9ED}'
	},
	{
		id: 'E5',
		name: 'Cozy Ember',
		category: 'ember',
		description: 'Ember loves a peaceful evening.',
		triggerDescription: 'Complete 3 evening check-ins (after 6 PM)',
		emoji: '\u{1F6CB}\uFE0F'
	},
	{
		id: 'E6',
		name: 'Party Ember',
		category: 'ember',
		description: 'All milestones unlocked \u2014 time to celebrate!',
		triggerDescription: 'Unlock all 6 milestone stickers',
		emoji: '\u{1F389}'
	},

	// Weather (W1-W6)
	{
		id: 'W1',
		name: 'Sunshine',
		category: 'weather',
		description: 'Bright days ahead!',
		triggerDescription: 'Log 3 high energy check-ins',
		emoji: '\u2600\uFE0F'
	},
	{
		id: 'W2',
		name: 'Raindrop',
		category: 'weather',
		description: 'Even rain helps things grow.',
		triggerDescription: 'Complete a breathing exercise',
		emoji: '\u{1F4A7}'
	},
	{
		id: 'W3',
		name: 'Cloud',
		category: 'weather',
		description: "It\u2019s okay to feel cloudy sometimes.",
		triggerDescription: 'Write a journal entry about feelings',
		emoji: '\u2601\uFE0F'
	},
	{
		id: 'W4',
		name: 'Rainbow',
		category: 'weather',
		description: 'A whole spectrum of feelings in one week.',
		triggerDescription: 'Check in with 3 different energy levels in one week',
		emoji: '\u{1F308}'
	},
	{
		id: 'W5',
		name: 'Snowflake',
		category: 'weather',
		description: 'A special winter check-in.',
		triggerDescription: 'Check in during a winter month (Dec, Jan, Feb)',
		emoji: '\u2744\uFE0F'
	},
	{
		id: 'W6',
		name: 'Lightning',
		category: 'weather',
		description: 'Five days of pure momentum!',
		triggerDescription: 'Reach a 5-day check-in streak',
		emoji: '\u26A1'
	},

	// Milestone (M1-M6)
	{
		id: 'M1',
		name: 'Golden Star',
		category: 'milestone',
		description: 'Your first big milestone!',
		triggerDescription: 'Complete 5 check-ins',
		emoji: '\u2B50'
	},
	{
		id: 'M2',
		name: 'Compass',
		category: 'milestone',
		description: 'A full week of finding your way.',
		triggerDescription: 'Reach a 7-day check-in streak',
		emoji: '\u{1F9ED}'
	},
	{
		id: 'M3',
		name: 'Trophy',
		category: 'milestone',
		description: 'Twenty check-ins \u2014 a real achievement.',
		triggerDescription: 'Complete 20 check-ins',
		emoji: '\u{1F3C6}'
	},
	{
		id: 'M4',
		name: 'Crown',
		category: 'milestone',
		description: 'Two weeks of consistency. Royalty!',
		triggerDescription: 'Reach a 14-day check-in streak',
		emoji: '\u{1F451}'
	},
	{
		id: 'M5',
		name: 'Diamond',
		category: 'milestone',
		description: 'A gem forged from dedication to nature.',
		triggerDescription: 'Unlock all 6 nature stickers',
		emoji: '\u{1F48E}'
	},
	{
		id: 'M6',
		name: 'Medal',
		category: 'milestone',
		description: 'Twenty-five check-ins. You earned this.',
		triggerDescription: 'Complete 25 check-ins',
		emoji: '\u{1F3C5}'
	}
];

export const CATEGORIES: { label: string; value: StickerCategory | 'all' }[] = [
	{ label: 'All', value: 'all' },
	{ label: 'Nature', value: 'nature' },
	{ label: 'Cozy', value: 'cozy' },
	{ label: 'Ember', value: 'ember' },
	{ label: 'Weather', value: 'weather' },
	{ label: 'Milestone', value: 'milestone' }
];

// ─── Earned Stickers Storage ───

function loadEarned(): EarnedSticker[] {
	if (typeof window === 'undefined') return [];
	const raw = localStorage.getItem(STICKERS_KEY);
	return raw ? JSON.parse(raw) : [];
}

function persistEarned(earned: EarnedSticker[]): void {
	localStorage.setItem(STICKERS_KEY, JSON.stringify(earned));
}

export function getEarnedStickerIds(): string[] {
	return loadEarned().map((e) => e.id);
}

export function isEarned(id: string): boolean {
	return loadEarned().some((e) => e.id === id);
}

export function earnSticker(id: string): void {
	if (isEarned(id)) return;
	const earned = loadEarned();
	earned.push({ id, earnedAt: new Date().toISOString() });
	persistEarned(earned);
}

export function getEarnedCount(): number {
	return loadEarned().length;
}

export function getStickersByCategory(category: string): Sticker[] {
	return STICKER_CATALOG.filter((s) => s.category === category);
}

// ─── Trigger Checking Helpers ───

function loadCheckins(): StoredCheckin[] {
	if (typeof window === 'undefined') return [];
	const raw = localStorage.getItem(CHECKINS_KEY);
	return raw ? JSON.parse(raw) : [];
}

function loadJournalEntries(): StoredJournal[] {
	if (typeof window === 'undefined') return [];
	const raw = localStorage.getItem(JOURNAL_KEY);
	return raw ? JSON.parse(raw) : [];
}

function loadBreathingSessions(): StoredBreathingSession[] {
	if (typeof window === 'undefined') return [];
	const raw = localStorage.getItem(BREATHING_KEY);
	return raw ? JSON.parse(raw) : [];
}

function loadBrainDumps(): { id: string; text: string; createdAt: string }[] {
	if (typeof window === 'undefined') return [];
	const raw = localStorage.getItem(BRAINDUMP_KEY);
	return raw ? JSON.parse(raw) : [];
}

/** Get the start of a day (midnight) for a given date */
function startOfDay(date: Date): number {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/**
 * Calculate the current consecutive-day streak from checkins.
 * Counts backward from today (or yesterday if no check-in today yet).
 */
function calculateStreak(checkins: StoredCheckin[]): number {
	if (checkins.length === 0) return 0;

	const daySet = new Set<number>();
	for (const c of checkins) {
		daySet.add(startOfDay(new Date(c.timestamp)));
	}
	const days = Array.from(daySet).sort((a, b) => b - a);

	const today = startOfDay(new Date());
	const oneDay = 86400000;

	// Streak must include today or yesterday to be current
	if (days[0] < today - oneDay) return 0;

	let streak = 1;
	for (let i = 1; i < days.length; i++) {
		if (days[i - 1] - days[i] === oneDay) {
			streak++;
		} else {
			break;
		}
	}
	return streak;
}

/** Count evening check-ins (after 6 PM local time) */
function countEveningCheckins(checkins: StoredCheckin[]): number {
	return checkins.filter((c) => new Date(c.timestamp).getHours() >= 18).length;
}

/** Check if any checkin has 3+ completed habits */
function hasCheckinWith3Habits(checkins: StoredCheckin[]): boolean {
	return checkins.some((c) => {
		const completed = Object.values(c.habits || {}).filter(Boolean).length;
		return completed >= 3;
	});
}

/** Check if 3 different energy levels were logged within any single calendar week */
function has3EnergiesInOneWeek(checkins: StoredCheckin[]): boolean {
	const weekMap = new Map<string, Set<string>>();
	for (const c of checkins) {
		const d = new Date(c.timestamp);
		const dayOfWeek = d.getDay();
		const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
		const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() + mondayOffset);
		const weekKey = monday.toISOString().slice(0, 10);

		if (!weekMap.has(weekKey)) weekMap.set(weekKey, new Set());
		weekMap.get(weekKey)!.add(c.energy);
	}
	return Array.from(weekMap.values()).some((energies) => energies.size >= 3);
}

// ─── Main Trigger Evaluation ───

/**
 * Check all sticker trigger conditions against current localStorage data.
 * Earns any newly qualified stickers and returns their IDs.
 */
export function checkStickers(): string[] {
	if (typeof window === 'undefined') return [];

	const checkins = loadCheckins();
	const journals = loadJournalEntries();
	const breathing = loadBreathingSessions();
	const brainDumps = loadBrainDumps();
	const earnedIds = new Set(getEarnedStickerIds());
	const newlyEarned: string[] = [];

	const totalCheckins = checkins.length;
	const totalJournals = journals.length;
	const totalBreathing = breathing.length;
	const streak = calculateStreak(checkins);
	const eveningCheckins = countEveningCheckins(checkins);
	const highEnergyCount = checkins.filter((c) => c.energy === 'high').length;

	function tryEarn(id: string, condition: boolean): void {
		if (!earnedIds.has(id) && condition) {
			earnSticker(id);
			earnedIds.add(id);
			newlyEarned.push(id);
		}
	}

	// ── Nature ──
	tryEarn('N1', totalCheckins >= 1);
	tryEarn('N2', streak >= 3);
	tryEarn('N3', hasCheckinWith3Habits(checkins));
	tryEarn('N4', checkins.some((c) => new Date(c.timestamp).getHours() < 12));
	tryEarn('N5', totalJournals >= 10);
	tryEarn('N6', streak >= 30);

	// N7: First time all habits completed in a single day
	{
		const allHabits = getAllHabits();
		if (allHabits.length > 0) {
			const todayHabits = getDailyHabits(getHabitTodayStr());
			const allComplete = Object.values(todayHabits).length > 0 &&
				Object.values(todayHabits).every(Boolean);
			tryEarn('N7', allComplete);
		}
	}

	// ── Cozy ──
	tryEarn('C1', totalJournals >= 1);
	tryEarn('C2', eveningCheckins >= 1);
	tryEarn('C3', totalBreathing >= 3);
	tryEarn(
		'C4',
		checkins.some((c) => {
			const day = new Date(c.timestamp).getDay();
			return day === 0 || day === 6;
		})
	);
	tryEarn('C5', totalJournals >= 5);
	tryEarn('C6', totalCheckins >= 15);

	// ── Ember ──
	tryEarn('E1', checkins.some((c) => c.energy === 'high'));
	tryEarn('E2', checkins.some((c) => c.energy === 'low'));
	tryEarn('E3', totalCheckins >= 7);
	tryEarn('E4', totalJournals >= 1 && totalBreathing >= 1 && brainDumps.length >= 1);
	tryEarn('E5', eveningCheckins >= 3);
	{
		const milestoneIds = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'];
		tryEarn('E6', milestoneIds.every((mid) => earnedIds.has(mid)));
	}

	// ── Weather ──
	tryEarn('W1', highEnergyCount >= 3);
	tryEarn('W2', totalBreathing >= 1);
	tryEarn('W3', journals.some((j) => j.mood != null && j.mood !== ''));
	tryEarn('W4', has3EnergiesInOneWeek(checkins));
	tryEarn(
		'W5',
		checkins.some((c) => {
			const month = new Date(c.timestamp).getMonth();
			return month === 11 || month === 0 || month === 1;
		})
	);
	tryEarn('W6', streak >= 5);

	// ── Milestone ──
	tryEarn('M1', totalCheckins >= 5);
	tryEarn('M2', streak >= 7);
	tryEarn('M3', totalCheckins >= 20);
	tryEarn('M4', streak >= 14);
	{
		const natureIds = ['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7'];
		tryEarn('M5', natureIds.every((nid) => earnedIds.has(nid)));
	}
	tryEarn('M6', totalCheckins >= 25);

	return newlyEarned;
}
