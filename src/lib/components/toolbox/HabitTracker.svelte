<!-- HabitTracker.svelte — Full-screen habit tracker with streaks and weekly dots -->
<script lang="ts">
	import { appState } from '$lib/stores/app.svelte';
	import {
		getAllHabits,
		saveCustomHabit,
		deleteCustomHabit,
		logHabit,
		isHabitCompletedOn,
		getStreak,
		getWeekDots,
		getStreakMessage,
		getTodayStr,
		getDefaultHabits,
		MAX_HABITS,
		type HabitDefinition,
		type WeekDot,
	} from '$lib/services/habits';

	interface Props {
		open: boolean;
	}

	let { open = $bindable(false) }: Props = $props();

	// ─── Reactive Data ───
	let habits = $state<HabitDefinition[]>([]);
	let todayStr = $state(getTodayStr());
	let completions = $state<Record<string, boolean>>({});
	let streakCounts = $state<Record<string, number>>({});
	let weekDotsMap = $state<Record<string, WeekDot[]>>({});
	let refreshKey = $state(0);

	// ─── Add Habit Form ───
	let showAddForm = $state(false);
	let newHabitName = $state('');
	let newHabitEmoji = $state('');
	const emojiOptions = ['🧘', '📖', '💧', '🥗', '🎵', '✍️', '🚶', '🧹', '🌿', '☀️', '🎨', '🛏️'];

	// ─── Delete Confirm ───
	let confirmDeleteId = $state<string | null>(null);

	// ─── Ember Messages ───
	let emberMessage = $state('');
	const EMBER_MESSAGES = [
		"You're building something real 🔥",
		'Every little bit counts 🌱',
		'Look at you go! ✨',
		'Proud of you for showing up 🧡',
		'One step at a time — you got this 💛',
		"That's the spirit! 🌿",
		'Small wins add up 🌻',
	];

	let previousEmberState = '';
	let previousEmberMessage = '';

	const defaultIds = new Set(getDefaultHabits().map(h => h.id));

	// ─── Load Data ───
	function loadData() {
		todayStr = getTodayStr();
		habits = getAllHabits();
		const comps: Record<string, boolean> = {};
		const strs: Record<string, number> = {};
		const dots: Record<string, WeekDot[]> = {};
		for (const h of habits) {
			comps[h.id] = isHabitCompletedOn(h.id, todayStr);
			strs[h.id] = getStreak(h.id);
			dots[h.id] = getWeekDots(h.id);
		}
		completions = comps;
		streakCounts = strs;
		weekDotsMap = dots;
	}

	$effect(() => {
		if (open) {
			void refreshKey;
			loadData();
			emberMessage = '';
			previousEmberState = appState.emberState;
			previousEmberMessage = appState.emberMessage;
			appState.emberState = 'happy';
			appState.emberMessage = "Let's see how you're doing! 🌿";
		}
	});

	// ─── Derived ───
	let totalCompletedToday = $derived(
		Object.values(completions).filter(Boolean).length
	);
	let canAddMore = $derived(habits.length < MAX_HABITS);

	// ─── Actions ───
	function toggleHabit(habitId: string) {
		const wasComplete = completions[habitId];
		logHabit(habitId, todayStr, !wasComplete);
		if (!wasComplete) {
			emberMessage = EMBER_MESSAGES[Math.floor(Math.random() * EMBER_MESSAGES.length)];
			appState.emberMessage = emberMessage;
		}
		refreshKey++;
	}

	function addHabit() {
		if (getAllHabits().length >= MAX_HABITS) return;
		const name = newHabitName.trim();
		if (!name || !newHabitEmoji) return;
		const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
		saveCustomHabit({ id, name, emoji: newHabitEmoji });
		newHabitName = '';
		newHabitEmoji = '';
		showAddForm = false;
		emberMessage = 'New habit! Love to see it 🌟';
		appState.emberMessage = emberMessage;
		refreshKey++;
	}

	function removeHabit(habitId: string) {
		deleteCustomHabit(habitId);
		confirmDeleteId = null;
		refreshKey++;
	}

	function close() {
		showAddForm = false;
		confirmDeleteId = null;
		appState.emberState = previousEmberState as typeof appState.emberState;
		appState.emberMessage = previousEmberMessage;
		open = false;
	}
</script>

