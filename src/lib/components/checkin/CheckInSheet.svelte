<!-- CheckInSheet.svelte — Multi-step check-in flow: energy, emotions, habits, celebration -->
<script lang="ts">
	import BottomSheet from '$lib/components/ui/BottomSheet.svelte';
	import EnergySelector from './EnergySelector.svelte';
	import EmotionFlowers from './EmotionFlowers.svelte';
	import HabitToggles from './HabitToggles.svelte';
	import { submitCheckin, randomEncouragement } from '$lib/services/checkins';
	import { appState } from '$lib/stores/app.svelte';

	interface Props {
		open: boolean;
	}

	let { open = $bindable(false) }: Props = $props();

	let step = $state(1);
	let energy = $state<'low' | 'medium' | 'high' | null>(null);
	let emotions = $state<string[]>([]);
	let habits = $state<Record<string, boolean>>({});
	let celebrationMsg = $state('');
	let slideDir = $state<'left' | 'right'>('left');
	let autoAdvanceTimer: ReturnType<typeof setTimeout> | null = null;
	let celebrationTimer: ReturnType<typeof setTimeout> | null = null;
	let resetTimer: ReturnType<typeof setTimeout> | null = null;

	// Auto-advance when energy is selected
	$effect(() => {
		if (energy && step === 1) {
			autoAdvanceTimer = setTimeout(() => {
				autoAdvanceTimer = null;
				slideDir = 'left';
				step = 2;
			}, 300);
		}
	});

	function nextStep() {
		slideDir = 'left';
		step = step + 1;
	}

	function finish() {
		if (!energy) return;

		submitCheckin({
			energy,
			emotions,
			habits,
			timestamp: new Date(),
		});

		celebrationMsg = randomEncouragement();
		appState.checkedInToday = true;
		appState.emberState = 'celebrating';
		appState.emberMessage = celebrationMsg;

		slideDir = 'left';
		step = 4;

		// Auto-dismiss after 3s
		celebrationTimer = setTimeout(() => {
			celebrationTimer = null;
			open = false;
			// Reset for next time
			resetTimer = setTimeout(() => {
				resetTimer = null;
				step = 1;
				energy = null;
				emotions = [];
				habits = {};
			}, 400);
		}, 3000);

		// Return Ember to idle after 5s
		setTimeout(() => {
			appState.emberState = 'idle';
			appState.emberMessage = '';
		}, 5000);
	}

	function clearAllTimers() {
		if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null; }
		if (celebrationTimer) { clearTimeout(celebrationTimer); celebrationTimer = null; }
		if (resetTimer) { clearTimeout(resetTimer); resetTimer = null; }
	}

	function resetFlow() {
		clearAllTimers();
		step = 1;
		energy = null;
		emotions = [];
		habits = {};
		celebrationMsg = '';
	}

	// Reset state when sheet closes (mid-flow or after celebration)
	$effect(() => {
		if (!open) {
			// Delay reset slightly so close animation isn't janky
			const t = setTimeout(() => resetFlow(), 350);
			return () => clearTimeout(t);
		}
	});
</script>

<BottomSheet bind:open height="auto">
	<!-- Step dots -->
	<div class="step-dots" role="group" aria-label="Check-in progress">
		{#each [1, 2, 3] as dot}
			<span class="dot" class:active={step >= dot} class:current={step === dot} role="presentation" aria-hidden="true"></span>
		{/each}
		<span class="sr-only">Step {step} of 3</span>
	</div>

	<!-- Step content with slide transition -->
	<div class="steps-container">
		{#if step === 1}
			<div class="step-pane" class:slide-in-left={slideDir === 'left'}>
				<EnergySelector bind:value={energy} />
			</div>
		{:else if step === 2}
			<div class="step-pane" class:slide-in-left={slideDir === 'left'}>
				<EmotionFlowers bind:selected={emotions} />
				{#if emotions.length > 0}
					<button class="next-btn" onclick={nextStep} aria-label="Next step: habits">
						Next
					</button>
				{/if}
			</div>
		{:else if step === 3}
			<div class="step-pane" class:slide-in-left={slideDir === 'left'}>
				<HabitToggles bind:completed={habits} onskip={finish} />
				<button class="done-btn" onclick={finish} aria-label="Finish check-in">
					Done
				</button>
			</div>
		{:else if step === 4}
			<div class="step-pane celebration" class:slide-in-left={slideDir === 'left'}>
				<span class="celebrate-emoji">{'\u{1F389}'}</span>
				<p class="celebrate-msg">{celebrationMsg}</p>
			</div>
		{/if}
	</div>
</BottomSheet>

<style>
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.step-dots {
		display: flex;
		justify-content: center;
		gap: 8px;
		margin-bottom: 20px;
		position: relative;
	}

	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: rgba(92, 77, 60, 0.15);
		transition: background 0.3s ease, transform 0.3s ease;
	}

	.dot.active {
		background: rgba(92, 77, 60, 0.35);
	}

	.dot.current {
		background: #E8945A;
		transform: scale(1.2);
	}

	.steps-container {
		min-height: 200px;
		position: relative;
	}

	/* Compact layout for small viewports like iPhone SE */
	@media (max-height: 700px) {
		.steps-container {
			min-height: 140px;
		}
		.step-dots {
			margin-bottom: 12px;
		}
	}

	.step-pane {
		animation: slide-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
	}

	@keyframes slide-in {
		from {
			opacity: 0;
			transform: translateX(40px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.next-btn,
	.done-btn {
		display: block;
		width: 100%;
		margin-top: 20px;
		padding: 14px;
		border: none;
		border-radius: 12px 14px 10px 16px;
		font-family: var(--font-sans);
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		transition: transform 0.15s ease, box-shadow 0.15s ease;
		-webkit-tap-highlight-color: transparent;
		touch-action: manipulation;
		min-height: 44px;
	}

	@media (max-height: 700px) {
		.next-btn,
		.done-btn {
			margin-top: 12px;
			padding: 10px;
		}
	}

	.next-btn {
		background: #E8945A;
		color: white;
		box-shadow: 0 4px 12px rgba(232, 148, 90, 0.3);
	}

	.done-btn {
		background: #8BAF7C;
		color: white;
		box-shadow: 0 4px 12px rgba(139, 175, 124, 0.3);
	}

	.next-btn:active,
	.done-btn:active {
		transform: scale(0.97);
	}

	.celebration {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 32px 0;
		gap: 12px;
	}

	.celebrate-emoji {
		font-size: 3rem;
		animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.celebrate-msg {
		font-family: var(--font-serif);
		font-size: 1.1rem;
		color: #5C4D3C;
		text-align: center;
		margin: 0;
		animation: fade-up 0.5s ease 0.2s both;
	}

	@keyframes pop-in {
		from { transform: scale(0); opacity: 0; }
		to { transform: scale(1); opacity: 1; }
	}

	@keyframes fade-up {
		from { opacity: 0; transform: translateY(8px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
