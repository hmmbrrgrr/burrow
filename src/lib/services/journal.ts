// journal.ts — localStorage-backed journal service

const STORAGE_KEY = 'burrow-journal';

export interface JournalEntry {
	id: string;
	text: string;
	createdAt: string; // ISO date
	mood?: string;
	isVoice: boolean;
}

function generateId(): string {
	return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function loadEntries(): JournalEntry[] {
	if (typeof window === 'undefined') return [];
	const raw = localStorage.getItem(STORAGE_KEY);
	return raw ? JSON.parse(raw) : [];
}

function persist(entries: JournalEntry[]): void {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function saveEntry(entry: Omit<JournalEntry, 'id'>): JournalEntry {
	const entries = loadEntries();
	const newEntry: JournalEntry = { ...entry, id: generateId() };
	entries.unshift(newEntry);
	persist(entries);
	return newEntry;
}

export function getEntries(): JournalEntry[] {
	return loadEntries();
}

export function getEntry(id: string): JournalEntry | null {
	return loadEntries().find((e) => e.id === id) ?? null;
}

export function deleteEntry(id: string): void {
	const entries = loadEntries().filter((e) => e.id !== id);
	persist(entries);
}

export function updateEntry(id: string, text: string): void {
	const entries = loadEntries();
	const entry = entries.find((e) => e.id === id);
	if (entry) {
		entry.text = text;
		persist(entries);
	}
}

// Brain dump uses a separate key
const DUMP_KEY = 'burrow-braindump';

export interface BrainDump {
	id: string;
	text: string;
	createdAt: string;
}

export function saveDump(text: string): BrainDump {
	const dumps = getDumps();
	const dump: BrainDump = { id: generateId(), text, createdAt: new Date().toISOString() };
	dumps.unshift(dump);
	localStorage.setItem(DUMP_KEY, JSON.stringify(dumps));
	return dump;
}

export function getDumps(): BrainDump[] {
	if (typeof window === 'undefined') return [];
	const raw = localStorage.getItem(DUMP_KEY);
	return raw ? JSON.parse(raw) : [];
}

export function deleteDump(id: string): void {
	const dumps = getDumps().filter((d) => d.id !== id);
	localStorage.setItem(DUMP_KEY, JSON.stringify(dumps));
}

// Breathing session tracking
const BREATHING_KEY = 'burrow-breathing';

export interface BreathingSession {
	id: string;
	durationSeconds: number;
	preMood: string;
	postMood: string;
	completedAt: string;
}

export function saveBreathingSession(session: Omit<BreathingSession, 'id'>): void {
	const sessions = getBreathingSessions();
	sessions.unshift({ ...session, id: generateId() });
	localStorage.setItem(BREATHING_KEY, JSON.stringify(sessions));
}

export function getBreathingSessions(): BreathingSession[] {
	if (typeof window === 'undefined') return [];
	const raw = localStorage.getItem(BREATHING_KEY);
	return raw ? JSON.parse(raw) : [];
}
