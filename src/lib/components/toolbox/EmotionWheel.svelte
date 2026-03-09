<!-- EmotionWheel.svelte — Emotion exploration tool styled as a flower garden -->
<script lang="ts">
	import { appState } from '$lib/stores/app.svelte';

	interface Props {
		open: boolean;
	}

	let { open = $bindable(false) }: Props = $props();

	type Mode = 'pick' | 'history';
	type Phase = 'garden' | 'sub' | 'reflect' | 'saved';

	interface EmotionEntry {
		emotion: string;
		subEmotion: string;
		note?: string;
		timestamp: string;
	}

	interface PrimaryEmotion {
		label: string;
		emoji: string;
		color: string;
		bg: string;
		glow: string;
		subs: string[];
		emberLine: string;
	}

	const flowers: PrimaryEmotion[] = [
		{
			label: 'Happy',
			emoji: '🌻',
			color: '#E8945A',
			bg: 'rgba(232, 148, 90, 0.12)',
			glow: 'rgba(232, 148, 90, 0.3)',
			subs: ['Joyful', 'Content', 'Grateful', 'Excited', 'Proud'],
			emberLine: 'Your joy is like sunshine warming the garden 🌻',
		},
		{
			label: 'Sad',
			emoji: '🌧️',
			color: '#9EC5D6',
			bg: 'rgba(158, 197, 214, 0.15)',
			glow: 'rgba(158, 197, 214, 0.3)',
			subs: ['Lonely', 'Disappointed', 'Grieving', 'Homesick', 'Overwhelmed'],
			emberLine: "Rain helps the garden grow. I'm here with you 🌧️",
		},
		{
			label: 'Angry',
			emoji: '🌹',
			color: '#E88A8A',
			bg: 'rgba(232, 138, 138, 0.12)',
			glow: 'rgba(232, 138, 138, 0.3)',
			subs: ['Frustrated', 'Irritated', 'Resentful', 'Hurt', 'Impatient'],
			emberLine: 'Even roses have thorns. Your feelings are valid 🌹',
		},
		{
			label: 'Anxious',
			emoji: '🍃',
			color: '#98BF82',
			bg: 'rgba(152, 191, 130, 0.12)',
			glow: 'rgba(152, 191, 130, 0.3)',
			subs: ['Worried', 'Restless', 'Uncertain', 'Panicky', 'Scattered'],
			emberLine: "Like leaves in the wind — let's find your still center 🍃",
		},
		{
			label: 'Calm',
			emoji: '🪻',
			color: '#B5A0D1',
			bg: 'rgba(181, 160, 209, 0.12)',
			glow: 'rgba(181, 160, 209, 0.3)',
			subs: ['Peaceful', 'Grounded', 'Hopeful', 'Relaxed', 'Safe'],
			emberLine: "A peaceful garden moment. I'm glad you're here 🪻",
		},
		{
			label: 'Tired',
			emoji: '🌙',
			color: '#5C4D3C',
			bg: 'rgba(92, 77, 60, 0.10)',
			glow: 'rgba(92, 77, 60, 0.2)',
			subs: ['Drained', 'Burnt out', 'Sleepy', 'Foggy', 'Unmotivated'],
			emberLine: 'Rest is part of growing. Be gentle with yourself 🌙',
		},
	];

	let savedTimer: ReturnType<typeof setTimeout> | null = null;

	let mode = $state<Mode>('pick');
	let phase = $state<Phase>('garden');
	let picked = $state<PrimaryEmotion | null>(null);
	let pickedSub = $state<string | null>(null);
	let reflectionNote = $state('');
	let entries = $state<EmotionEntry[]>(loadEntries());

	function loadEntries(): EmotionEntry[] {
		try {
			const raw = localStorage.getItem('burrow-emotions');
			if (raw) return JSON.parse(raw);
		} catch { /* ignore corrupt data */ }
		return [];
	}

	function persist() {
		try {
			localStorage.setItem('burrow-emotions', JSON.stringify(entries));
		} catch { /* storage full */ }
	}

	function pickPrimary(flower: PrimaryEmotion) {
		picked = flower;
		pickedSub = null;
		reflectionNote = '';
		phase = 'sub';
	}

	function pickSub(sub: string) {
		pickedSub = sub;
		phase = 'reflect';
	}

	function goBack() {
		if (phase === 'reflect') {
			phase = 'sub';
			pickedSub = null;
			reflectionNote = '';
		} else if (phase === 'sub') {
			phase = 'garden';
			picked = null;
		}
	}

	function saveEntry() {
		if (!picked || !pickedSub) return;
		const entry: EmotionEntry = {
			emotion: picked.label,
			subEmotion: pickedSub,
			note: reflectionNote.trim() || undefined,
			timestamp: new Date().toISOString(),
		};
		entries = [entry, ...entries].slice(0, 100);
		persist();
		appState.emberMessage = picked.emberLine;
		phase = 'saved';
		savedTimer = setTimeout(() => { open = false; savedTimer = null; }, 2800);
	}

	function reset() {
		if (savedTimer) { clearTimeout(savedTimer); savedTimer = null; }
		phase = 'garden';
		picked = null;
		pickedSub = null;
		reflectionNote = '';
		mode = 'pick';
	}

	// Reset on open, cleanup on unmount
	$effect(() => {
		if (open) reset();
		return () => {
			if (savedTimer) { clearTimeout(savedTimer); savedTimer = null; }
		};
	});

	function emojiFor(label: string): string {
		return flowers.find((f) => f.label === label)?.emoji ?? '🌱';
	}

	function colorFor(label: string): string {
		return flowers.find((f) => f.label === label)?.color ?? '#78716C';
	}

	function formatTime(iso: string): string {
		const d = new Date(iso);
		const now = new Date();
		const ms = now.getTime() - d.getTime();
		if (ms < 60_000) return 'Just now';
		if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`;
		if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h ago`;
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}

	const sevenDaysAgo = $derived(new Date(Date.now() - 7 * 86_400_000).toISOString());
	const recentEntries = $derived(entries.filter((e) => e.timestamp >= sevenDaysAgo));
