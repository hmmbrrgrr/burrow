<!-- CheckInHistory.svelte — 7-day check-in timeline with expandable details -->
<script lang="ts">
	import { getCheckInHistory } from '$lib/services/insights';

	const DAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
	const ENERGY_EMOJI: Record<string, string> = { low: '🌱', medium: '☀️', high: '⚡' };

	let selectedDay = $state<number | null>(null);

	let history = $derived.by(() => {
		const raw = getCheckInHistory(7);
		const now = new Date();
		const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

		return raw.reverse().map((entry) => {
			const d = new Date(entry.date + 'T00:00:00');
			return {
				...entry,
				initial: DAY_INITIALS[d.getDay()],
				isToday: entry.date === todayStr,
			};
		});
	});

	let selectedEntry = $derived(selectedDay !== null ? history[selectedDay] : null);

	function toggleDay(index: number) {
		if (!history[index].checkedIn) return;
		selectedDay = selectedDay === index ? null : index;
	}
</script>

<div class="px-4 py-3">
	<h3 class="title">This week</h3>

	<div class="day-row">
		{#each history as day, i}
			<button
				class="day-btn"
				class:filled={day.checkedIn}
				class:today={day.isToday}
				class:selected={selectedDay === i}
				onclick={() => toggleDay(i)}
				aria-label="{day.initial}{day.checkedIn ? ' — tap to view' : ''}"
			>
				<span class="initial">{day.initial}</span>
			</button>
		{/each}
	</div>

	{#if selectedEntry?.checkedIn}
		<div class="detail-card">
			{#if selectedEntry.energy}
				<div class="energy-line">
					{ENERGY_EMOJI[selectedEntry.energy] || '☀️'}
					<span class="energy-text">
						{selectedEntry.energy === 'low' ? 'Low energy' : selectedEntry.energy === 'high' ? 'High energy' : 'Steady'}
					</span>
				</div>
			{/if}

			{#if selectedEntry.emotions && selectedEntry.emotions.length > 0}
				<div class="tags-row">
					{#each selectedEntry.emotions as emotion}
						<span class="emotion-tag">{emotion}</span>
					{/each}
				</div>
			{/if}

			{#if selectedEntry.habits && Object.keys(selectedEntry.habits).length > 0}
				<div class="habits-list">
					{#each Object.entries(selectedEntry.habits) as [habit, done]}
						<span class="habit-item" class:done={!!done}>
							{done ? '✓' : '·'} {habit}
						</span>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.title {
		font-family: 'Fraunces', serif;
		font-size: 1.125rem;
		color: #5C4D3C;
		text-align: left;
		margin-bottom: 10px;
		font-weight: 500;
	}

	.day-row {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
	}

	.day-btn {
		width: 2rem;
		height: 2rem;
		border-radius: 9999px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid rgba(92, 77, 60, 0.2);
		background: transparent;
		cursor: default;
		padding: 0;
		-webkit-tap-highlight-color: transparent;
		transition: all 0.2s ease;
	}

	.day-btn .initial {
		font-size: 0.75rem;
		font-weight: 600;
		color: rgba(92, 77, 60, 0.4);
		line-height: 1;
	}

	/* Filled (checked in) */
	.day-btn.filled {
		background: #E8945A;
		border-color: #E8945A;
		box-shadow: 0 2px 8px rgba(232, 148, 90, 0.3);
		cursor: pointer;
	}

	.day-btn.filled .initial {
		color: white;
	}

	.day-btn.filled:active {
		transform: scale(0.92);
	}

	/* Today ring */
	.day-btn.today {
		box-shadow: 0 0 0 3px rgba(232, 148, 90, 0.25);
	}

	.day-btn.today.filled {
		box-shadow: 0 0 0 3px rgba(232, 148, 90, 0.25), 0 2px 8px rgba(232, 148, 90, 0.3);
	}

	/* Selected */
	.day-btn.selected {
		transform: scale(1.1);
	}

	/* Detail card */
	.detail-card {
		margin-top: 12px;
		padding: 0.75rem;
		background: rgba(255, 255, 255, 0.6);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border-radius: 0.75rem;
		display: flex;
		flex-direction: column;
		gap: 8px;
		animation: slide-in 0.2s cubic-bezier(0.22, 1, 0.36, 1);
		border-radius: 16px 12px 14px 13px;
	}

	@keyframes slide-in {
		from { opacity: 0; transform: translateY(-6px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.energy-line {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.85rem;
	}

	.energy-text {
		color: #5C4D3C;
		font-weight: 600;
		font-size: 0.8rem;
	}

	.tags-row {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}

	.emotion-tag {
		font-size: 0.75rem;
		padding: 2px 8px;
		border-radius: 9999px;
		background: rgba(232, 148, 90, 0.12);
		color: #E8945A;
		font-weight: 500;
	}

	.habits-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.habit-item {
		font-size: 0.78rem;
		color: rgba(92, 77, 60, 0.5);
	}

	.habit-item.done {
		color: #E8945A;
	}
</style>
