// time.ts — Time-of-day helpers for driving the world scene

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export function getTimeOfDay(date: Date = new Date()): TimeOfDay {
	const hour = date.getHours();
	if (hour >= 5 && hour < 12) return 'morning';
	if (hour >= 12 && hour < 17) return 'afternoon';
	if (hour >= 17 && hour < 21) return 'evening';
	return 'night';
}
