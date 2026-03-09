// inventory.ts — localStorage-backed personal inventory service

const SNAPSHOTS_KEY = 'burrow-inventory-snapshots';
const PROGRESS_KEY = 'burrow-inventory-progress';
const MAX_SNAPSHOTS = 50;

// --- Types ---

export type PatternTag = 'relationships' | 'work' | 'health' | 'money' | 'self-talk';

export interface InventoryEntry {
	id: string;
	type: 'resentment' | 'fear' | 'pattern' | 'strength';
	text: string;
	timestamp: number;
}

export interface ResentmentEntry extends InventoryEntry {
	type: 'resentment';
	who?: string;
	whyBothers?: string;
	doDifferently?: string;
}

export interface FearEntry extends InventoryEntry {
	type: 'fear';
	worstCase?: string;
	moreLikely?: string;
}

export interface PatternEntry extends InventoryEntry {
	type: 'pattern';
	tags?: PatternTag[];
}

export interface StrengthEntry extends InventoryEntry {
	type: 'strength';
}

export interface PersonalInventorySnapshot {
	id: string;
	date: number;
	resentments: ResentmentEntry[];
	fears: FearEntry[];
	patterns: PatternEntry[];
	strengths: StrengthEntry[];
	intention: string;
	completed: boolean;
}

export interface InventoryProgress {
	currentSection: number; // 0-4
	snapshot: Partial<PersonalInventorySnapshot>;
	timestamp: number;
}

// --- Helpers ---

function generateId(): string {
	return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function loadSnapshots(): PersonalInventorySnapshot[] {
	if (typeof window === 'undefined') return [];
	try {
		const raw = localStorage.getItem(SNAPSHOTS_KEY);
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

function persistSnapshots(snapshots: PersonalInventorySnapshot[]): void {
	try {
		localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(snapshots));
	} catch {
		// storage full or unavailable — silently fail
	}
}

// --- Snapshot Functions ---

export function saveInventorySnapshot(snapshot: PersonalInventorySnapshot): void {
	const snapshots = loadSnapshots();
	// Ensure the snapshot has an id
	if (!snapshot.id) {
		snapshot.id = generateId();
	}
	snapshots.unshift(snapshot);
	// Keep max 50
	if (snapshots.length > MAX_SNAPSHOTS) {
		snapshots.length = MAX_SNAPSHOTS;
	}
	persistSnapshots(snapshots);
}

export function getInventorySnapshots(): PersonalInventorySnapshot[] {
	return loadSnapshots();
}

export function deleteInventorySnapshot(id: string): void {
	const snapshots = loadSnapshots().filter((s) => s.id !== id);
	persistSnapshots(snapshots);
}

// --- Progress Functions ---

export function saveInventoryProgress(progress: InventoryProgress): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
	} catch {
		// storage full or unavailable
	}
}

export function getInventoryProgress(): InventoryProgress | null {
	if (typeof window === 'undefined') return null;
	try {
		const raw = localStorage.getItem(PROGRESS_KEY);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}

export function clearInventoryProgress(): void {
	if (typeof window === 'undefined') return;
	try {
		localStorage.removeItem(PROGRESS_KEY);
	} catch {
		// silently fail
	}
}
