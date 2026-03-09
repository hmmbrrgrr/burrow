<script lang="ts">
	import { getHabitCompletionRates } from '$lib/services/insights';

	let habits = $derived.by(() => {
		const rates = getHabitCompletionRates(7);
		return rates
			.map((h) => ({
				...h,
				completed: Math.round(h.rate * 7),
				percentage: Math.round(h.rate * 100),
			}))
			.sort((a, b) => b.rate - a.rate);
	});

	function encourageEmoji(rate: number): string {
		if (rate >= 0.8) return '🌟';
		if (rate >= 0.5) return '💪';
		return '';
	}
</script>

<div class="habit-insights">
	<h3 class="habit-title">Your habits</h3>

	{#if habits.length === 0}
		<p class="empty-message">Check in to start tracking your habits!</p>
	{:else}
		<div class="habit-list">
			{#each habits as habit (habit.habitId)}
				<div class="habit-row">
					<div class="habit-label">
						<span class="habit-emoji">{habit.emoji}</span>
						<span class="habit-name">{habit.name}</span>
					</div>
					<div class="habit-data">
						<div class="habit-dots">
							{#each Array(7) as _, i}
								<span
									class="dot"
									class:filled={i < habit.completed}
								></span>
							{/each}
						</div>
						<span class="habit-rate">
							{habit.completed}/7 this week {encourageEmoji(habit.rate)}
						</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.habit-insights {
		background: rgba(255, 255, 255, 0.04);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border-radius: 14px 12px 16px 10px;
		padding: 16px;
	}

	.habit-title {
		font-family: 'Lora', 'Georgia', serif;
		font-size: var(--text-sm, 0.72rem);
		color: #C4A882;
		font-weight: 600;
		margin-bottom: 12px;
	}

	.empty-message {
		font-size: var(--text-xs, 0.65rem);
		color: var(--text-muted, #8A8A95);
		opacity: 0.7;
		text-align: center;
		padding: 8px 0;
	}

	.habit-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.habit-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}

	.habit-label {
		display: flex;
		align-items: center;
		gap: 6px;
		flex-shrink: 0;
	}

	.habit-emoji {
		font-size: 0.85rem;
	}

	.habit-name {
		font-size: var(--text-xs, 0.65rem);
		color: var(--text-dim, #A1A1AA);
		font-weight: 500;
		white-space: nowrap;
	}

	.habit-data {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 3px;
	}

	.habit-dots {
		display: flex;
		gap: 4px;
	}

	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: rgba(196, 168, 130, 0.15);
		transition: background 0.2s ease;
	}

	.dot.filled {
		background: #8BAF7C;
	}

	.habit-rate {
		font-size: var(--text-xs, 0.65rem);
		color: var(--text-muted, #8A8A95);
		opacity: 0.5;
	}
</style>
