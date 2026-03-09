<!-- HabitToggles.svelte — Daily habit toggle cards with satisfying switches -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { getAllHabits, isHabitCompletedOn, getTodayStr } from '$lib/services/habits';

	interface Props {
		completed: Record<string, boolean>;
		onskip?: () => void;
	}

	let { completed = $bindable<Record<string, boolean>>({}), onskip }: Props = $props();

	let habits: { id: string; emoji: string; label: string }[] = $state([]);

	onMount(() => {
		const today = getTodayStr();
		const allHabits = getAllHabits();
		habits = allHabits.map((h) => ({ id: h.id, emoji: h.emoji, label: h.name }));

		// Pre-populate with today's logged values from the habits service
		const initial: Record<string, boolean> = {};
		for (const h of allHabits) {
			initial[h.id] = isHabitCompletedOn(h.id, today);
		}
		// Merge: keep any already-set values, fill in from service
		completed = { ...initial, ...completed };
	});

	function toggle(id: string) {
		completed = { ...completed, [id]: !completed[id] };
	}
</script>

<div class="habit-toggles">
	<h3 class="heading">Anything you did today?</h3>
	<p class="hint">Optional — skip if you like</p>

	<div class="habits">
		{#each habits as habit}
			<button
				class="habit-card"
				class:active={completed[habit.id]}
				onclick={() => toggle(habit.id)}
			>
				<span class="habit-info">
					<span class="emoji">{habit.emoji}</span>
					<span class="label">{habit.label}</span>
				</span>
				<span class="toggle-track" class:on={completed[habit.id]}>
					<span class="toggle-thumb"></span>
				</span>
			</button>
		{/each}
	</div>

	{#if onskip}
		<button class="skip-link" onclick={onskip}>
			Skip this step
		</button>
	{/if}
</div>

<style>
	.habit-toggles {
		text-align: center;
	}

	.heading {
		font-family: var(--font-serif);
		font-size: 1.25rem;
		color: #5C4D3C;
		margin: 0 0 4px;
		font-weight: 600;
	}

	.hint {
		font-family: var(--font-sans);
		font-size: 0.75rem;
		color: rgba(92, 77, 60, 0.5);
		margin: 0 0 16px;
	}

	.habits {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.habit-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		border: 2px solid transparent;
		border-radius: 12px 14px 10px 16px;
		background: rgba(92, 77, 60, 0.05);
		cursor: pointer;
		transition: background 0.2s ease, border-color 0.2s ease;
		-webkit-tap-highlight-color: transparent;
	}

	.habit-card.active {
		background: rgba(139, 175, 124, 0.12);
		border-color: rgba(139, 175, 124, 0.3);
	}

	.habit-info {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.emoji {
		font-size: 1.2rem;
		line-height: 1;
	}

	.label {
		font-family: var(--font-sans);
		font-size: 0.85rem;
		font-weight: 600;
		color: #5C4D3C;
	}

	.toggle-track {
		width: 44px;
		height: 26px;
		border-radius: 13px;
		background: rgba(92, 77, 60, 0.15);
		position: relative;
		transition: background 0.25s ease;
		flex-shrink: 0;
	}

	.toggle-track.on {
		background: #8BAF7C;
	}

	.toggle-thumb {
		position: absolute;
		top: 3px;
		left: 3px;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: white;
		box-shadow: 0 1px 4px rgba(92, 77, 60, 0.2);
		transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.toggle-track.on .toggle-thumb {
		transform: translateX(18px);
	}

	.skip-link {
		display: inline-block;
		margin-top: 16px;
		padding: 8px 16px;
		border: none;
		background: none;
		font-family: var(--font-sans);
		font-size: 0.8rem;
		color: rgba(92, 77, 60, 0.5);
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.skip-link:hover {
		color: rgba(92, 77, 60, 0.7);
	}
</style>
