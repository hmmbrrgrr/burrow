// habits.ts — Service layer for habit tracking with streaks and weekly views

import { safeGetItem, safeSetItem } from '$lib/utils/storage';

// ─── Types ───

export interface HabitDefinition {
	id: string;
	name: string;
	emoji: string;
	createdAt: string; // ISO date
	isDefault?: boolean;
}

export interface HabitLog {
	habitId: string;
	date: string; // YYYY-MM-DD
	completed: boolean;
}

export interface WeekDot {
	dayLabel: string; // 'Mon', 'Tue', etc.
	date: string; // YYYY-MM-DD
	completed: boolean;
}

// ─── Storage Keys ───

const CUSTOM_HABITS_KEY = 'burrow-custom-habits';
const HABIT_LOGS_KEY = 'burrow-habit-logs';

export const MAX_HABITS = 8;

// ─── Default Habits (matches HabitToggles.svelte) ───

const DEFAULT_HABITS: HabitDefinition[] = [
	{ id: 'medication', name: 'Took medication', emoji: '💊', createdAt: '2024-01-01', isDefault: true },
	{ id: 'exercise', name: 'Exercised', emoji: '🏃', createdAt: '2024-01-01', isDefault: true },
	{ id: 'sleep', name: 'Slept well', emoji: '😴', createdAt: '2024-01-01', isDefault: true },
	{ id: 'no-sugar', name: 'No sugar', emoji: '🚫🍬', createdAt: '2024-01-01', isDefault: true },
	{ id: 'no-alcohol', name: 'No alcohol', emoji: '🚫🍷', createdAt: '2024-01-01', isDefault: true },
];

export function getDefaultHabits(): HabitDefinition[] {
	return DEFAULT_HABITS;
}

// ─── Custom Habits ───

export function getCustomHabits(): HabitDefinition[] {
	const raw = safeGetItem(CUSTOM_HABITS_KEY);
	try {
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

export function saveCustomHabit(habit: Omit<HabitDefinition, 'createdAt'>): HabitDefinition | null {
	if (getAllHabits().length >= MAX_HABITS) return null;
	const customs = getCustomHabits();
	const newHabit: HabitDefinition = {
		...habit,
		createdAt: new Date().toISOString(),
	};
	customs.push(newHabit);
	safeSetItem(CUSTOM_HABITS_KEY, JSON.stringify(customs));
	return newHabit;
}

export function deleteCustomHabit(habitId: string): void {
	const customs = getCustomHabits().filter((h) => h.id !== habitId);
	safeSetItem(CUSTOM_HABITS_KEY, JSON.stringify(customs));
	// Also clean up logs for this habit
	const logs = getAllLogs().filter((l) => l.habitId !== habitId);
	safeSetItem(HABIT_LOGS_KEY, JSON.stringify(logs));
}

export function getAllHabits(): HabitDefinition[] {
	return [...DEFAULT_HABITS, ...getCustomHabits()];
}

// ─── Habit Logs ───

function getAllLogs(): HabitLog[] {
	const raw = safeGetItem(HABIT_LOGS_KEY);
	try {
		return raw ? JSON.parse(raw) : [];
	} catch {
		return [];
	}
}

export function getHabitLogs(habitId: string): HabitLog[] {
	return getAllLogs().filter((l) => l.habitId === habitId);
}

export function logHabit(habitId: string, date: string, completed: boolean): void {
	const logs = getAllLogs();
	const existingIdx = logs.findIndex((l) => l.habitId === habitId && l.date === date);

	if (existingIdx >= 0) {
		if (completed) {
			logs[existingIdx].completed = true;
		} else {
			// Remove the log entry when unchecked
			logs.splice(existingIdx, 1);
		}
	} else if (completed) {
		logs.push({ habitId, date, completed: true });
	}

	safeSetItem(HABIT_LOGS_KEY, JSON.stringify(logs));
}

export function isHabitCompletedOn(habitId: string, date: string): boolean {
	const logs = getAllLogs();
	return logs.some((l) => l.habitId === habitId && l.date === date && l.completed);
}

// ─── Today Helper ───

export function getTodayStr(): string {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ─── Streak Calculation ───

export function getStreak(habitId: string): number {
	const logs = getHabitLogs(habitId).filter((l) => l.completed);
	if (logs.length === 0) return 0;

	// Build a Set of completed dates for O(1) lookup
	const completedDates = new Set(logs.map((l) => l.date));

	const today = getTodayStr();
	let streak = 0;
	let checkDate = new Date();

	// If today isn't completed, start checking from yesterday
	// (don't break the streak just because you haven't logged today yet)
	if (!completedDates.has(today)) {
		checkDate.setDate(checkDate.getDate() - 1);
	}

	// Count consecutive days backwards
	while (true) {
		const dateStr = formatDate(checkDate);
		if (completedDates.has(dateStr)) {
			streak++;
			checkDate.setDate(checkDate.getDate() - 1);
		} else {
			break;
		}
	}

	return streak;
}

// ─── Weekly Dots ───

export function getWeekDots(habitId: string): WeekDot[] {
	const logs = getHabitLogs(habitId).filter((l) => l.completed);
	const completedDates = new Set(logs.map((l) => l.date));

	const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const dots: WeekDot[] = [];

	// Get the Monday of the current week
	const now = new Date();
	const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
	const monday = new Date(now);
	monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7)); // Roll back to Monday

	for (let i = 0; i < 7; i++) {
		const d = new Date(monday);
		d.setDate(monday.getDate() + i);
		const dateStr = formatDate(d);
		dots.push({
			dayLabel: days[d.getDay()],
			date: dateStr,
			completed: completedDates.has(dateStr),
		});
	}

	return dots;
}

// ─── Streak Message (never punish!) ───

export function getStreakMessage(streak: number): string {
	if (streak === 0) return 'Fresh start! 🌱';
	if (streak === 1) return '1 day 🔥';
	if (streak < 7) return `${streak} days 🔥`;
	if (streak < 30) return `${streak} days 🔥🔥`;
	return `${streak} days 🔥🔥🔥`;
}

// ─── Daily / Toggle / Weekly Helpers ───

export function getDailyHabits(date: string): Record<string, boolean> {
	const result: Record<string, boolean> = {};
	for (const habit of getAllHabits()) {
		result[habit.id] = isHabitCompletedOn(habit.id, date);
	}
	return result;
}

export function toggleHabit(habitId: string, date: string): boolean {
	const current = isHabitCompletedOn(habitId, date);
	const newStatus = !current;
	logHabit(habitId, date, newStatus);
	return newStatus;
}

export function getWeeklyCompletion(habitId: string): boolean[] {
	const dots = getWeekDots(habitId);
	return dots.map((d) => d.completed);
}

export function addCustomHabit(name: string, emoji: string): HabitDefinition | null {
	if (getAllHabits().length >= MAX_HABITS) return null;
	const id = `custom-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
	return saveCustomHabit({ id, name, emoji });
}

export function removeCustomHabit(id: string): void {
	deleteCustomHabit(id);
}

export function areAllHabitsCompletedToday(): boolean {
	const today = getTodayStr();
	return getAllHabits().every((h) => isHabitCompletedOn(h.id, today));
}

// ─── Utility ───

function formatDate(d: Date): string {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
