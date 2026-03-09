<!-- BodyDoubling.svelte — Cozy presence timer: Ember works alongside you -->
<script lang="ts">
	import { appState } from '$lib/stores/app.svelte';

	interface Props {
		open: boolean;
	}

	let { open = $bindable(false) }: Props = $props();

	type Phase = 'idle' | 'running' | 'paused' | 'summary';

	let phase = $state<Phase>('idle');
	let elapsed = $state(0);
	let activity = $state('');
	let interval: ReturnType<typeof setInterval> | null = null;
	let nudgesReached = $state(0);
	let lastNudgeIndex = $state(-1);

	const nudges = [
		{ at: 15 * 60, message: '15 minutes together! You\'re doing great 🌿' },
		{ at: 25 * 60, message: 'Nice focus stretch! Take a sip of water? 💧' },
		{ at: 45 * 60, message: '45 minutes of cozy work! You\'re on a roll 🔥' },
	];

	let displayMinutes = $derived(Math.floor(elapsed / 60).toString().padStart(2, '0'));
	let displaySeconds = $derived((elapsed % 60).toString().padStart(2, '0'));

	// Pulsing ring progress — loops every 60 seconds for ambient effect
	const radius = 90;
	const circumference = 2 * Math.PI * radius;
	let ringProgress = $derived((elapsed % 60) / 60);
	let dashOffset = $derived(circumference * (1 - ringProgress));

	function start() {
		phase = 'running';
		appState.emberState = 'thinking';
		appState.emberMessage = 'Ember is here with you ✨';
		interval = setInterval(() => {
			elapsed += 1;
			checkNudges();
		}, 1000);
	}

	function pause() {
		phase = 'paused';
		if (interval) {
			clearInterval(interval);
			interval = null;
		}
	}

	function resume() {
		phase = 'running';
		interval = setInterval(() => {
			elapsed += 1;
			checkNudges();
		}, 1000);
	}

	function stop() {
		if (interval) {
			clearInterval(interval);
			interval = null;
		}
		phase = 'summary';
		appState.emberState = 'idle';
		appState.emberMessage = 'We got stuff done together! 🐾';
		saveSession();
	}

	function checkNudges() {
		for (let i = lastNudgeIndex + 1; i < nudges.length; i++) {
			if (elapsed >= nudges[i].at) {
				appState.emberMessage = nudges[i].message;
				nudgesReached = i + 1;
				lastNudgeIndex = i;
			}
		}
	}

	function saveSession() {
		const session = {
			duration: elapsed,
			activity: activity.trim() || null,
			timestamp: new Date().toISOString(),
		};
		try {
			const history = JSON.parse(localStorage.getItem('burrow-bodydoubling') || '[]');
			history.push(session);
			localStorage.setItem('burrow-bodydoubling', JSON.stringify(history));
		} catch {
			localStorage.setItem('burrow-bodydoubling', JSON.stringify([session]));
		}
	}

	function close() {
		if (interval) clearInterval(interval);
		interval = null;
		phase = 'idle';
		elapsed = 0;
		activity = '';
		nudgesReached = 0;
		lastNudgeIndex = -1;
		appState.emberState = 'idle';
		appState.emberMessage = '';
		open = false;
	}

	function formatDuration(seconds: number): string {
		const m = Math.floor(seconds / 60);
		const s = seconds % 60;
		if (m === 0) return `${s} seconds`;
		return `${m} min ${s}s`;
	}

	// Clean up interval when open changes to false or component unmounts
	$effect(() => {
		if (!open && interval) {
			clearInterval(interval);
			interval = null;
		}

		return () => {
			if (interval) {
				clearInterval(interval);
				interval = null;
			}
		};
	});
</script>

