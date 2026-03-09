<!-- BreathingExercise.svelte — Guided breathing circle with mood check -->
<script lang="ts">
	import { saveBreathingSession, getBreathingSessions } from '$lib/services/journal';

	interface Props {
		open: boolean;
	}

	let { open = $bindable(false) }: Props = $props();

	type Phase = 'pre-mood' | 'breathing' | 'post-mood' | 'complete';
	type Mood = '😫' | '😐' | '😌';

	let phase = $state<Phase>('pre-mood');
	let preMood = $state<Mood | null>(null);
	let postMood = $state<Mood | null>(null);
	let elapsed = $state(0);
	let timer: ReturnType<typeof setInterval> | null = null;
	let animating = $state(false);
	let pulsing = $state(false);
	let sessionRefresh = $state(0);
	let prevBreathPhase = $state<'inhale' | 'hold' | 'exhale' | null>(null);

	// Derived session count — re-evaluates when sessionRefresh changes
	let todaySessionCount = $derived.by(() => {
		void sessionRefresh;
		const today = new Date().toISOString().slice(0, 10);
		const sessions = getBreathingSessions();
		return sessions.filter(s => s.completedAt?.startsWith(today)).length;
	});

	// Breathing cycle phases derived from animation time
	let cyclePosition = $derived(elapsed % 12);
	let breathPhase = $derived<'inhale' | 'hold' | 'exhale'>(
		cyclePosition < 4 ? 'inhale' : cyclePosition < 8 ? 'hold' : 'exhale'
	);
	let breathLabel = $derived(
		breathPhase === 'inhale' ? 'Breathe in...' : breathPhase === 'hold' ? 'Hold...' : 'Breathe out...'
	);

	// Trigger pulse animation on breath phase change
	$effect(() => {
		if (prevBreathPhase !== null && breathPhase !== prevBreathPhase) {
			pulsing = true;
			setTimeout(() => { pulsing = false; }, 300);
		}
		prevBreathPhase = breathPhase;
	});

	function selectPreMood(mood: Mood) {
		preMood = mood;
		phase = 'breathing';
		startBreathing();
	}

	function startBreathing() {
		elapsed = 0;
		animating = true;
		timer = setInterval(() => {
			elapsed += 1;
		}, 1000);
	}

	function stopBreathing() {
		animating = false;
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
		phase = 'post-mood';
	}

	function selectPostMood(mood: Mood) {
		postMood = mood;
		if (preMood) {
			saveBreathingSession({
				durationSeconds: elapsed,
				preMood,
				postMood: mood,
				completedAt: new Date().toISOString(),
			});
		}
		phase = 'complete';
		// Bump refresh counter to re-derive session count
		sessionRefresh++;
		setTimeout(() => close(), 3500);
	}

	function close() {
		animating = false;
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
		phase = 'pre-mood';
		preMood = null;
		postMood = null;
		elapsed = 0;
		open = false;
	}

	function formatTime(s: number): string {
		const m = Math.floor(s / 60);
		const sec = s % 60;
		return `${m}:${sec.toString().padStart(2, '0')}`;
	}

	const moods: Mood[] = ['😫', '😐', '😌'];
	const moodValue: Record<Mood, number> = { '😫': 0, '😐': 1, '😌': 2 };

	let moodMessage = $derived.by(() => {
		if (!preMood || !postMood) return '';
		const diff = moodValue[postMood] - moodValue[preMood];
		if (diff > 0) return 'Nice improvement! 🌟';
		if (diff === 0) return 'Staying steady 💪';
		return "That's okay, every breath counts 💚";
	});

	// Cleanup on unmount
	$effect(() => {
		return () => {
			if (timer) clearInterval(timer);
		};
	});
</script>

