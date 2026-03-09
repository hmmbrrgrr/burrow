<!-- JournalThemes.svelte — Weekly journal theme tag cloud -->
<script lang="ts">
	import { getJournalThemes } from '$lib/services/insights';

	const ACCENT_COLORS = [
		'#B5A0D1', // lavender
		'#9EC5D6', // sky-blue
		'#8BAF7C', // forest-green
		'#F2C94C', // warm-gold
		'#E8945A', // ember-orange
	];

	let themes = $derived(getJournalThemes(7).slice(0, 10));
	let hasThemes = $derived(themes.length > 0);

	// Compute relative font sizes: most common → text-base, least → text-xs
	let sized = $derived.by(() => {
		if (themes.length === 0) return [];
		const maxCount = Math.max(...themes.map((t) => t.count));
		const minCount = Math.min(...themes.map((t) => t.count));
		const range = maxCount - minCount || 1;

		return themes.map((t, i) => {
			const ratio = (t.count - minCount) / range;
			// Interpolate between 0.65rem (text-xs) and 0.85rem (text-base)
			const fontSize = 0.65 + ratio * 0.2;
			const color = ACCENT_COLORS[i % ACCENT_COLORS.length];
			return { ...t, fontSize, color, index: i };
		});
	});
</script>

<div class="journal-themes">
	<h3 class="title">Your themes this week</h3>

	{#if hasThemes}
		<div class="cloud">
			{#each sized as tag (tag.word)}
				<span
					class="tag"
					style="
						font-size: {tag.fontSize}rem;
						color: {tag.color};
						background: color-mix(in srgb, {tag.color} 15%, transparent);
						animation-delay: {tag.index * 60}ms;
					"
					title="{tag.count}× this week"
				>
					{tag.word}
				</span>
			{/each}
		</div>
	{:else}
		<p class="empty-state">Start journaling to discover your themes 📝</p>
	{/if}
</div>

<style>
	.journal-themes {
		background: rgba(255, 255, 255, 0.03);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border-radius: 14px 12px 16px 10px;
		padding: 16px;
	}

	.title {
		font-family: 'Lora', 'Georgia', serif;
		font-size: 1.125rem;
		color: #C4A882;
		font-weight: 600;
		margin: 0 0 12px;
	}

	.cloud {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		align-items: center;
	}

	.tag {
		display: inline-block;
		padding: 4px 12px;
		border-radius: 9999px;
		font-weight: 600;
		line-height: 1.4;
		cursor: default;
		opacity: 0;
		animation: tag-fade-in 0.35s ease-out forwards;
		transition: transform 0.15s ease;
	}

	.tag:hover {
		transform: scale(1.08);
	}

	@keyframes tag-fade-in {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.empty-state {
		font-size: var(--text-sm, 0.72rem);
		color: var(--text-muted, #8A8A95);
		text-align: center;
		padding: 12px 0;
		opacity: 0.5;
	}
</style>