{#if open}
<div class="habit-overlay">
	<button class="close-btn" onclick={close} aria-label="Close">✕</button>

	<div class="habit-content fade-in">
		<!-- Header -->
		<div class="header-section">
			<span class="header-emoji">🌿</span>
			<h2 class="header-title">Habit Garden</h2>
			<p class="header-sub">Small steps, growing roots</p>
		</div>

		<!-- Today summary -->
		{#if totalCompletedToday > 0}
			<div class="today-summary">
				<span class="summary-flame">🔥</span>
				<span class="summary-text">
					{totalCompletedToday} of {habits.length} done today
				</span>
			</div>
		{/if}

		<!-- Ember message -->
		{#if emberMessage}
			<div class="ember-bubble fade-in">
				<span class="ember-icon">🔥</span>
				<p class="ember-text">{emberMessage}</p>
			</div>
		{/if}

		<!-- Day labels row -->
		{#if habits.length > 0}
			{@const sampleDots = weekDotsMap[habits[0]?.id] ?? []}
			<div class="day-labels-row">
				<div class="day-labels-spacer"></div>
				<div class="day-labels">
					{#each sampleDots as dot}
						<span class="day-label" class:today-label={dot.date === todayStr}>
							{dot.dayLabel.charAt(0)}
						</span>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Habit rows -->
		<div class="habits-list">
			{#each habits as habit (habit.id)}
				{@const completed = completions[habit.id]}
				{@const streak = streakCounts[habit.id] ?? 0}
				{@const dots = weekDotsMap[habit.id] ?? []}
				{@const isCustom = !defaultIds.has(habit.id)}

				<div class="habit-row" class:completed>
					<!-- Top: toggle + streak -->
					<div class="habit-top">
						<button class="habit-toggle" onclick={() => toggleHabit(habit.id)} aria-label="Toggle {habit.name}">
							<span class="habit-check" class:checked={completed}>
								{#if completed}✓{/if}
							</span>
							<span class="habit-emoji">{habit.emoji}</span>
							<span class="habit-name">{habit.name}</span>
						</button>

						<div class="habit-meta">
							<span class="streak-badge" class:active={streak > 0}>
								{getStreakMessage(streak)}
							</span>
							{#if isCustom}
								{#if confirmDeleteId === habit.id}
									<button class="delete-confirm" onclick={() => removeHabit(habit.id)} aria-label="Confirm remove {habit.name}">Remove?</button>
									<button class="delete-cancel" onclick={() => confirmDeleteId = null} aria-label="Cancel remove">✕</button>
								{:else}
									<button class="delete-btn" onclick={() => confirmDeleteId = habit.id} aria-label="Remove {habit.name}">×</button>
								{/if}
							{/if}
						</div>
					</div>

					<!-- Weekly dots -->
					<div class="week-dots">
						{#each dots as dot}
							<div class="dot-col">
								<span
									class="dot"
									class:filled={dot.completed}
									class:today={dot.date === todayStr}
								></span>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>

		<!-- Add Habit -->
		{#if showAddForm}
			<div class="add-form fade-in">
				<h3 class="add-title">New habit</h3>
				<div class="emoji-picker">
					{#each emojiOptions as em}
						<button
							class="emoji-option"
							class:selected={newHabitEmoji === em}
							onclick={() => newHabitEmoji = em}
							aria-label="Select emoji {em}"
						>{em}</button>
					{/each}
				</div>
				<input
					class="name-input"
					type="text"
					placeholder="Habit name..."
					bind:value={newHabitName}
					maxlength={40}
					onkeydown={(e) => { if (e.key === 'Enter') addHabit(); }}
				/>
				<div class="add-actions">
					<button class="cancel-btn" onclick={() => { showAddForm = false; newHabitName = ''; newHabitEmoji = ''; }}>
						Cancel
					</button>
					<button
						class="confirm-btn"
						disabled={!newHabitName.trim() || !newHabitEmoji}
						onclick={addHabit}
					>
						Add habit 🌱
					</button>
				</div>
			</div>
		{:else if canAddMore}
			<button class="add-trigger" onclick={() => showAddForm = true}>
				<span class="add-icon">+</span>
				<span>Add a habit</span>
			</button>
		{:else}
			<p class="max-hint">Maximum {MAX_HABITS} habits reached</p>
		{/if}

		<!-- All done celebration -->
		{#if habits.length > 0 && totalCompletedToday === habits.length}
			<div class="all-done fade-in">
				<span class="done-emoji">🎉</span>
				<p class="done-text">All habits complete! You're on fire today.</p>
				<p class="done-ember">— Ember 🔥</p>
			</div>
		{/if}
	</div>
</div>
{/if}

<style>
	/* ─── Overlay ─── */
	.habit-overlay {
		position: fixed;
		inset: 0;
		z-index: 50;
		background: #F5EBD8;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
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

	/* ─── Content ─── */
	.habit-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		padding: 48px 20px 60px;
		max-width: 520px;
		width: 100%;
	}

	/* ─── Header ─── */
	.header-section {
		text-align: center;
		margin-bottom: 4px;
	}
	.header-emoji {
		font-size: 2.2rem;
		display: block;
		margin-bottom: 8px;
	}
	.header-title {
		font-family: 'Fraunces', Georgia, serif;
		font-size: 1.5rem;
		font-weight: 700;
		color: #5C4D3C;
		margin: 0 0 4px;
		letter-spacing: -0.02em;
	}
	.header-sub {
		font-size: 0.85rem;
		color: rgba(92, 77, 60, 0.5);
		margin: 0;
	}

	/* ─── Today Summary ─── */
	.today-summary {
		display: flex;
		align-items: center;
		gap: 8px;
		background: rgba(232, 148, 90, 0.1);
		border: 1px solid rgba(232, 148, 90, 0.18);
		border-radius: 16px 12px 18px 14px;
		padding: 8px 16px;
	}
	.summary-flame { font-size: 1.1rem; }
	.summary-text {
		font-size: 0.85rem;
		font-weight: 600;
		color: #5C4D3C;
	}

	/* ─── Ember Bubble ─── */
	.ember-bubble {
		display: flex;
		gap: 10px;
		align-items: flex-start;
		background: rgba(232, 148, 90, 0.08);
		border: 1px solid rgba(232, 148, 90, 0.15);
		border-radius: 16px 16px 16px 4px;
		padding: 10px 14px;
		width: 100%;
	}
	.ember-icon { font-size: 1rem; flex-shrink: 0; margin-top: 1px; }
	.ember-text {
		font-size: 0.85rem;
		color: #5C4D3C;
		line-height: 1.5;
		font-style: italic;
		margin: 0;
	}

	/* ─── Day Labels Row ─── */
	.day-labels-row {
		display: flex;
		align-items: center;
		width: 100%;
		padding: 0 16px;
	}
	.day-labels-spacer {
		flex: 1;
	}
	.day-labels {
		display: flex;
		justify-content: space-between;
		width: 154px;
		flex-shrink: 0;
	}
	.day-label {
		width: 18px;
		text-align: center;
		font-size: 0.6rem;
		font-weight: 600;
		color: rgba(92, 77, 60, 0.35);
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}
	.today-label {
		color: #E8945A;
	}

	/* ─── Habit List ─── */
	.habits-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
		width: 100%;
	}

	.habit-row {
		background: rgba(255, 255, 255, 0.5);
		border: 1.5px solid rgba(92, 77, 60, 0.06);
		border-radius: 16px 12px 18px 14px;
		padding: 12px 16px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		transition: background 0.2s ease, border-color 0.2s ease;
	}

	.habit-row.completed {
		background: rgba(139, 175, 124, 0.1);
		border-color: rgba(139, 175, 124, 0.2);
	}

	/* ─── Habit Top (toggle + meta) ─── */
	.habit-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.habit-toggle {
		display: flex;
		align-items: center;
		gap: 10px;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		flex: 1;
		min-width: 0;
		-webkit-tap-highlight-color: transparent;
	}

	.habit-check {
		width: 26px;
		height: 26px;
		border-radius: 8px;
		border: 2px solid rgba(92, 77, 60, 0.15);
		background: rgba(92, 77, 60, 0.03);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.75rem;
		color: transparent;
		transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
		flex-shrink: 0;
	}

	.habit-check.checked {
		background: #8BAF7C;
		border-color: #8BAF7C;
		color: white;
		transform: scale(1.05);
	}

	.habit-emoji {
		font-size: 1.15rem;
		line-height: 1;
	}

	.habit-name {
		font-size: 0.9rem;
		font-weight: 600;
		color: #5C4D3C;
		text-align: left;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* ─── Habit Meta (streak + delete) ─── */
	.habit-meta {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-shrink: 0;
	}

	.streak-badge {
		font-size: 0.7rem;
		color: rgba(92, 77, 60, 0.4);
		white-space: nowrap;
		padding: 2px 8px;
		border-radius: 12px;
		background: rgba(92, 77, 60, 0.05);
	}

	.streak-badge.active {
		color: #E8945A;
		background: rgba(232, 148, 90, 0.1);
	}

	.delete-btn {
		background: none;
		border: none;
		color: rgba(92, 77, 60, 0.25);
		font-size: 1.2rem;
		cursor: pointer;
		padding: 2px 4px;
		line-height: 1;
		transition: color 0.2s ease;
	}
	.delete-btn:hover {
		color: rgba(200, 80, 80, 0.6);
	}

	.delete-confirm {
		background: rgba(200, 80, 80, 0.1);
		border: 1px solid rgba(200, 80, 80, 0.25);
		border-radius: 8px;
		color: #C45050;
		font-size: 0.68rem;
		font-weight: 600;
		padding: 3px 10px;
		cursor: pointer;
		transition: background 0.15s ease;
	}
	.delete-confirm:hover {
		background: rgba(200, 80, 80, 0.18);
	}

	.delete-cancel {
		background: none;
		border: none;
		color: rgba(92, 77, 60, 0.35);
		font-size: 0.85rem;
		cursor: pointer;
		padding: 2px 4px;
	}

	/* ─── Week Dots ─── */
	.week-dots {
		display: flex;
		justify-content: flex-end;
		gap: 4px;
	}

	.dot-col {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.dot {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: rgba(92, 77, 60, 0.06);
		border: 1.5px solid rgba(92, 77, 60, 0.1);
		transition: all 0.2s ease;
	}

	.dot.filled {
		background: #8BAF7C;
		border-color: #8BAF7C;
		box-shadow: 0 1px 4px rgba(139, 175, 124, 0.3);
	}

	.dot.today {
		border-color: rgba(232, 148, 90, 0.45);
		box-shadow: 0 0 0 2px rgba(232, 148, 90, 0.12);
	}

	.dot.today.filled {
		border-color: #8BAF7C;
		box-shadow: 0 0 0 2px rgba(232, 148, 90, 0.12), 0 1px 4px rgba(139, 175, 124, 0.3);
	}

	/* ─── Add Habit ─── */
	.add-trigger {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 100%;
		padding: 12px 20px;
		border: 2px dashed rgba(92, 77, 60, 0.12);
		border-radius: 16px 12px 18px 14px;
		background: transparent;
		color: rgba(92, 77, 60, 0.45);
		font-size: 0.88rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
	}
	.add-trigger:hover {
		border-color: rgba(139, 175, 124, 0.3);
		color: #5C4D3C;
		background: rgba(139, 175, 124, 0.04);
	}
	.add-icon {
		font-size: 1.1rem;
		font-weight: 400;
	}

	.add-form {
		display: flex;
		flex-direction: column;
		gap: 12px;
		width: 100%;
		background: rgba(255, 255, 255, 0.5);
		border: 1.5px solid rgba(92, 77, 60, 0.08);
		border-radius: 16px 12px 18px 14px;
		padding: 16px;
	}

	.add-title {
		font-family: 'Fraunces', Georgia, serif;
		font-size: 1rem;
		font-weight: 600;
		color: #5C4D3C;
		margin: 0;
	}

	.emoji-picker {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.emoji-option {
		width: 44px;
		height: 44px;
		border: 1.5px solid rgba(92, 77, 60, 0.1);
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.5);
		font-size: 1.1rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s ease;
	}
	.emoji-option:hover {
		background: rgba(92, 77, 60, 0.06);
		border-color: rgba(92, 77, 60, 0.2);
	}
	.emoji-option.selected {
		border-color: #8BAF7C;
		background: rgba(139, 175, 124, 0.12);
		transform: scale(1.1);
	}

	.name-input {
		width: 100%;
		padding: 10px 14px;
		border: 1.5px solid rgba(92, 77, 60, 0.12);
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.7);
		font-family: inherit;
		font-size: 0.9rem;
		color: #5C4D3C;
		outline: none;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}
	.name-input::placeholder {
		color: rgba(92, 77, 60, 0.3);
	}
	.name-input:focus {
		border-color: rgba(139, 175, 124, 0.4);
		box-shadow: 0 0 0 3px rgba(139, 175, 124, 0.08);
	}

	.add-actions {
		display: flex;
		gap: 8px;
		justify-content: flex-end;
	}

	.cancel-btn {
		border: none;
		border-radius: 10px;
		padding: 8px 16px;
		font-size: 0.82rem;
		font-weight: 600;
		background: transparent;
		color: rgba(92, 77, 60, 0.5);
		cursor: pointer;
		font-family: inherit;
		transition: background 0.2s ease;
	}
	.cancel-btn:hover {
		background: rgba(92, 77, 60, 0.06);
	}

	.confirm-btn {
		border: none;
		border-radius: 10px;
		padding: 8px 16px;
		font-size: 0.82rem;
		font-weight: 600;
		background: #8BAF7C;
		color: white;
		cursor: pointer;
		font-family: inherit;
		transition: all 0.2s ease;
	}
	.confirm-btn:hover:not(:disabled) {
		background: #7CA06D;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(139, 175, 124, 0.3);
	}
	.confirm-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	/* ─── Max Hint ─── */
	.max-hint {
		font-size: 0.75rem;
		color: rgba(92, 77, 60, 0.4);
		text-align: center;
		padding: 8px;
	}

	/* ─── All Done ─── */
	.all-done {
		text-align: center;
		padding: 16px;
	}
	.done-emoji {
		font-size: 2rem;
		display: block;
		margin-bottom: 8px;
	}
	.done-text {
		font-size: 0.95rem;
		color: #5C4D3C;
		margin: 0 0 4px;
		font-weight: 600;
	}
	.done-ember {
		font-size: 0.82rem;
		color: #E8945A;
		font-style: italic;
		margin: 0;
	}

	/* ─── Animations ─── */
	.fade-in {
		animation: fadeIn 0.4s ease-out;
	}
	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(8px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
