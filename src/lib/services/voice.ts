// voice.ts — Web Speech API wrapper for voice input

let recognition: any = null;
let listening = false;

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

	recognition.onresult = (event: any) => {
		const last = event.results.length - 1;
		const text = event.results[last][0].transcript;
		onResult(text);
	};

	recognition.onerror = (event: any) => {
		listening = false;
		onError?.(event.error);
	};

	recognition.onend = () => {
		listening = false;
	};

	recognition.start();
	listening = true;
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
