<!-- ThoughtReframe.svelte — Guided thought reframing exercise with Ember -->
<script lang="ts">
	import { appState } from '$lib/stores/app.svelte';

	interface Props {
		open: boolean;
	}

	let { open = $bindable(false) }: Props = $props();

	type Step = 1 | 2 | 3 | 4;

	interface ReframeEntry {
		original: string;
		friendAdvice: string;
		alternative: string;
		timestamp: string;
	}

	const stepConfig = [
		{
			title: "What's on your mind?",
			ember: "Let's look at this together. No rush — just say what's weighing on you.",
			placeholder: 'Write the thought that keeps coming back...',
			emoji: '💭',
		},
		{
			title: 'What would you tell a friend?',
			ember: 'Imagine a friend came to you feeling exactly this way. What would you say to them?',
			placeholder: "You'd probably tell them...",
			emoji: '🤝',
		},
		{
			title: "Let's find another way to see this",
			ember: "What else could be true? Sometimes there's a gentler story hiding underneath.",
			placeholder: 'Another way to look at this might be...',
			emoji: '🌱',
		},
		{
			title: 'Seeing it side by side',
			ember: "Look how far you've come — from that first heavy thought to something lighter.",
			placeholder: '',
			emoji: '✨',
		},
	];

	let currentStep = $state<Step>(1);
	let original = $state('');
	let friendAdvice = $state('');
	let alternative = $state('');
	let completed = $state(false);
	let direction = $state<'forward' | 'back'>('forward');

	let previousEmberState = '';
	let previousEmberMessage = '';

	let canContinue = $derived(
		currentStep === 1 ? original.trim().length > 0 :
		currentStep === 2 ? friendAdvice.trim().length > 0 :
		currentStep === 3 ? alternative.trim().length > 0 :
		true
	);

	function reset() {
		currentStep = 1;
		original = '';
		friendAdvice = '';
		alternative = '';
		completed = false;
		direction = 'forward';
	}

	// Set ember state on open, restore on close
	$effect(() => {
		if (open) {
			reset();
			previousEmberState = appState.emberState;
			previousEmberMessage = appState.emberMessage;
			appState.emberState = 'thinking';
			appState.emberMessage = "Let's work through this together...";
		}

		return () => {
			if (open) {
				appState.emberState = previousEmberState as typeof appState.emberState;
				appState.emberMessage = previousEmberMessage;
			}
		};
	});

	function textForStep(): string {
		if (currentStep === 1) return original;
		if (currentStep === 2) return friendAdvice;
		if (currentStep === 3) return alternative;
		return '';
	}

	function setTextForStep(value: string) {
		if (currentStep === 1) original = value;
		else if (currentStep === 2) friendAdvice = value;
		else if (currentStep === 3) alternative = value;
	}

	function next() {
		if (currentStep < 4 && canContinue) {
			if (currentStep === 3) {
				saveReframe();
			}
			direction = 'forward';
			currentStep = (currentStep + 1) as Step;
		}
	}

	function back() {
		if (currentStep > 1) {
			direction = 'back';
			currentStep = (currentStep - 1) as Step;
			appState.emberState = 'thinking';
		}
	}

	function saveReframe() {
		const entry: ReframeEntry = {
			original: original.trim(),
			friendAdvice: friendAdvice.trim(),
			alternative: alternative.trim(),
			timestamp: new Date().toISOString(),
		};

		try {
			const raw = localStorage.getItem('burrow-reframes');
			const existing: ReframeEntry[] = raw ? JSON.parse(raw) : [];
			const updated = [entry, ...existing].slice(0, 50);
			localStorage.setItem('burrow-reframes', JSON.stringify(updated));
		} catch { /* storage full */ }
	}

	function finish() {
		completed = true;
		appState.emberMessage = "You did something brave just now. I'm proud of you 🔥";
	}

	function close() {
		appState.emberState = 'idle';
		appState.emberMessage = '';
		open = false;
	}
</script>

