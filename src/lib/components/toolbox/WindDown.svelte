<!-- WindDown.svelte — Evening wind-down routine with night theme -->
<script lang="ts">
	import { appState } from '$lib/stores/app.svelte';

	interface Props {
		open: boolean;
	}

	let { open = $bindable(false) }: Props = $props();

	type Phase = 1 | 2 | 3 | 4 | 5;
	type DayRating = 'tough' | 'okay' | 'good';

	interface WindDownEntry {
		timestamp: string;
		dayRating: DayRating;
		gratitude: string;
		tomorrowTask: string;
	}

	let phase = $state<Phase>(1);
	let dayRating = $state<DayRating | null>(null);
	let gratitude = $state('');
	let tomorrowTask = $state('');

	// Breathing state
	let breathCycle = $state(0);
	let breathPhase = $state<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
	let breathTimer: ReturnType<typeof setTimeout> | null = null;
	let breathLabel = $derived(
		breathPhase === 'inhale' ? 'Breathe in...' :
		breathPhase === 'hold' ? 'Hold...' :
		breathPhase === 'exhale' ? 'Breathe out...' :
		'Get comfortable...'
	);

	// Circle scale for breathing animation
	let circleScale = $derived(
		breathPhase === 'inhale' ? 1 :
		breathPhase === 'hold' ? 1 :
		breathPhase === 'exhale' ? 0.6 : 0.6
	);

	const dayOptions: { rating: DayRating; emoji: string; label: string }[] = [
		{ rating: 'tough', emoji: '🌧️', label: 'Tough' },
		{ rating: 'okay', emoji: '🌤️', label: 'Okay' },
		{ rating: 'good', emoji: '☀️', label: 'Good' },
	];

	const phaseLabels = ['Check-in', 'Gratitude', 'Tomorrow', 'Breathe', 'Goodnight'];

	// ─── Phase Navigation ───
	function selectDay(rating: DayRating) {
		dayRating = rating;
		goToPhase(2);
	}

	function goToPhase(p: Phase) {
		phase = p;
		if (p === 4) startBreathing();
		if (p === 5) enterGoodnight();
	}

	function nextPhase() {
		if (phase < 5) goToPhase((phase + 1) as Phase);
	}

	function prevPhase() {
		if (phase > 1) {
			if (phase === 4) stopBreathing();
			phase = (phase - 1) as Phase;
		}
	}

	// ─── Breathing (Phase 4) ───
	function startBreathing() {
		breathCycle = 0;
		runBreathCycle();
	}

	function runBreathCycle() {
		if (breathCycle >= 3) {
			// Done — auto-advance
			breathPhase = 'idle';
			saveEntry();
			goToPhase(5);
			return;
		}

		// Inhale 4s
		breathPhase = 'inhale';
		breathTimer = setTimeout(() => {
			// Hold 2s
			breathPhase = 'hold';
			breathTimer = setTimeout(() => {
				// Exhale 6s
				breathPhase = 'exhale';
				breathTimer = setTimeout(() => {
					breathCycle += 1;
					runBreathCycle();
				}, 6000);
			}, 2000);
		}, 4000);
	}

	function stopBreathing() {
		if (breathTimer) {
			clearTimeout(breathTimer);
			breathTimer = null;
		}
		breathPhase = 'idle';
		breathCycle = 0;
	}

	// ─── Goodnight (Phase 5) ───
	function enterGoodnight() {
		appState.emberState = 'sleeping';
		appState.emberMessage = 'Rest well. Tomorrow\'s a fresh page. 🌙';
	}

	// ─── Save ───
	function saveEntry() {
		if (!dayRating) return;
		const entry: WindDownEntry = {
			timestamp: new Date().toISOString(),
			dayRating,
			gratitude: gratitude.trim(),
			tomorrowTask: tomorrowTask.trim(),
		};

		try {
			const raw = localStorage.getItem('burrow-winddown');
			const existing: WindDownEntry[] = raw ? JSON.parse(raw) : [];
			const updated = [entry, ...existing].slice(0, 50);
			localStorage.setItem('burrow-winddown', JSON.stringify(updated));
		} catch {
			/* ignore */
		}
	}

	let previousEmberState = '';
	let previousEmberMessage = '';

	// Reset on open, clean up all timers on close/unmount
	$effect(() => {
		if (open) {
			phase = 1;
			dayRating = null;
			gratitude = '';
			tomorrowTask = '';
			breathCycle = 0;
			breathPhase = 'idle';
			previousEmberState = appState.emberState;
			previousEmberMessage = appState.emberMessage;
			appState.emberState = 'idle';
			appState.emberMessage = 'Winding down for the night... 🌙';
		}

		return () => {
			// Clear all breathing timers — stopBreathing resets state + clears the active timeout
			stopBreathing();
		};
	});

	// ─── Close ───
	function close() {
		stopBreathing();
		if (phase < 5) {
			appState.emberState = previousEmberState as typeof appState.emberState;
			appState.emberMessage = previousEmberMessage;
		}
		open = false;
	}
