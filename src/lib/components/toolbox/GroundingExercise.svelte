<!-- GroundingExercise.svelte — 5-4-3-2-1 senses grounding exercise -->
<script lang="ts">
	import { appState } from '$lib/stores/app.svelte';
	import { startListening, stopListening, isSupported } from '$lib/services/voice';

	interface Props {
		open: boolean;
	}

	let { open = $bindable(false) }: Props = $props();

	interface SenseStep {
		count: number;
		sense: string;
		emoji: string;
		prompt: string;
		emberMessage: string;
	}

	const steps: SenseStep[] = [
		{
			count: 5,
			sense: 'See',
			emoji: '👀',
			prompt: 'Look around — what catches your eye?',
			emberMessage: 'Take your time... what do you notice?',
		},
		{
			count: 4,
			sense: 'Touch',
			emoji: '🤲',
			prompt: 'What textures are nearby? Reach out and feel.',
			emberMessage: 'Ground yourself in what you can feel...',
		},
		{
			count: 3,
			sense: 'Hear',
			emoji: '👂',
			prompt: 'Close your eyes for a moment — what sounds drift in?',
			emberMessage: "Listen gently... there's no rush.",
		},
		{
			count: 2,
			sense: 'Smell',
			emoji: '🌸',
			prompt: 'What scents are floating around you?',
			emberMessage: "Almost there... you're doing great.",
		},
		{
			count: 1,
			sense: 'Taste',
			emoji: '☕',
			prompt: 'What lingers on your tongue right now?',
			emberMessage: "One last sense... you've got this.",
		},
	];

	let currentStepIndex = $state(0);
	let currentItemIndex = $state(0);
	let responses = $state<string[][]>(steps.map((s) => Array(s.count).fill('')));
	let voiceActive = $state(false);
	let voiceSupported = $state(false);
	let transitioning = $state(false);
	let completed = $state(false);

	let previousEmberState = appState.emberState;
	let previousEmberMessage = appState.emberMessage;
	let transitionTimer: ReturnType<typeof setTimeout> | null = null;
	let finishTimer: ReturnType<typeof setTimeout> | null = null;

	let currentStep = $derived(steps[currentStepIndex]);
	let isLastStep = $derived(currentStepIndex === steps.length - 1);
	let isLastItem = $derived(currentItemIndex === currentStep.count - 1);
	let currentResponse = $derived(responses[currentStepIndex][currentItemIndex]);

	// Set ember state on mount
	$effect(() => {
		voiceSupported = isSupported();
		appState.emberState = 'thinking';
		appState.emberMessage = "Let's land here for a moment...";

		return () => {
			appState.emberState = previousEmberState;
			appState.emberMessage = previousEmberMessage;
			if (voiceActive) {
				stopListening();
			}
			if (transitionTimer) { clearTimeout(transitionTimer); transitionTimer = null; }
			if (finishTimer) { clearTimeout(finishTimer); finishTimer = null; }
		};
	});

	// Update ember message when step changes
	$effect(() => {
		if (!completed) {
			appState.emberMessage = steps[currentStepIndex].emberMessage;
		}
	});

	function updateResponse(value: string) {
		responses[currentStepIndex][currentItemIndex] = value;
	}

	function nextItem() {
		if (voiceActive) {
			stopListening();
			voiceActive = false;
		}

		if (isLastItem && isLastStep) {
			finish();
			return;
		}

		transitioning = true;
		transitionTimer = setTimeout(() => {
			if (isLastItem) {
				currentStepIndex++;
				currentItemIndex = 0;
			} else {
				currentItemIndex++;
			}
			transitioning = false;
			transitionTimer = null;
		}, 200);
	}

	function finish() {
		const session = {
			completedAt: new Date().toISOString(),
			responses: steps.map((step, i) => ({
				sense: step.sense,
				items: responses[i].filter((r) => r.trim()),
			})),
		};

		try {
			const existing = JSON.parse(localStorage.getItem('burrow-grounding') || '[]');
			existing.push(session);
			localStorage.setItem('burrow-grounding', JSON.stringify(existing));
		} catch {
			localStorage.setItem('burrow-grounding', JSON.stringify([session]));
		}

		completed = true;
		appState.emberMessage = "You did it. You're right here. 🌿";
		finishTimer = setTimeout(() => {
			close();
			finishTimer = null;
		}, 2000);
	}

	function toggleVoice() {
		if (voiceActive) {
			stopListening();
			voiceActive = false;
		} else {
			startListening(
				(result) => {
					const current = responses[currentStepIndex][currentItemIndex];
					responses[currentStepIndex][currentItemIndex] =
						(current ? current + ' ' : '') + result;
				},
				() => {
					voiceActive = false;
				},
				{ continuous: false }
			);
			voiceActive = true;
		}
	}

	function close() {
		if (voiceActive) {
			stopListening();
			voiceActive = false;
		}
		if (transitionTimer) { clearTimeout(transitionTimer); transitionTimer = null; }
		if (finishTimer) { clearTimeout(finishTimer); finishTimer = null; }
		open = false;
	}
