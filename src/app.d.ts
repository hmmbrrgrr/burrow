// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

declare global {
	// Web Speech API types (not yet in standard DOM lib)
	class SpeechRecognition extends EventTarget {
		continuous: boolean;
		interimResults: boolean;
		lang: string;
		onresult: ((event: SpeechRecognitionEvent) => void) | null;
		onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
		onend: (() => void) | null;
		start(): void;
		stop(): void;
		abort(): void;
	}

	class SpeechRecognitionEvent extends Event {
		readonly results: SpeechRecognitionResultList;
		readonly resultIndex: number;
	}

	class SpeechRecognitionErrorEvent extends Event {
		readonly error: string;
		readonly message: string;
	}

	interface Window {
		SpeechRecognition: typeof SpeechRecognition;
		webkitSpeechRecognition: typeof SpeechRecognition;
	}

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