{#if open}
<div class="reframe-overlay">
	<button class="close-btn" onclick={close} aria-label="Close">✕</button>

	<div class="reframe-content">
		{#if completed}
			<!-- Completion screen -->
			<div class="completion fade-in">
				<span class="completion-emoji">🔥</span>
				<h2 class="completion-title">You did it</h2>
				<p class="completion-body">
					Shifting how we talk to ourselves isn't easy. The fact that you took the time
					to look at this differently? That takes real courage.
				</p>
				<p class="completion-ember">— Ember</p>
				<button class="done-btn" onclick={close}>Back to the Burrow</button>
			</div>
		{:else}
			<!-- Step dots -->
			<div class="step-dots">
				{#each [1, 2, 3, 4] as s}
					<span class="dot" class:active={s === currentStep} class:done={s < currentStep}></span>
				{/each}
			</div>

			<!-- Step card -->
			{#key currentStep}
			<div class="step-card {direction === 'forward' ? 'slide-in-right' : 'slide-in-left'}">
				<span class="step-emoji">{stepConfig[currentStep - 1].emoji}</span>
				<h2 class="step-title">{stepConfig[currentStep - 1].title}</h2>

				<div class="ember-bubble">
					<span class="ember-icon">🔥</span>
					<p class="ember-text">{stepConfig[currentStep - 1].ember}</p>
				</div>

				{#if currentStep <= 3}
					<!-- Input steps -->
					<textarea
						class="thought-input"
						placeholder={stepConfig[currentStep - 1].placeholder}
						rows={4}
						maxlength={500}
						value={textForStep()}
						oninput={(e) => setTextForStep(e.currentTarget.value)}
					></textarea>
				{:else}
					<!-- Step 4: Side-by-side comparison -->
					<div class="comparison">
						<div class="compare-card original-card">
							<span class="compare-label">The thought that was heavy</span>
							<p class="compare-text">{original}</p>
						</div>

						<div class="compare-arrow">↓</div>

						<div class="compare-card friend-card">
							<span class="compare-label">What you'd tell a friend</span>
							<p class="compare-text">{friendAdvice}</p>
						</div>

						<div class="compare-arrow">↓</div>

						<div class="compare-card alternative-card">
							<span class="compare-label">A gentler perspective</span>
							<p class="compare-text">{alternative}</p>
						</div>
					</div>
				{/if}
			</div>
			{/key}

			<!-- Navigation -->
			<div class="nav-row">
				{#if currentStep > 1}
					<button class="nav-btn back-btn" onclick={back}>← Back</button>
				{:else}
					<div></div>
				{/if}

				{#if currentStep < 4}
					<button class="nav-btn next-btn" onclick={next} disabled={!canContinue}>
						Continue →
					</button>
				{:else}
					<button class="nav-btn save-btn" onclick={finish}>
						Save & Finish ✨
					</button>
				{/if}
			</div>
		{/if}
	</div>
</div>
{/if}

<style>
	.reframe-overlay {
		position: fixed;
		inset: 0;
		z-index: 50;
		background: #F5EBD8;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		overflow-y: auto;
	}

	.close-btn {
		position: fixed;
		top: 16px;
		right: 16px;
		z-index: 51;
		background: rgba(92, 77, 60, 0.08);
		border: none;
		border-radius: 50%;
		width: 44px;
		height: 44px;
		font-size: 18px;
		color: #5C4D3C;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.2s ease;
	}
	.close-btn:hover {
		background: rgba(92, 77, 60, 0.14);
	}

	.reframe-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24px;
		padding: 48px 24px 48px;
		max-width: 520px;
		width: 100%;
	}

	/* ─── Step Dots ─── */
	.step-dots {
		display: flex;
		gap: 10px;
		margin-bottom: 8px;
	}
	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: rgba(92, 77, 60, 0.15);
		transition: all 0.3s ease;
	}
	.dot.active {
		background: #E8945A;
		box-shadow: 0 0 8px rgba(232, 148, 90, 0.4);
		transform: scale(1.2);
	}
	.dot.done {
		background: #98BF82;
	}

	/* ─── Step Card ─── */
	.step-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		width: 100%;
		background: rgba(255, 255, 255, 0.5);
		border: 1px solid rgba(92, 77, 60, 0.08);
		border-radius: 24px 20px 22px 18px;
		padding: 32px 24px;
	}

	.step-emoji {
		font-size: 2.4rem;
	}

	.step-title {
		font-size: 1.3rem;
		font-weight: 700;
		color: #5C4D3C;
		text-align: center;
		line-height: 1.3;
	}

	/* ─── Ember Bubble ─── */
	.ember-bubble {
		display: flex;
		gap: 10px;
		align-items: flex-start;
		background: rgba(232, 148, 90, 0.08);
		border: 1px solid rgba(232, 148, 90, 0.15);
		border-radius: 16px 16px 16px 4px;
		padding: 12px 16px;
		width: 100%;
	}
	.ember-icon {
		font-size: 1.1rem;
		flex-shrink: 0;
		margin-top: 1px;
	}
	.ember-text {
		font-size: 0.9rem;
		color: #5C4D3C;
		line-height: 1.5;
		font-style: italic;
	}

	/* ─── Textarea ─── */
	.thought-input {
		width: 100%;
		background: rgba(255, 255, 255, 0.7);
		border: 1.5px solid rgba(92, 77, 60, 0.12);
		border-radius: 16px;
		padding: 14px 16px;
		font-size: 0.95rem;
		font-family: inherit;
		color: #5C4D3C;
		resize: vertical;
		min-height: 100px;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
		line-height: 1.6;
	}
	.thought-input::placeholder {
		color: rgba(92, 77, 60, 0.35);
	}
	.thought-input:focus {
		outline: none;
		border-color: rgba(232, 148, 90, 0.4);
		box-shadow: 0 0 0 3px rgba(232, 148, 90, 0.1);
	}

	/* ─── Comparison (Step 4) ─── */
	.comparison {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		width: 100%;
	}
	.compare-card {
		width: 100%;
		border-radius: 16px 14px 18px 12px;
		padding: 14px 16px;
	}
	.original-card {
		background: rgba(158, 197, 214, 0.12);
		border: 1px solid rgba(158, 197, 214, 0.2);
	}
	.friend-card {
		background: rgba(181, 160, 209, 0.12);
		border: 1px solid rgba(181, 160, 209, 0.2);
	}
	.alternative-card {
		background: rgba(152, 191, 130, 0.12);
		border: 1px solid rgba(152, 191, 130, 0.2);
	}
	.compare-label {
		display: block;
		font-size: 0.72rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin-bottom: 6px;
	}
	.original-card .compare-label { color: #7BA8B8; }
	.friend-card .compare-label { color: #9A85BB; }
	.alternative-card .compare-label { color: #7BA065; }

	.compare-text {
		font-size: 0.9rem;
		color: #5C4D3C;
		line-height: 1.5;
		word-break: break-word;
		margin: 0;
	}
	.compare-arrow {
		font-size: 1rem;
		color: rgba(92, 77, 60, 0.25);
	}

	/* ─── Navigation ─── */
	.nav-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		margin-top: 4px;
	}

	.nav-btn {
		border: none;
		border-radius: 14px;
		padding: 12px 24px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
	}
	.back-btn {
		background: transparent;
		color: #5C4D3C;
	}
	.back-btn:hover {
		background: rgba(92, 77, 60, 0.06);
	}
	.next-btn {
		background: #E8945A;
		color: white;
	}
	.next-btn:hover:not(:disabled) {
		background: #D4824E;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(232, 148, 90, 0.3);
	}
	.next-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.save-btn {
		background: #98BF82;
		color: #3A5A28;
	}
	.save-btn:hover {
		background: #89B071;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(152, 191, 130, 0.3);
	}

	/* ─── Completion ─── */
	.completion {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		text-align: center;
		padding-top: 48px;
	}
	.completion-emoji {
		font-size: 3rem;
	}
	.completion-title {
		font-size: 1.6rem;
		font-weight: 700;
		color: #5C4D3C;
	}
	.completion-body {
		font-size: 1rem;
		color: #5C4D3C;
		line-height: 1.6;
		max-width: 360px;
		opacity: 0.8;
	}
	.completion-ember {
		font-size: 0.85rem;
		color: #E8945A;
		font-style: italic;
		margin-top: 4px;
	}
	.done-btn {
		margin-top: 16px;
		border: none;
		border-radius: 14px;
		padding: 12px 28px;
		font-size: 0.9rem;
		font-weight: 600;
		background: rgba(92, 77, 60, 0.08);
		color: #5C4D3C;
		cursor: pointer;
		font-family: inherit;
		transition: background 0.2s ease;
	}
	.done-btn:hover {
		background: rgba(92, 77, 60, 0.14);
	}

	/* ─── Animations ─── */
	.fade-in {
		animation: fadeIn 0.4s ease-out;
	}
	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(8px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.slide-in-right {
		animation: slideRight 0.35s ease-out;
	}
	@keyframes slideRight {
		from { opacity: 0; transform: translateX(24px); }
		to { opacity: 1; transform: translateX(0); }
	}

	.slide-in-left {
		animation: slideLeft 0.35s ease-out;
	}
	@keyframes slideLeft {
		from { opacity: 0; transform: translateX(-24px); }
		to { opacity: 1; transform: translateX(0); }
	}
</style>