</script>

{#if open}
{#if completed}
	<div class="grounding-overlay">
		<div class="card fade-in">
			<span class="complete-emoji">🌿</span>
			<h2 class="card-title">You're here. You made it.</h2>
			<p class="card-body">
				You just reconnected with right now. Carry this stillness with you.
			</p>
		</div>
	</div>
{:else}
	<div class="grounding-overlay">
		<button class="close-btn" onclick={close} aria-label="Close">✕</button>

		<!-- Progress indicator -->
		<div class="progress-bar">
			{#each steps as step, i}
				<div
					class="progress-step"
					class:active={i === currentStepIndex}
					class:done={i < currentStepIndex}
				>
					<span class="progress-num">{step.count}</span>
				</div>
				{#if i < steps.length - 1}
					<div class="progress-line" class:filled={i < currentStepIndex}></div>
				{/if}
			{/each}
		</div>

		<!-- Step card -->
		<div class="step-card" class:fade-out={transitioning}>
			<div class="step-header">
				<span class="step-count">{currentStep.count - currentItemIndex}</span>
				<span class="step-emoji">{currentStep.emoji}</span>
			</div>

			<p class="step-sense">{currentStep.sense}</p>
			<p class="step-prompt">{currentStep.prompt}</p>

			<!-- Item dots -->
			<div class="item-indicator">
				{#each Array(currentStep.count) as _, i}
					<span
						class="item-dot"
						class:filled={i < currentItemIndex}
						class:current={i === currentItemIndex}
					></span>
				{/each}
			</div>

			<div class="input-area">
				<textarea
					class="response-input"
					value={currentResponse}
					oninput={(e) => updateResponse(e.currentTarget.value)}
					placeholder="What do you notice? (optional)"
					rows={2}
				></textarea>
				<div class="input-actions">
					{#if voiceSupported}
						<button
							class="voice-btn"
							class:active={voiceActive}
							onclick={toggleVoice}
							aria-label="Voice input"
						>
							🎤
						</button>
					{/if}
					<button class="next-btn" onclick={nextItem}>
						{isLastItem && isLastStep ? 'Done' : 'Next'}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
{/if}

<style>
	.grounding-overlay {
		position: fixed;
		inset: 0;
		z-index: 60;
		background: var(--color-parchment, #f5ebd8);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60px 20px 40px;
		overflow-y: auto;
	}

	.close-btn {
		position: fixed;
		top: 16px;
		right: 16px;
		width: 44px;
		height: 44px;
		border: none;
		background: rgba(92, 77, 60, 0.1);
		border-radius: 50%;
		font-size: 1.2rem;
		color: var(--color-earth-brown, #5c4d3c);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 61;
		transition: background 0.2s ease;
	}

	.close-btn:hover {
		background: rgba(92, 77, 60, 0.18);
	}

	/* Progress bar */
	.progress-bar {
		display: flex;
		align-items: center;
		margin-bottom: 40px;
	}

	.progress-step {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: rgba(181, 160, 209, 0.15);
		border: 2px solid rgba(181, 160, 209, 0.25);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
	}

	.progress-step.active {
		background: var(--color-lavender, #b5a0d1);
		border-color: var(--color-lavender, #b5a0d1);
		transform: scale(1.15);
		box-shadow: 0 0 12px rgba(181, 160, 209, 0.4);
	}

	.progress-step.done {
		background: rgba(139, 175, 124, 0.6);
		border-color: rgba(139, 175, 124, 0.8);
	}

	.progress-num {
		font-family: var(--font-serif, 'Fraunces', serif);
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--color-earth-brown, #5c4d3c);
	}

	.progress-step.active .progress-num,
	.progress-step.done .progress-num {
		color: white;
	}

	.progress-line {
		width: 24px;
		height: 2px;
		background: rgba(181, 160, 209, 0.2);
		transition: background 0.3s ease;
	}

	.progress-line.filled {
		background: rgba(139, 175, 124, 0.6);
	}

	/* Step card */
	.step-card {
		max-width: 420px;
		width: 100%;
		text-align: center;
		animation: fade-in 0.35s ease forwards;
	}

	.step-card.fade-out {
		opacity: 0;
		transform: translateY(-8px);
		transition: all 0.2s ease;
	}

	.step-header {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16px;
		margin-bottom: 12px;
	}

	.step-count {
		font-family: var(--font-serif, 'Fraunces', serif);
		font-size: 4rem;
		font-weight: 800;
		color: var(--color-lavender, #b5a0d1);
		line-height: 1;
		opacity: 0.7;
	}

	.step-emoji {
		font-size: 2.5rem;
	}

	.step-sense {
		font-family: var(--font-serif, 'Fraunces', serif);
		font-size: 1.4rem;
		font-weight: 600;
		color: var(--color-earth-brown, #5c4d3c);
		margin: 0 0 8px;
	}

	.step-prompt {
		font-family: var(--font-sans, system-ui, sans-serif);
		font-size: 1rem;
		color: rgba(92, 77, 60, 0.6);
		margin: 0 0 20px;
		line-height: 1.5;
	}

	/* Item dots */
	.item-indicator {
		display: flex;
		justify-content: center;
		gap: 8px;
		margin-bottom: 24px;
	}

	.item-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: rgba(181, 160, 209, 0.15);
		border: 1.5px solid rgba(181, 160, 209, 0.3);
		transition: all 0.3s ease;
	}

	.item-dot.filled {
		background: var(--color-lavender, #b5a0d1);
		border-color: var(--color-lavender, #b5a0d1);
	}

	.item-dot.current {
		border-color: var(--color-lavender, #b5a0d1);
		box-shadow: 0 0 6px rgba(181, 160, 209, 0.5);
		transform: scale(1.25);
	}

	/* Input area */
	.input-area {
		text-align: left;
	}

	.response-input {
		width: 100%;
		padding: 14px 16px;
		border: 2px solid rgba(92, 77, 60, 0.12);
		border-radius: 14px 12px 16px 10px;
		background: rgba(255, 255, 255, 0.5);
		font-family: var(--font-sans, system-ui, sans-serif);
		font-size: 1rem;
		color: var(--color-earth-brown, #5c4d3c);
		resize: none;
		outline: none;
		transition: border-color 0.2s ease;
		box-sizing: border-box;
	}

	.response-input:focus {
		border-color: var(--color-lavender, #b5a0d1);
	}

	.response-input::placeholder {
		color: rgba(92, 77, 60, 0.35);
	}

	.input-actions {
		display: flex;
		gap: 8px;
		margin-top: 12px;
		justify-content: flex-end;
	}

	.voice-btn {
		width: 44px;
		height: 44px;
		border: 2px solid rgba(92, 77, 60, 0.15);
		background: rgba(255, 255, 255, 0.5);
		border-radius: 50%;
		font-size: 1.2rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.voice-btn.active {
		background: var(--color-lavender, #b5a0d1);
		border-color: var(--color-lavender, #b5a0d1);
		animation: pulse-mic 1.5s ease-in-out infinite;
	}

	@keyframes pulse-mic {
		0%,
		100% {
			box-shadow: 0 0 0 0 rgba(181, 160, 209, 0.4);
		}
		50% {
			box-shadow: 0 0 0 8px rgba(181, 160, 209, 0);
		}
	}

	.next-btn {
		padding: 12px 36px;
		border: none;
		border-radius: 12px 14px 10px 16px;
		background: var(--color-lavender, #b5a0d1);
		color: white;
		font-family: var(--font-sans, system-ui, sans-serif);
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		box-shadow: 0 4px 12px rgba(181, 160, 209, 0.3);
		transition: transform 0.15s ease;
	}

	.next-btn:active {
		transform: scale(0.97);
	}

	/* Completion card */
	.card {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
	}

	.complete-emoji {
		font-size: 3rem;
		display: block;
		animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.card-title {
		font-family: var(--font-serif, 'Fraunces', serif);
		font-size: 1.5rem;
		color: var(--color-earth-brown, #5c4d3c);
		margin: 0;
		line-height: 1.4;
	}

	.card-body {
		font-family: var(--font-sans, system-ui, sans-serif);
		font-size: 1rem;
		color: rgba(92, 77, 60, 0.65);
		margin: 0;
		line-height: 1.6;
		max-width: 340px;
	}

	/* Animations */
	.fade-in {
		animation: fade-in 0.4s ease forwards;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes pop-in {
		from {
			transform: scale(0);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}
</style>