{#if open}
	<div class="breathing-overlay">
		<!-- Particles ring -->
		<div class="particles-ring" class:animating>
			{#each Array(12) as _, i}
				<span class="particle" style="--i: {i}; --delay: {i * 0.3}s"></span>
			{/each}
		</div>

		{#if phase === 'pre-mood'}
			<div class="mood-check fade-in">
				{#if todaySessionCount > 0}
					<p class="session-count">Session {todaySessionCount + 1} today</p>
				{/if}
				<h2 class="mood-title">How do you feel right now?</h2>
				<div class="mood-options">
					{#each moods as mood}
						<button class="mood-btn" onclick={() => selectPreMood(mood)}>
							<span class="mood-emoji">{mood}</span>
						</button>
					{/each}
				</div>
			</div>
		{:else if phase === 'breathing'}
			<div class="breathing-content fade-in">
				<div class="circle-container">
					<div class="breath-circle" class:animating class:pulsing class:inhale={breathPhase === 'inhale'} class:hold={breathPhase === 'hold'} class:exhale={breathPhase === 'exhale'}></div>
				</div>
				<p class="breath-label">{breathLabel}</p>
				<p class="timer">{formatTime(elapsed)}</p>
				<button class="done-btn" onclick={stopBreathing}>Done</button>
			</div>
		{:else if phase === 'post-mood'}
			<div class="mood-check fade-in">
				<h2 class="mood-title">How do you feel now?</h2>
				<div class="mood-options">
					{#each moods as mood}
						<button class="mood-btn" onclick={() => selectPostMood(mood)}>
							<span class="mood-emoji">{mood}</span>
						</button>
					{/each}
				</div>
			</div>
		{:else if phase === 'complete'}
			<div class="complete fade-in">
				{#if preMood && postMood}
					<div class="mood-comparison">
						<span class="compare-mood">{preMood}</span>
						<span class="compare-arrow">→</span>
						<span class="compare-mood">{postMood}</span>
					</div>
					<p class="compare-sublabel">Before → After</p>
				{/if}
				<span class="complete-emoji">🌿</span>
				<p class="complete-msg">Well done. Take this calm with you.</p>
				{#if preMood && postMood}
					<p class="mood-result-msg">{moodMessage}</p>
				{/if}
			</div>
		{/if}

		<button class="close-btn" onclick={close} aria-label="Close">✕</button>
	</div>
{/if}

<style>
	.breathing-overlay {
		position: fixed;
		inset: 0;
		z-index: 60;
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

	/* Mood check screens */
	.mood-check {
		text-align: center;
	}

	.mood-title {
		font-family: var(--font-serif);
		font-size: 1.5rem;
		color: #5C4D3C;
		margin-bottom: 24px;
	}

	.mood-options {
		display: flex;
		gap: 20px;
		justify-content: center;
	}

	.mood-btn {
		width: 72px;
		height: 72px;
		border: 2px solid rgba(92, 77, 60, 0.15);
		background: rgba(255, 255, 255, 0.5);
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.2s ease, border-color 0.2s ease;
	}

	.mood-btn:active {
		transform: scale(0.92);
	}

	.mood-btn:hover {
		border-color: #E8945A;
	}

	.mood-emoji {
		font-size: 2rem;
	}

	/* Breathing content */
	.breathing-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
	}

	.circle-container {
		width: 200px;
		height: 200px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.breath-circle {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		background: #B5A0D1;
		transition: background 0.8s ease;
	}

	.breath-circle.animating {
		animation: breathe 12s ease-in-out infinite;
	}

	.breath-circle.inhale {
		background: #B5A0D1;
	}

	.breath-circle.hold {
		background: #98BF82;
	}

	.breath-circle.exhale {
		background: #9EC5D6;
	}

	@keyframes breathe {
		0%, 100% { transform: scale(0.6); }
		33.33% { transform: scale(1); }
		66.66% { transform: scale(1); }
	}

	/* Phase transition pulse */
	.breath-circle.pulsing {
		animation: breathe 12s ease-in-out infinite, phase-pulse 0.3s ease-out;
	}

	@keyframes phase-pulse {
		0% { box-shadow: 0 0 0 0 rgba(181, 160, 209, 0.6); }
		100% { box-shadow: 0 0 20px 10px rgba(181, 160, 209, 0); }
	}

	.breath-label {
		font-family: var(--font-serif);
		font-size: 1.3rem;
		color: #5C4D3C;
		margin: 0;
		min-height: 2em;
	}

	.timer {
		font-family: var(--font-sans);
		font-size: 0.9rem;
		color: rgba(92, 77, 60, 0.5);
		margin: 0;
	}

	.session-count {
		font-family: var(--font-sans);
		font-size: 0.85rem;
		color: rgba(92, 77, 60, 0.5);
		margin: 0 0 8px;
	}

	.done-btn {
		margin-top: 16px;
		padding: 12px 40px;
		border: none;
		border-radius: 12px 14px 10px 16px;
		background: #8BAF7C;
		color: white;
		font-family: var(--font-sans);
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		box-shadow: 0 4px 12px rgba(139, 175, 124, 0.3);
		transition: transform 0.15s ease;
	}

	.done-btn:active {
		transform: scale(0.97);
	}

	/* Particles ring */
	.particles-ring {
		position: absolute;
		width: 260px;
		height: 260px;
		pointer-events: none;
	}

	.particle {
		position: absolute;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: rgba(181, 160, 209, 0.4);
		top: 50%;
		left: 50%;
	}

	.particles-ring.animating .particle {
		animation: orbit 12s linear infinite, drift 4s ease-in-out infinite;
		animation-delay: var(--delay);
	}

	@keyframes orbit {
		from {
			transform: rotate(calc(var(--i) * 30deg)) translateX(120px) rotate(calc(var(--i) * -30deg));
		}
		to {
			transform: rotate(calc(var(--i) * 30deg + 360deg)) translateX(120px) rotate(calc(var(--i) * -30deg - 360deg));
		}
	}

	@keyframes drift {
		0%, 100% { opacity: 0.3; }
		50% { opacity: 0.7; }
	}

	/* Complete screen */
	.complete {
		text-align: center;
	}

	.complete-emoji {
		font-size: 3rem;
		display: block;
		margin-bottom: 12px;
		animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.complete-msg {
		font-family: var(--font-serif);
		font-size: 1.2rem;
		color: #5C4D3C;
		margin: 0;
	}

	.mood-comparison {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		font-size: 1.5rem;
		margin-bottom: 8px;
	}

	.compare-mood {
		font-size: 1.5rem;
	}

	.compare-arrow {
		font-size: 1.2rem;
		color: rgba(92, 77, 60, 0.4);
	}

	.compare-sublabel {
		font-size: 0.75rem;
		color: rgba(92, 77, 60, 0.4);
		margin: 0 0 8px;
		font-family: var(--font-sans);
	}

	.mood-result-msg {
		font-family: var(--font-serif);
		font-size: 1rem;
		color: #8BAF7C;
		margin: 14px 0 0;
		animation: fade-in 0.5s ease 0.6s both;
	}

	/* Shared animations */
	.fade-in {
		animation: fade-in 0.4s ease forwards;
	}

	@keyframes fade-in {
		from { opacity: 0; transform: translateY(12px); }
		to { opacity: 1; transform: translateY(0); }
	}

	@keyframes pop-in {
		from { transform: scale(0); opacity: 0; }
		to { transform: scale(1); opacity: 1; }
	}
</style>
