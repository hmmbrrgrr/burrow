// inventory.ts — localStorage-backed personal inventory service

import { safeGetItem, safeSetItem, safeRemoveItem } from '$lib/utils/storage';

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
	const raw = safeGetItem(SNAPSHOTS_KEY);
	try {
		const parsed: unknown = raw ? JSON.parse(raw) : [];
		return Array.isArray(parsed) ? (parsed as PersonalInventorySnapshot[]) : [];
	} catch {
		return [];
	}
}

function persistSnapshots(snapshots: PersonalInventorySnapshot[]): void {
	safeSetItem(SNAPSHOTS_KEY, JSON.stringify(snapshots));
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
	safeSetItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function getInventoryProgress(): InventoryProgress | null {
	if (typeof window === 'undefined') return null;
	const raw = safeGetItem(PROGRESS_KEY);
	try {
		const parsed: unknown = raw ? JSON.parse(raw) : null;
		if (parsed && typeof parsed === 'object' && 'currentSection' in parsed) {
			return parsed as InventoryProgress;
		}
		return null;
	} catch {
		return null;
	}
}

export function clearInventoryProgress(): void {
	if (typeof window === 'undefined') return;
	safeRemoveItem(PROGRESS_KEY);
}
