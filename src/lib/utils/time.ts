// time.ts — Time-of-day helpers for driving the world scene

export type TimeOfDay = 'dawn' | 'morning' | 'afternoon' | 'dusk' | 'night';

export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
	const hour = date.getHours();
	if (hour >= 5 && hour < 7) return 'dawn';
	if (hour >= 7 && hour < 12) return 'morning';
	if (hour >= 12 && hour < 17) return 'afternoon';
	if (hour >= 17 && hour < 20) return 'dusk';
	return 'night';
}
