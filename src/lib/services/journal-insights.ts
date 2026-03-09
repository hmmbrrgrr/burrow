// journal-insights.ts — Analyze journal entries for themes and stats

import { getEntries, type JournalEntry } from './journal';

export interface WordTheme {
	word: string;
	count: number;
	size: 'large' | 'medium' | 'small';
}

export interface JournalStats {
	totalEntries: number;
	thisWeekEntries: number;
	longestEntry: number;
}

// ─── Stop Words ───

const STOP_WORDS = new Set([
	'the', 'a', 'an', 'is', 'was', 'i', 'me', 'my', 'we', 'to', 'of',
	'and', 'in', 'it', 'for', 'on', 'with', 'at', 'by', 'this', 'that',
	'from', 'but', 'not', 'or', 'as', 'be', 'have', 'has', 'had', 'do',
	'does', 'did', 'will', 'would', 'could', 'should', 'can', 'are', 'were',
	'been', 'being', 'am', 'its', 'so', 'if', 'then', 'than', 'too', 'very',
	'just', 'about', 'up', 'out', 'no', 'yes', 'all', 'any', 'some', 'how',
	'what', 'when', 'where', 'who', 'which', 'why', 'get', 'got', 'like',
	'also', 'into', 'over', 'such', 'these', 'those', 'them', 'they', 'their',
	'there', 'here', 'more', 'much', 'many', 'own', 'other', 'each', 'our',
	'your', 'you', 'he', 'she', 'him', 'her', 'his', 'its', 'us', 'one',
	'two', 'way', 'may', 'new', 'now', 'old', 'see', 'time', 'well', 'make',
	'thing', 'things', 'know', 'take', 'come', 'been', 'only', 'need',
	'going', 'really', 'still', 'even', 'back', 'after', 'through', 'most',
	'want', 'dont', "don't", 'feel', 'felt', 'lot', 'went', 'day', 'today',
	'im', "i'm", 'ive', "i've", 'ill', "i'll",
]);

// ─── Helpers ───

function getEntriesSince(entries: JournalEntry[], since: Date): JournalEntry[] {
	return entries.filter((e) => new Date(e.createdAt) >= since);
}

function getWeekStart(): Date {
	const now = new Date();
	now.setDate(now.getDate() - 7);
	now.setHours(0, 0, 0, 0);
	return now;
}

function extractWords(text: string): string[] {
	return text
		.toLowerCase()
		.replace(/[^a-z\s'-]/g, ' ')
		.split(/\s+/)
		.filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function assignSize(count: number, maxCount: number): 'large' | 'medium' | 'small' {
	if (maxCount <= 1) return 'medium';
	const ratio = count / maxCount;
	if (ratio >= 0.6) return 'large';
	if (ratio >= 0.3) return 'medium';
	return 'small';
}

// ─── Public API ───

export function getWeeklyThemes(): WordTheme[] {
	const entries = getEntries();
	if (entries.length === 0) return [];

	const weekStart = getWeekStart();
	const weekEntries = getEntriesSince(entries, weekStart);
	if (weekEntries.length === 0) return [];

	// Count word frequencies across all entries this week
	const freq = new Map<string, number>();
	for (const entry of weekEntries) {
		if (!entry.text || entry.text.trim().length === 0) continue;
		const words = extractWords(entry.text);
		for (const word of words) {
			freq.set(word, (freq.get(word) ?? 0) + 1);
		}
	}

	if (freq.size === 0) return [];

	// Sort by frequency, take top 10
	const sorted = Array.from(freq.entries())
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10);

	const maxCount = sorted[0][1];

	return sorted.map(([word, count]) => ({
		word,
		count,
		size: assignSize(count, maxCount),
	}));
}

export function getJournalStats(): JournalStats {
	const entries = getEntries();
	const weekStart = getWeekStart();
	const weekEntries = getEntriesSince(entries, weekStart);

	let longestEntry = 0;
	for (const entry of entries) {
		if (entry.text && entry.text.length > longestEntry) {
			longestEntry = entry.text.length;
		}
	}

	return {
		totalEntries: entries.length,
		thisWeekEntries: weekEntries.length,
		longestEntry,
	};
}
