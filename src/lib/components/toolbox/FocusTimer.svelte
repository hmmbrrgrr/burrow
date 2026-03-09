<!-- FocusTimer.svelte — Pomodoro timer with SVG progress ring -->
<script lang="ts">
	import { appState } from '$lib/stores/app.svelte';

	interface Props {
		open: boolean;
	}

	let { open = $bindable(false) }: Props = $props();

	type TimerMode = 'work' | 'break';

	const WORK_SECONDS = 25 * 60;
	const BREAK_SECONDS = 5 * 60;

	let mode = $state<TimerMode>('work');
	let remaining = $state(WORK_SECONDS);
	let running = $state(false);
	let flash = $state(false);
	let interval: ReturnType<typeof setInterval> | null = null;

	let totalSeconds = $derived(mode === 'work' ? WORK_SECONDS : BREAK_SECONDS);
	let progress = $derived(1 - remaining / totalSeconds);

	// SVG circle math
	const radius = 90;
	const circumference = 2 * Math.PI * radius;
	let dashOffset = $derived(circumference * (1 - progress));

	let ringColor = $derived(mode === 'work' ? '#E8945A' : '#98BF82');

	let displayMinutes = $derived(Math.floor(remaining / 60).toString().padStart(2, '0'));
	let displaySeconds = $derived((remaining % 60).toString().padStart(2, '0'));

	function start() {
		running = true;
		appState.emberState = mode === 'work' ? 'thinking' : 'idle';
		interval = setInterval(() => {
			remaining -= 1;
			if (remaining <= 0) {
				switchMode();
			}
		}, 1000);
	}

	function pause() {
		running = false;
		if (interval) {
			clearInterval(interval);
			interval = null;
		}
	}

	function reset() {
		pause();
		mode = 'work';
		remaining = WORK_SECONDS;
		appState.emberState = 'idle';
	}

	function switchMode() {
		pause();
		flash = true;
		setTimeout(() => { flash = false; }, 600);

		if (mode === 'work') {
			mode = 'break';
			remaining = BREAK_SECONDS;
			appState.emberState = 'idle';
		} else {
			mode = 'work';
			remaining = WORK_SECONDS;
		}
		start();
	}

	function close() {
		pause();
		appState.emberState = 'idle';
		mode = 'work';
		remaining = WORK_SECONDS;
		open = false;
	}

	$effect(() => {
		return () => {
			if (interval) clearInterval(interval);
		};
	});
</script>

{#if open}
	<div class="timer-overlay" class:flash>
		<button class="close-btn" onclick={close} aria-label="Close">✕</button>

		<div class="timer-content fade-in">
			<p class="mode-label">{mode === 'work' ? 'Focus Time' : 'Break Time'}</p>

			<div class="timer-ring">
				<svg viewBox="0 0 200 200" width="220" height="220">
					<circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(92,77,60,0.1)" stroke-width="8" />
					<circle
						cx="100" cy="100" r={radius}
						fill="none"
						stroke={ringColor}
						stroke-width="8"
						stroke-linecap="round"
						stroke-dasharray={circumference}
						stroke-dashoffset={dashOffset}
						transform="rotate(-90 100 100)"
						style="transition: stroke-dashoffset 1s linear, stroke 0.5s ease;"
					/>
				</svg>
				<div class="timer-display">
					<span class="time-text">{displayMinutes}:{displaySeconds}</span>
				</div>
			</div>

			<div class="controls">
				{#if !running}
					<button class="ctrl-btn start" onclick={start}>
						{remaining < totalSeconds ? 'Resume' : 'Start'}
					</button>
				{:else}
					<button class="ctrl-btn pause" onclick={pause}>Pause</button>
				{/if}
				<button class="ctrl-btn reset" onclick={reset}>Reset</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.timer-overlay {
		position: fixed;
		inset: 0;
		z-index: 60;
		background: #F5EBD8;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		transition: background 0.3s ease;
	}

	.timer-overlay.flash {
		animation: flash-bg 0.6s ease;
	}

	@keyframes flash-bg {
		0% { background: #F5EBD8; }
		50% { background: #EDE0C8; }
		100% { background: #F5EBD8; }
	}

	.close-btn {
		position: absolute;
		top: 16px;
		right: 16px;
		width: 40px;
		height: 40px;
		border: none;
		background: rgba(92, 77, 60, 0.1);
		border-radius: 50%;
		font-size: 1.2rem;
		color: #5C4D3C;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.timer-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24px;
	}

	.mode-label {
		font-family: var(--font-serif);
		font-size: 1.4rem;
		color: #5C4D3C;
		margin: 0;
	}

	.timer-ring {
		position: relative;
		width: 220px;
		height: 220px;
	}

	.timer-display {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.time-text {
		font-family: var(--font-serif);
		font-size: 2.8rem;
		font-weight: 700;
		color: #5C4D3C;
	}

	.controls {
		display: flex;
		gap: 12px;
	}

	.ctrl-btn {
		padding: 12px 32px;
		border: none;
		border-radius: 12px 14px 10px 16px;
		font-family: var(--font-sans);
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		transition: transform 0.15s ease;
	}

	.ctrl-btn:active {
		transform: scale(0.97);
	}

	.ctrl-btn.start {
		background: #E8945A;
		color: white;
		box-shadow: 0 4px 12px rgba(232, 148, 90, 0.3);
	}

	.ctrl-btn.pause {
		background: #B5A0D1;
		color: white;
		box-shadow: 0 4px 12px rgba(181, 160, 209, 0.3);
	}

	.ctrl-btn.reset {
		background: rgba(92, 77, 60, 0.1);
		color: #5C4D3C;
	}

	.fade-in {
		animation: fade-in 0.4s ease forwards;
	}

	@keyframes fade-in {
		from { opacity: 0; transform: translateY(12px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
