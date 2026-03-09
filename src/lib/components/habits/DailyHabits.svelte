<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getAllHabits,
		isHabitCompletedOn,
		toggleHabit,
		getTodayStr,
		areAllHabitsCompletedToday,
		type HabitDefinition
	} from '$lib/services/habits';
	import { appState } from '$lib/stores/app.svelte';
	import { checkStickers } from '$lib/services/stickers';

	// ─── State ───
	let habits = $state<HabitDefinition[]>([]);
	let completions = $state<Record<string, boolean>>({});
	let mounted = $state(false);

	// ─── Load on mount (SSR guard) ───
	onMount(() => {
		habits = getAllHabits();
		const today = getTodayStr();
		const result: Record<string, boolean> = {};
		for (const h of habits) {
			result[h.id] = isHabitCompletedOn(h.id, today);
		}
		completions = result;
		mounted = true;
	});

	// ─── Toggle handler ───
	function handleToggle(habitId: string) {
		const today = getTodayStr();
		const newStatus = toggleHabit(habitId, today);
		completions = { ...completions, [habitId]: newStatus };

		// Celebrate when all habits are done
		if (areAllHabitsCompletedToday()) {
			appState.emberState = 'celebrating';
			appState.emberMessage = "All habits done! You're amazing! 🎉";
			// Check for sticker triggers (including first-all-habits-day)
			checkStickers();
		}
	}

	let visible = $derived(appState.checkedInToday && mounted && habits.length > 0);
</script>

{#if visible}
	<div class="daily-habits" role="group" aria-label="Daily habits">
		<div class="habits-row">
			{#each habits as habit (habit.id)}
				<button
					class="habit-pill"
					class:completed={completions[habit.id]}
					onclick={() => handleToggle(habit.id)}
					aria-pressed={completions[habit.id] ?? false}
					aria-label="{habit.emoji} {habit.name}: {completions[habit.id] ? 'completed' : 'not completed'}"
				>
					<span class="habit-emoji">{habit.emoji}</span>
					<span class="habit-label">{habit.name}</span>
				</button>
			{/each}
		</div>
	</div>
{/if}

<style>
	.daily-habits {
		position: fixed;
		bottom: 80px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 25;
		padding: 8px 12px;
		background: rgba(0, 0, 0, 0.3);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border-radius: 20px;
		max-width: fit-content;
	}

	.habits-row {
		display: flex;
		flex-direction: row;
		gap: 8px;
		overflow-x: auto;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.habits-row::-webkit-scrollbar {
		display: none;
	}

	.habit-pill {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 6px 12px;
		border: none;
		border-radius: 20px 18px 22px 16px;
		background: rgba(92, 77, 60, 0.15);
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.875rem;
		font-family: var(--font-display, system-ui, sans-serif);
		cursor: pointer;
		white-space: nowrap;
		transition:
			background 0.25s ease,
			color 0.25s ease,
			transform 0.15s ease;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
		flex-shrink: 0;
	}

	.habit-pill:hover {
		background: rgba(92, 77, 60, 0.25);
		transform: scale(1.03);
	}

	.habit-pill:active {
		transform: scale(0.97);
	}

	.habit-pill.completed {
		background: rgba(139, 175, 124, 0.85);
		color: rgba(255, 255, 255, 1);
	}

	.habit-emoji {
		font-size: 0.85rem;
		line-height: 1;
	}

	.habit-label {
		line-height: 1;
	}

	/* ─── Responsive ─── */
	@media (max-width: 480px) {
		.habits-row {
			gap: 6px;
		}

		.habit-pill {
			padding: 5px 10px;
			font-size: 0.875rem;
		}
	}
</style>
