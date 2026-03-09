// voice.ts — Web Speech API wrapper for voice input

let recognition: SpeechRecognition | null = null;
let listening = false;

/** Map raw SpeechRecognition error codes to user-friendly messages */
function friendlyError(code: string): string {
	switch (code) {
		case 'not-allowed':
			return 'Microphone access denied. Please allow microphone permissions in your browser settings.';
		case 'no-speech':
			return 'No speech detected. Please try again.';
		case 'audio-capture':
			return 'No microphone found. Please connect a microphone and try again.';
		case 'network':
			return 'Network error during speech recognition. Please check your connection.';
		case 'aborted':
			return 'Speech recognition was cancelled.';
		case 'service-not-allowed':
			return 'Speech recognition service is not allowed. Please check your browser settings.';
		default:
			return `Speech recognition error: ${code}`;
	}
}

export function isSupported(): boolean {
	if (typeof window === 'undefined') return false;
	return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function isListening(): boolean {
	return listening;
}

export function startListening(
	onResult: (text: string) => void,
	onError?: (error: string) => void,
	options?: { continuous?: boolean }
): void {
	if (!isSupported()) {
		onError?.('Speech recognition is not supported in this browser');
		return;
	}

	stopListening();

	const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
	recognition = new SpeechRecognition();
	recognition.continuous = options?.continuous ?? false;
	recognition.interimResults = false;
	recognition.lang = 'en-US';

	recognition.onresult = (event: SpeechRecognitionEvent) => {
		const last = event.results.length - 1;
		const text = event.results[last][0].transcript;
		onResult(text);
	};

	recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
		listening = false;
		onError?.(friendlyError(event.error));
	};

	recognition.onend = () => {
		listening = false;
	};

	try {
		recognition.start();
		listening = true;
	} catch (err) {
		listening = false;
		recognition = null;
		onError?.(err instanceof Error ? err.message : 'Failed to start speech recognition');
	}
}

export function stopListening(): void {
	if (recognition) {
		try {
			recognition.stop();
		} catch (_) {
			// ignore if already stopped
		}
		recognition = null;
	}
	listening = false;
}