</script>

{#if open}
<div class="emotion-overlay">
	<button class="close-btn" onclick={() => (open = false)} aria-label="Close">✕</button>

	<div class="emotion-content">
		<!-- Mode toggle -->
		<div class="mode-toggle">
			<button class="toggle-btn" class:active={mode === 'pick'} onclick={() => (mode = 'pick')}>
				🌱 Pick
			</button>
			<button class="toggle-btn" class:active={mode === 'history'} onclick={() => (mode = 'history')}>
				📖 History
			</button>
		</div>

		{#if mode === 'pick'}
			<h2 class="garden-title">What's blooming in your garden today?</h2>

			{#if phase === 'garden'}
				<div class="flower-grid fade-in">
					{#each flowers as flower, i}
						<button
							class="flower-card"
							style="--fc: {flower.color}; --fbg: {flower.bg}; --fglow: {flower.glow}; animation-delay: {i * 60}ms"
							onclick={() => pickPrimary(flower)}
						>
							<span class="flower-emoji">{flower.emoji}</span>
							<span class="flower-name">{flower.label}</span>
						</button>
					{/each}
				</div>

			{:else if phase === 'sub' && picked}
				<div class="sub-phase fade-in">
					<button class="back-link" onclick={goBack}>← Back to garden</button>

					<div class="picked-display" style="--fc: {picked.color}; --fglow: {picked.glow}">
						<span class="picked-emoji">{picked.emoji}</span>
						<span class="picked-name">{picked.label}</span>
					</div>

					<p class="sub-prompt">What does it feel like, more specifically?</p>

					<div class="petal-ring">
						{#each picked.subs as sub, i}
							<button
								class="petal-btn"
								style="--fc: {picked.color}; --fbg: {picked.bg}; --fglow: {picked.glow}; animation-delay: {i * 70}ms"
								onclick={() => pickSub(sub)}
							>
								{sub}
							</button>
						{/each}
					</div>
				</div>

			{:else if phase === 'reflect' && picked && pickedSub}
				<div class="reflect-phase fade-in">
					<button class="back-link" onclick={goBack}>← Back</button>

					<div class="reflect-header" style="--fc: {picked.color}; --fglow: {picked.glow}">
						<span class="reflect-emoji">{picked.emoji}</span>
						<p class="reflect-feeling">
							Feeling <strong style="color: {picked.color}">{pickedSub}</strong>
						</p>
					</div>

					<label class="reflect-label" for="reflect-input">
						What's making you feel {pickedSub.toLowerCase()}? <span class="optional">(optional)</span>
					</label>
					<textarea
						id="reflect-input"
						class="reflect-textarea"
						placeholder="A few words, or skip this..."
						rows="3"
						maxlength="300"
						bind:value={reflectionNote}
					></textarea>

					<button
						class="save-btn"
						style="--fc: {picked.color}"
						onclick={saveEntry}
					>
						Plant this feeling 🌱
					</button>
				</div>

			{:else if phase === 'saved' && picked}
				<div class="saved-phase fade-in">
					<span class="saved-bloom">{picked.emoji}</span>
					<p class="saved-name">{pickedSub}</p>
					<p class="saved-line">{picked.emberLine}</p>
				</div>
			{/if}

		{:else}
			<!-- History mode -->
			<h2 class="garden-title">Your garden this week</h2>

			{#if recentEntries.length === 0}
				<div class="empty-garden fade-in">
					<span class="empty-emoji">🌱</span>
					<p class="empty-text">No blooms yet this week. Check in with yourself anytime.</p>
				</div>
			{:else}
				<div class="history-list fade-in">
					{#each recentEntries as entry}
						<div class="history-row">
							<span class="history-emoji">{emojiFor(entry.emotion)}</span>
							<div class="history-info">
								<span class="history-sub" style="color: {colorFor(entry.emotion)}">{entry.subEmotion}</span>
								{#if entry.note}
									<span class="history-note">{entry.note}</span>
								{/if}
								<span class="history-when">{formatTime(entry.timestamp)}</span>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		{/if}
	</div>
</div>
{/if}

<style>
	.emotion-overlay {
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

	.emotion-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
		padding: 32px 24px 48px;
		max-width: 480px;
		width: 100%;
	}

	/* ─── Mode Toggle ─── */
	.mode-toggle {
		display: flex;
		gap: 4px;
		background: rgba(92, 77, 60, 0.06);
		border-radius: 999px;
		padding: 4px;
	}
	.toggle-btn {
		padding: 8px 20px;
		border: none;
		border-radius: 999px;
		background: transparent;
		font-size: 0.85rem;
		font-weight: 500;
		color: #78716C;
		cursor: pointer;
		transition: all 0.2s ease;
	}
	.toggle-btn.active {
		background: white;
		color: #44403C;
		font-weight: 600;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
	}

	.garden-title {
		font-family: 'Fraunces', Georgia, serif;
		font-size: 1.45rem;
		font-weight: 600;
		color: #44403C;
		text-align: center;
		letter-spacing: -0.02em;
		line-height: 1.3;
	}

	/* ─── Flower Grid ─── */
	.flower-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 14px;
		width: 100%;
		max-width: 340px;
	}

	.flower-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 22px 14px;
		border: 2px solid var(--fbg);
		border-radius: 20px 24px 18px 22px;
		background: white;
		cursor: pointer;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
		transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
			box-shadow 0.25s ease, border-color 0.25s ease;
		animation: sprout 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
	}
	.flower-card:hover {
		transform: translateY(-3px) scale(1.03);
		box-shadow: 0 8px 24px var(--fglow);
		border-color: var(--fc);
	}
	.flower-card:active {
		transform: translateY(0) scale(0.97);
	}
	.flower-emoji {
		font-size: 2.4rem;
		line-height: 1;
	}
	.flower-name {
		font-size: 0.92rem;
		font-weight: 600;
		color: #44403C;
	}

	/* ─── Sub-emotion Phase ─── */
	.sub-phase {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 18px;
		width: 100%;
		max-width: 400px;
	}

	.back-link {
		align-self: flex-start;
		background: none;
		border: none;
		color: #A8A29E;
		font-size: 0.85rem;
		font-weight: 500;
		cursor: pointer;
		padding: 2px 0;
		transition: color 0.2s ease;
	}
	.back-link:hover { color: #5C4D3C; }

	.picked-display {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		animation: bloom 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	.picked-emoji {
		font-size: 3.2rem;
		line-height: 1;
		filter: drop-shadow(0 4px 12px var(--fglow));
	}
	.picked-name {
		font-size: 1.05rem;
		font-weight: 700;
		color: var(--fc);
	}

	.sub-prompt {
		font-size: 0.88rem;
		color: #78716C;
		text-align: center;
	}

	.petal-ring {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 10px;
		width: 100%;
	}

	.petal-btn {
		padding: 10px 18px;
		border: 1.5px solid rgba(92, 77, 60, 0.1);
		border-radius: 18px 22px 16px 20px;
		background: white;
		font-size: 0.86rem;
		font-weight: 500;
		color: #57534E;
		cursor: pointer;
		animation: sprout 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
		transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	.petal-btn:hover {
		border-color: var(--fc);
		color: var(--fc);
		transform: scale(1.06);
		box-shadow: 0 4px 14px var(--fglow);
	}

	/* ─── Reflect Phase ─── */
	.reflect-phase {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		width: 100%;
		max-width: 400px;
	}

	.reflect-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}
	.reflect-emoji {
		font-size: 2.8rem;
		line-height: 1;
		filter: drop-shadow(0 3px 10px var(--fglow));
	}
	.reflect-feeling {
		font-size: 1rem;
		color: #57534E;
	}

	.reflect-label {
		font-size: 0.88rem;
		color: #78716C;
		text-align: center;
		width: 100%;
	}
	.optional {
		font-size: 0.78rem;
		color: #A8A29E;
	}

	.reflect-textarea {
		width: 100%;
		padding: 14px 16px;
		border: 1.5px solid rgba(92, 77, 60, 0.12);
		border-radius: 14px;
		background: white;
		font-family: inherit;
		font-size: 0.9rem;
		color: #44403C;
		resize: none;
		outline: none;
		transition: border-color 0.2s ease;
		line-height: 1.5;
	}
	.reflect-textarea::placeholder { color: #C4B8A5; }
	.reflect-textarea:focus { border-color: rgba(92, 77, 60, 0.25); }

	.save-btn {
		margin-top: 4px;
		padding: 12px 32px;
		border: none;
		border-radius: 999px;
		background: var(--fc);
		color: white;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
			box-shadow 0.2s ease;
	}
	.save-btn:hover {
		transform: scale(1.05);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
	}
	.save-btn:active { transform: scale(0.97); }

	/* ─── Saved Phase ─── */
	.saved-phase {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		text-align: center;
		animation: bloom 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
		padding-top: 24px;
	}
	.saved-bloom { font-size: 4rem; line-height: 1; }
	.saved-name { font-size: 1.25rem; font-weight: 700; color: #44403C; }
	.saved-line {
		font-size: 0.92rem;
		color: #78716C;
		max-width: 280px;
		line-height: 1.5;
	}

	/* ─── History ─── */
	.history-list {
		width: 100%;
		max-width: 400px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.history-row {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 12px 14px;
		background: rgba(255, 255, 255, 0.55);
		border-radius: 14px 16px 12px 14px;
	}
	.history-emoji { font-size: 1.3rem; flex-shrink: 0; padding-top: 1px; }
	.history-info { display: flex; flex-direction: column; gap: 2px; }
	.history-sub { font-size: 0.88rem; font-weight: 600; }
	.history-note {
		font-size: 0.8rem;
		color: #78716C;
		line-height: 1.4;
	}
	.history-when { font-size: 0.72rem; color: #A8A29E; }

	.empty-garden {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		padding-top: 40px;
	}
	.empty-emoji { font-size: 2.5rem; }
	.empty-text {
		font-size: 0.9rem;
		color: #A8A29E;
		text-align: center;
		max-width: 260px;
		line-height: 1.5;
	}

	/* ─── Animations ─── */
	.fade-in { animation: fadeIn 0.35s ease-out; }

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(8px); }
		to { opacity: 1; transform: translateY(0); }
	}
	@keyframes bloom {
		from { opacity: 0; transform: scale(0.7); }
		to { opacity: 1; transform: scale(1); }
	}
	@keyframes sprout {
		from { opacity: 0; transform: scale(0.85) translateY(6px); }
		to { opacity: 1; transform: scale(1) translateY(0); }
	}
</style>
