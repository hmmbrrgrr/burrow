// storage.ts — Safe localStorage wrappers
// Private browsing mode and quota exceeded errors can throw

export function safeGetItem(key: string): string | null {
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
}

export function safeSetItem(key: string, value: string): boolean {
	try {
		localStorage.setItem(key, value);
		return true;
	} catch {
		return false;
	}
}

export function safeRemoveItem(key: string): void {
	try {
		localStorage.removeItem(key);
	} catch {}
}