</script>

{#if open}
<div class="winddown-overlay">
	<!-- Stars background -->
	<div class="stars">
		{#each Array(24) as _, i}
			<span
				class="star"
				style="--x: {5 + (i * 37 + i * i * 13) % 90}%; --y: {3 + (i * 23 + i * i * 7) % 85}%; --size: {1 + (i % 3)}px; --delay: {(i * 0.4) % 4}s; --dur: {2 + (i % 3)}s"
			></span>
		{/each}
	</div>

	<!-- Fireflies -->
	<div class="fireflies">
		{#each Array(6) as _, i}
			<span
				class="firefly"
				style="--fx: {10 + (i * 43) % 80}%; --fy: {15 + (i * 29) % 70}%; --fd: {3 + i * 0.8}s; --fdelay: {i * 1.2}s"
			></span>
		{/each}
	</div>

	<button class="close-btn" onclick={close} aria-label="Close">✕</button>

	<!-- Phase dots (moon phases) -->
	<div class="progress-dots">
		{#each [1, 2, 3, 4, 5] as dot, i}
			<span
				class="moon-dot"
				class:active={dot === phase}
				class:completed={dot < phase}
				title={phaseLabels[i]}
			></span>
		{/each}
	</div>

	<div class="winddown-content">
		<!-- Phase 1: Evening Check-in -->
		{#if phase === 1}
			<div class="phase-screen fade-in">
				<h2 class="phase-title">🌙 How was your day?</h2>
				<p class="phase-prompt">No wrong answers. Just checking in.</p>
				<div class="day-options">
					{#each dayOptions as opt}
						<button
							class="day-btn"
							class:selected={dayRating === opt.rating}
							onclick={() => selectDay(opt.rating)}
						>
							<span class="day-emoji">{opt.emoji}</span>
							<span class="day-label">{opt.label}</span>
						</button>
					{/each}
				</div>
			</div>

		<!-- Phase 2: Gratitude -->
		{:else if phase === 2}
			<div class="phase-screen fade-in">
				<h2 class="phase-title">⭐ Name one small thing that was nice today</h2>
				<p class="phase-prompt">Even tiny things count...</p>
				<textarea
					class="night-input"
					placeholder="A warm cup of tea, a good song, a moment of quiet..."
					bind:value={gratitude}
					rows={3}
				></textarea>
				<div class="phase-nav">
					<button class="back-btn" onclick={prevPhase}>← Back</button>
					<button class="next-btn" onclick={nextPhase}>Next →</button>
				</div>
			</div>

		<!-- Phase 3: Tomorrow Prep -->
		{:else if phase === 3}
			<div class="phase-screen fade-in">
				<h2 class="phase-title">🌟 One thing for tomorrow?</h2>
				<p class="phase-prompt">Just one. You can figure the rest out later.</p>
				<textarea
					class="night-input"
					placeholder="One small step..."
					bind:value={tomorrowTask}
					rows={3}
				></textarea>
				<div class="phase-nav">
					<button class="back-btn" onclick={prevPhase}>← Back</button>
					<button
						class="next-btn"
						onclick={nextPhase}
					>
						Let's breathe →
					</button>
				</div>
			</div>

		<!-- Phase 4: Breathing -->
		{:else if phase === 4}
			<div class="phase-screen fade-in">
				<h2 class="phase-title">✨ Three gentle breaths</h2>
				<p class="phase-prompt">{breathLabel}</p>

				<div class="breath-container">
					<div
						class="night-breath-circle"
						style="transform: scale({circleScale})"
					>
						<span class="breath-glow"></span>
					</div>
				</div>

				<p class="breath-count">{breathCycle} / 3</p>
			</div>

		<!-- Phase 5: Goodnight -->
		{:else if phase === 5}
			<div class="phase-screen goodnight-screen fade-in">
				<div class="goodnight-decorations">✨ 🌙 ✨</div>
				<span class="ember-sleepy">😴</span>
				<h2 class="goodnight-title">Goodnight</h2>
				<p class="goodnight-msg">Ember's curling up too. Tomorrow's a fresh page. 🌟</p>
				<button class="done-btn" onclick={close}>Close your eyes 💤</button>
			</div>
		{/if}
	</div>
</div>
{/if}

<style>
	/* ─── Night Overlay ─── */
	.winddown-overlay {
		position: fixed;
		inset: 0;
		z-index: 60;
		background: linear-gradient(170deg, #1A1A2E 0%, #2D2B55 40%, #1E1E3A 80%, #141428 100%);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	/* ─── Stars ─── */
	.stars {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.star {
		position: absolute;
		left: var(--x);
		top: var(--y);
		width: var(--size);
		height: var(--size);
		background: #F2C94C;
		border-radius: 50%;
		animation: twinkle var(--dur) ease-in-out var(--delay) infinite alternate;
		opacity: 0.3;
	}

	@keyframes twinkle {
		0% { opacity: 0.2; transform: scale(0.8); }
		100% { opacity: 0.8; transform: scale(1.2); }
	}

	/* ─── Fireflies ─── */
	.fireflies {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.firefly {
		position: absolute;
		left: var(--fx);
		top: var(--fy);
		width: 4px;
		height: 4px;
		background: rgba(242, 201, 76, 0.6);
		border-radius: 50%;
		box-shadow: 0 0 6px rgba(242, 201, 76, 0.4), 0 0 12px rgba(242, 201, 76, 0.2);
		animation: float var(--fd) ease-in-out var(--fdelay) infinite alternate;
	}

	@keyframes float {
		0% { transform: translate(0, 0); opacity: 0.2; }
		50% { opacity: 0.7; }
		100% { transform: translate(15px, -20px); opacity: 0.3; }
	}

	/* ─── Close Button ─── */
	.close-btn {
		position: fixed;
		top: 16px;
		right: 16px;
		z-index: 61;
		background: rgba(255, 255, 255, 0.08);
		border: none;
		border-radius: 50%;
		width: 44px;
		height: 44px;
		font-size: 18px;
		color: rgba(255, 255, 255, 0.5);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.2s ease, color 0.2s ease;
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.14);
		color: rgba(255, 255, 255, 0.8);
	}

	/* ─── Progress (Moon Dots) ─── */
	.progress-dots {
		position: fixed;
		top: 24px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 12px;
		z-index: 61;
	}

	.moon-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.12);
		border: 1px solid rgba(255, 255, 255, 0.1);
		transition: all 0.3s ease;
	}

	.moon-dot.active {
		background: #F2C94C;
		border-color: #F2C94C;
		transform: scale(1.3);
		box-shadow: 0 0 10px rgba(242, 201, 76, 0.4);
	}

	.moon-dot.completed {
		background: rgba(242, 201, 76, 0.5);
		border-color: rgba(242, 201, 76, 0.3);
	}

	/* ─── Content ─── */
	.winddown-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24px;
		padding: 60px 24px 40px;
		max-width: 480px;
		width: 100%;
		z-index: 1;
	}

	.phase-screen {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
		width: 100%;
		text-align: center;
	}

	.phase-title {
		font-family: 'Fraunces', Georgia, serif;
		font-size: 1.5rem;
		font-weight: 600;
		color: #F5EBD8;
		letter-spacing: -0.02em;
		line-height: 1.3;
	}

	.phase-prompt {
		font-size: 0.9rem;
		color: rgba(245, 235, 216, 0.55);
		line-height: 1.5;
	}

	/* ─── Phase 1: Day Rating ─── */
	.day-options {
		display: flex;
		gap: 20px;
		justify-content: center;
		margin-top: 8px;
	}

	.day-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 16px 20px;
		background: rgba(255, 255, 255, 0.06);
		border: 2px solid rgba(255, 255, 255, 0.08);
		border-radius: 16px;
		cursor: pointer;
		transition: all 0.2s ease;
		min-width: 80px;
	}

	.day-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(242, 201, 76, 0.3);
		transform: translateY(-2px);
	}

	.day-btn:active {
		transform: scale(0.95);
	}

	.day-btn.selected {
		border-color: #F2C94C;
		background: rgba(242, 201, 76, 0.12);
	}

	.day-emoji {
		font-size: 2rem;
	}

	.day-label {
		font-size: 0.8rem;
		color: rgba(245, 235, 216, 0.6);
		font-weight: 500;
	}

	/* ─── Textarea (Night theme) ─── */
	.night-input {
		width: 100%;
		padding: 16px;
		border: 2px solid rgba(242, 201, 76, 0.15);
		border-radius: 16px;
		background: rgba(255, 255, 255, 0.05);
		font-family: 'Inter', system-ui, sans-serif;
		font-size: 1rem;
		color: #F5EBD8;
		line-height: 1.6;
		resize: vertical;
		min-height: 80px;
		outline: none;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}

	.night-input::placeholder {
		color: rgba(245, 235, 216, 0.3);
	}

	.night-input:focus {
		border-color: rgba(242, 201, 76, 0.35);
		box-shadow: 0 0 0 3px rgba(242, 201, 76, 0.08);
	}

	/* ─── Navigation ─── */
	.phase-nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		margin-top: 8px;
	}

	.back-btn {
		background: none;
		border: none;
		color: rgba(245, 235, 216, 0.45);
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		padding: 8px 4px;
		transition: color 0.2s ease;
	}

	.back-btn:hover {
		color: rgba(245, 235, 216, 0.75);
	}

	.next-btn {
		padding: 12px 28px;
		border: none;
		border-radius: 999px;
		background: rgba(242, 201, 76, 0.2);
		color: #F2C94C;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
			background 0.2s ease, box-shadow 0.2s ease;
	}

	.next-btn:hover {
		transform: scale(1.05);
		background: rgba(242, 201, 76, 0.28);
		box-shadow: 0 4px 16px rgba(242, 201, 76, 0.15);
	}

	.next-btn:active {
		transform: scale(0.97);
	}

	/* ─── Phase 4: Breathing ─── */
	.breath-container {
		width: 180px;
		height: 180px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 8px 0;
	}

	.night-breath-circle {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(242, 201, 76, 0.25) 0%, rgba(200, 170, 100, 0.1) 70%);
		border: 2px solid rgba(242, 201, 76, 0.2);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 4s ease-in-out;
	}

	.breath-glow {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: rgba(242, 201, 76, 0.35);
		box-shadow: 0 0 20px rgba(242, 201, 76, 0.3), 0 0 40px rgba(242, 201, 76, 0.1);
		animation: glow-pulse 3s ease-in-out infinite;
	}

	@keyframes glow-pulse {
		0%, 100% { opacity: 0.6; }
		50% { opacity: 1; }
	}

	.breath-count {
		font-size: 0.85rem;
		color: rgba(245, 235, 216, 0.4);
		font-variant-numeric: tabular-nums;
	}

	/* ─── Phase 5: Goodnight ─── */
	.goodnight-screen {
		gap: 12px;
	}

	.goodnight-decorations {
		font-size: 1.5rem;
		letter-spacing: 0.3em;
		opacity: 0.7;
		animation: fadeIn 1.2s ease-out;
	}

	.ember-sleepy {
		font-size: 4rem;
		display: block;
		animation: moon-rise 1.2s ease-out;
		filter: drop-shadow(0 0 20px rgba(242, 201, 76, 0.25));
	}

	@keyframes moon-rise {
		from { transform: translateY(20px) scale(0.8); opacity: 0; }
		to { transform: translateY(0) scale(1); opacity: 1; }
	}

	.goodnight-title {
		font-family: 'Fraunces', Georgia, serif;
		font-size: 1.8rem;
		font-weight: 600;
		color: #F5EBD8;
		margin: 0;
	}

	.goodnight-msg {
		font-size: 1rem;
		color: rgba(245, 235, 216, 0.5);
		margin: 0;
	}

	.done-btn {
		margin-top: 16px;
		padding: 14px 36px;
		border: none;
		border-radius: 999px;
		background: rgba(242, 201, 76, 0.18);
		color: #F2C94C;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
			background 0.2s ease, box-shadow 0.2s ease;
	}

	.done-btn:hover {
		transform: scale(1.05);
		background: rgba(242, 201, 76, 0.25);
		box-shadow: 0 4px 20px rgba(242, 201, 76, 0.15);
	}

	.done-btn:active {
		transform: scale(0.97);
	}

	/* ─── Animations ─── */
	.fade-in {
		animation: fadeIn 0.8s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(12px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