{#if open}
<div class="bd-overlay">
	<button class="close-btn" onclick={close} aria-label="Close">✕</button>

	<!-- Ambient floating particles -->
	<div class="particles">
		<span class="particle p1"></span>
		<span class="particle p2"></span>
		<span class="particle p3"></span>
		<span class="particle p4"></span>
		<span class="particle p5"></span>
	</div>

	{#if phase === 'summary'}
		<!-- Summary card -->
		<div class="summary-card fade-in">
			<p class="summary-emoji">🐾</p>
			<h2 class="summary-title">We got stuff done together!</h2>
			<div class="summary-stats">
				<div class="stat">
					<span class="stat-value">{formatDuration(elapsed)}</span>
					<span class="stat-label">Working together</span>
				</div>
				{#if activity.trim()}
					<div class="stat">
						<span class="stat-value">{activity.trim()}</span>
						<span class="stat-label">Activity</span>
					</div>
				{/if}
				<div class="stat">
					<span class="stat-value">{nudgesReached}</span>
					<span class="stat-label">Milestones reached</span>
				</div>
			</div>
			<p class="summary-message">You showed up, and that's what counts. Ember's proud of you. 🧡</p>
			<button class="ctrl-btn start" onclick={close}>Done</button>
		</div>
	{:else}
		<!-- Timer view -->
		<div class="timer-content fade-in">
			<p class="presence-label">
				{#if phase === 'idle'}
					Working together
				{:else if phase === 'paused'}
					Taking a breather...
				{:else}
					Ember is here with you
				{/if}
			</p>

			{#if phase === 'idle'}
				<!-- Activity input before starting -->
				<div class="activity-field">
					<label class="activity-label" for="bd-activity">What are we working on?</label>
					<input
						id="bd-activity"
						class="activity-input"
						type="text"
						bind:value={activity}
						placeholder="e.g., writing, studying, cleaning... (optional)"
					/>
				</div>
			{:else}
				{#if activity.trim()}
					<p class="activity-display">{activity.trim()}</p>
				{/if}
			{/if}

			<div class="timer-ring">
				<div class="glow-ring"></div>
				<svg viewBox="0 0 200 200" width="220" height="220">
					<circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(92,77,60,0.08)" stroke-width="6" />
					<circle
						cx="100" cy="100" r={radius}
						fill="none"
						stroke="#98BF82"
						stroke-width="6"
						stroke-linecap="round"
						stroke-dasharray={circumference}
						stroke-dashoffset={dashOffset}
						transform="rotate(-90 100 100)"
						style="transition: stroke-dashoffset 1s linear;"
						class:pulse-ring={phase === 'running'}
					/>
				</svg>
				<div class="timer-display">
					<span class="time-text">{displayMinutes}:{displaySeconds}</span>
				</div>
			</div>

			{#if appState.emberMessage && phase === 'running'}
				<p class="nudge-message fade-in">{appState.emberMessage}</p>
			{/if}

			<div class="controls">
				{#if phase === 'idle'}
					<button class="ctrl-btn start" onclick={start}>Start Working Together</button>
				{:else if phase === 'paused'}
					<button class="ctrl-btn start" onclick={resume}>Resume</button>
					<button class="ctrl-btn stop" onclick={stop}>Stop</button>
				{:else}
					<button class="ctrl-btn pause" onclick={pause}>Pause</button>
					<button class="ctrl-btn stop" onclick={stop}>Stop</button>
				{/if}
			</div>
		</div>
	{/if}
</div>
{/if}

<style>
	.bd-overlay {
		position: fixed;
		inset: 0;
		z-index: 50;
		background: #F5EBD8;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.close-btn {
		position: absolute;
		top: 16px;
		right: 16px;
		width: 44px;
		height: 44px;
		border: none;
		background: rgba(92, 77, 60, 0.1);
		border-radius: 50%;
		font-size: 1.2rem;
		color: #5C4D3C;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10;
	}

	.close-btn:hover {
		background: rgba(92, 77, 60, 0.18);
	}

	/* Ambient particles */
	.particles {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
	}

	.particle {
		position: absolute;
		border-radius: 50%;
		background: rgba(152, 191, 130, 0.15);
		animation: float-up 12s ease-in-out infinite;
	}

	.p1 { width: 8px; height: 8px; left: 15%; bottom: -20px; animation-delay: 0s; animation-duration: 14s; }
	.p2 { width: 6px; height: 6px; left: 35%; bottom: -20px; animation-delay: 3s; animation-duration: 11s; }
	.p3 { width: 10px; height: 10px; left: 60%; bottom: -20px; animation-delay: 6s; animation-duration: 16s; }
	.p4 { width: 5px; height: 5px; left: 78%; bottom: -20px; animation-delay: 2s; animation-duration: 13s; }
	.p5 { width: 7px; height: 7px; left: 48%; bottom: -20px; animation-delay: 8s; animation-duration: 15s; }

	@keyframes float-up {
		0% { transform: translateY(0) scale(1); opacity: 0; }
		10% { opacity: 1; }
		90% { opacity: 1; }
		100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
	}

	/* Timer content */
	.timer-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24px;
	}

	.presence-label {
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

	.glow-ring {
		position: absolute;
		inset: -8px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(152, 191, 130, 0.12) 0%, transparent 70%);
		animation: soft-pulse 4s ease-in-out infinite;
	}

	@keyframes soft-pulse {
		0%, 100% { transform: scale(1); opacity: 0.6; }
		50% { transform: scale(1.08); opacity: 1; }
	}

	.pulse-ring {
		filter: drop-shadow(0 0 6px rgba(152, 191, 130, 0.3));
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

	/* Activity input */
	.activity-field {
		width: 100%;
		max-width: 340px;
		text-align: left;
	}

	.activity-label {
		display: block;
		font-family: var(--font-sans, system-ui, sans-serif);
		font-size: 0.85rem;
		font-weight: 600;
		color: rgba(92, 77, 60, 0.7);
		margin-bottom: 6px;
	}

	.activity-input {
		width: 100%;
		padding: 14px 16px;
		border: 2px solid rgba(92, 77, 60, 0.12);
		border-radius: 14px 12px 16px 10px;
		background: rgba(255, 255, 255, 0.5);
		font-family: var(--font-sans, system-ui, sans-serif);
		font-size: 1rem;
		color: #5C4D3C;
		outline: none;
		transition: border-color 0.2s ease;
		box-sizing: border-box;
	}

	.activity-input:focus {
		border-color: #98BF82;
	}

	.activity-input::placeholder {
		color: rgba(92, 77, 60, 0.35);
	}

	.activity-display {
		font-family: var(--font-sans, system-ui, sans-serif);
		font-size: 0.9rem;
		color: rgba(92, 77, 60, 0.5);
		margin: 0;
		font-style: italic;
	}

	.nudge-message {
		font-family: var(--font-serif);
		font-size: 1.05rem;
		color: #6B8F56;
		margin: 0;
		text-align: center;
		max-width: 320px;
	}

	/* Controls */
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
		background: #98BF82;
		color: white;
		box-shadow: 0 4px 12px rgba(152, 191, 130, 0.3);
	}

	.ctrl-btn.pause {
		background: #B5A0D1;
		color: white;
		box-shadow: 0 4px 12px rgba(181, 160, 209, 0.3);
	}

	.ctrl-btn.stop {
		background: rgba(92, 77, 60, 0.1);
		color: #5C4D3C;
	}

	/* Summary card */
	.summary-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
		background: rgba(255, 255, 255, 0.5);
		border-radius: 20px;
		padding: 40px 48px;
		max-width: 380px;
		box-shadow: 0 8px 32px rgba(92, 77, 60, 0.08);
	}

	.summary-emoji {
		font-size: 3rem;
		margin: 0;
	}

	.summary-title {
		font-family: var(--font-serif);
		font-size: 1.5rem;
		font-weight: 700;
		color: #5C4D3C;
		margin: 0;
		text-align: center;
	}

	.summary-stats {
		display: flex;
		gap: 32px;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}

	.stat-value {
		font-family: var(--font-serif);
		font-size: 1.3rem;
		font-weight: 700;
		color: #5C4D3C;
	}

	.stat-label {
		font-size: 0.8rem;
		color: #8B7A66;
	}

	.summary-message {
		font-family: var(--font-serif);
		font-size: 0.95rem;
		color: #6B8F56;
		text-align: center;
		margin: 0;
	}

	.fade-in {
		animation: fade-in 0.4s ease forwards;
	}

	@keyframes fade-in {
		from { opacity: 0; transform: translateY(12px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
