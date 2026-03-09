// insights.ts — Data analysis functions for dashboard features
// Pure functions, synchronous localStorage reads, no Svelte imports

// ─── Types ───

interface CheckInRecord {
	energy: 'low' | 'medium' | 'high';
	emotions: string[];
	habits: Record<string, boolean>;
	timestamp: string;
}

interface HabitLogRecord {
	habitId: string;
	date: string;
	completed: boolean;
}

interface HabitDefinitionRecord {
	id: string;
	name: string;
	emoji: string;
	createdAt: string;
	isDefault?: boolean;
}

interface JournalRecord {
	id: string;
	text: string;
	createdAt: string;
	mood?: string;
}

// ─── Storage Keys ───

const CHECKINS_KEY = 'burrow-checkins';
const HABIT_LOGS_KEY = 'burrow-habit-logs';
const JOURNAL_KEY = 'burrow-journal';
const CUSTOM_HABITS_KEY = 'burrow-custom-habits';

// ─── Helpers ───

function formatDate(d: Date): string {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function loadCheckins(): CheckInRecord[] {
	if (typeof window === 'undefined') return [];
	try {
		const raw = localStorage.getItem(CHECKINS_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

function loadHabitLogs(): HabitLogRecord[] {
	if (typeof window === 'undefined') return [];
	try {
		const raw = localStorage.getItem(HABIT_LOGS_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

function loadJournalEntries(): JournalRecord[] {
	if (typeof window === 'undefined') return [];
	try {
		const raw = localStorage.getItem(JOURNAL_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

function getDefaultHabitsLocal(): HabitDefinitionRecord[] {
	return [
		{ id: 'medication', name: 'Took medication', emoji: '💊', createdAt: '2024-01-01', isDefault: true },
		{ id: 'exercise', name: 'Exercised', emoji: '🏃', createdAt: '2024-01-01', isDefault: true },
		{ id: 'sleep', name: 'Slept well', emoji: '😴', createdAt: '2024-01-01', isDefault: true },
		{ id: 'no-sugar', name: 'No sugar', emoji: '🚫🍬', createdAt: '2024-01-01', isDefault: true },
		{ id: 'no-alcohol', name: 'No alcohol', emoji: '🚫🍷', createdAt: '2024-01-01', isDefault: true },
	];
}

function getCustomHabitsLocal(): HabitDefinitionRecord[] {
	if (typeof window === 'undefined') return [];
	try {
		const raw = localStorage.getItem(CUSTOM_HABITS_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

function getAllHabits(): HabitDefinitionRecord[] {
	return [...getDefaultHabitsLocal(), ...getCustomHabitsLocal()];
}

/** Get array of date strings for the last N days (most recent first) */
function getDateRange(days: number): string[] {
	const dates: string[] = [];
	const now = new Date();
	for (let i = 0; i < days; i++) {
		const d = new Date(now);
		d.setDate(now.getDate() - i);
		dates.push(formatDate(d));
	}
	return dates;
}

const ENERGY_MAP: Record<string, number> = { low: 1, medium: 2, high: 3 };

// ─── Exported Functions ───

export function getCheckInHistory(
	days: number
): { date: string; checkedIn: boolean; energy?: 'low' | 'medium' | 'high'; emotions?: string[]; habits?: Record<string, boolean> }[] {
	const checkins = loadCheckins();
	const dateRange = getDateRange(days);

	// Build a map of date → checkin record
	const checkinByDate = new Map<string, CheckInRecord>();
	for (const c of checkins) {
		const dateStr = formatDate(new Date(c.timestamp));
		checkinByDate.set(dateStr, c);
	}

	return dateRange.map((date) => {
		const c = checkinByDate.get(date);
		if (c) {
			return {
				date,
				checkedIn: true,
				energy: c.energy,
				emotions: c.emotions,
				habits: c.habits,
			};
		}
		return { date, checkedIn: false };
	});
}

export function getEnergyTrend(days: number): { date: string; energy: number | null }[] {
	const checkins = loadCheckins();
	const dateRange = getDateRange(days);

	const checkinByDate = new Map<string, CheckInRecord>();
	for (const c of checkins) {
		const dateStr = formatDate(new Date(c.timestamp));
		checkinByDate.set(dateStr, c);
	}

	// Return oldest-first for chart plotting
	return dateRange.reverse().map((date) => {
		const c = checkinByDate.get(date);
		return {
			date,
			energy: c ? (ENERGY_MAP[c.energy] ?? null) : null,
		};
	});
}

export function getCurrentStreak(): { count: number; message: string } {
	const checkins = loadCheckins();
	if (checkins.length === 0) return { count: 0, message: '' };

	// Build set of dates with check-ins
	const checkinDates = new Set<string>();
	for (const c of checkins) {
		checkinDates.add(formatDate(new Date(c.timestamp)));
	}

	const today = formatDate(new Date());
	let count = 0;
	const d = new Date();

	// If today has no check-in, start from yesterday
	if (!checkinDates.has(today)) {
		d.setDate(d.getDate() - 1);
	}

	// Count consecutive days backwards
	while (checkinDates.has(formatDate(d))) {
		count++;
		d.setDate(d.getDate() - 1);
	}

	if (count === 0) return { count: 0, message: '' };

	// Pick the highest matching threshold message
	let message = 'Getting started!';
	if (count >= 30) message = 'Incredible!';
	else if (count >= 14) message = 'Two weeks strong!';
	else if (count >= 7) message = 'A whole week!';
	else if (count >= 3) message = 'On a roll!';

	return { count, message };
}

export function getEmotionSummary(days: number): { emotion: string; count: number }[] {
	const checkins = loadCheckins();
	const dateRange = new Set(getDateRange(days));

	const counts = new Map<string, number>();

	for (const c of checkins) {
		const dateStr = formatDate(new Date(c.timestamp));
		if (!dateRange.has(dateStr)) continue;
		for (const emotion of c.emotions) {
			counts.set(emotion, (counts.get(emotion) || 0) + 1);
		}
	}

	return Array.from(counts.entries())
		.map(([emotion, count]) => ({ emotion, count }))
		.sort((a, b) => b.count - a.count);
}

export function getHabitCompletionRates(days: number): { habitId: string; name: string; emoji: string; rate: number }[] {
	const logs = loadHabitLogs();
	const dateRange = new Set(getDateRange(days));
	const totalDays = dateRange.size;
	if (totalDays === 0) return [];

	const habits = getAllHabits();

	// Count completed days per habit within range
	const completedCounts = new Map<string, number>();
	for (const log of logs) {
		if (log.completed && dateRange.has(log.date)) {
			completedCounts.set(log.habitId, (completedCounts.get(log.habitId) || 0) + 1);
		}
	}

	return habits.map((h) => ({
		habitId: h.id,
		name: h.name,
		emoji: h.emoji,
		rate: Math.round(((completedCounts.get(h.id) || 0) / totalDays) * 100) / 100,
	}));
}

export function getJournalThemes(days: number): { word: string; count: number }[] {
	const entries = loadJournalEntries();
	const dateRange = new Set(getDateRange(days));

	const STOP_WORDS = new Set([
		'the', 'a', 'an', 'is', 'was', 'are', 'were', 'be', 'been', 'being',
		'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
		'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
		'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
		'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
		'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
		'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each',
		'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
		'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
		'just', 'because', 'but', 'and', 'or', 'if', 'while', 'about',
		'up', 'down', 'that', 'this', 'these', 'those', 'it', 'its',
		'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'you', 'your',
		'he', 'him', 'his', 'she', 'her', 'they', 'them', 'their', 'what',
		'which', 'who', 'whom', 'really', 'also', 'still', 'much', 'many',
	]);

	const wordCounts = new Map<string, number>();

	for (const entry of entries) {
		const entryDate = formatDate(new Date(entry.createdAt));
		if (!dateRange.has(entryDate)) continue;

		const words = entry.text
			.toLowerCase()
			.replace(/[^a-z\s]/g, ' ')
			.split(/\s+/)
			.filter((w) => w.length > 2 && !STOP_WORDS.has(w));

		for (const word of words) {
			wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
		}
	}

	return Array.from(wordCounts.entries())
		.map(([word, count]) => ({ word, count }))
		.sort((a, b) => b.count - a.count)
		.slice(0, 10);
}
