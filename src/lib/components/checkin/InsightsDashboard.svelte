<!-- InsightsDashboard.svelte — Scrollable dashboard assembling all insight components -->
<script lang="ts">
	import CheckInHistory from './CheckInHistory.svelte';
	import MoodTrends from './MoodTrends.svelte';
	import HabitInsights from './HabitInsights.svelte';
	import JournalThemes from './JournalThemes.svelte';

	interface Props {
		onclose?: () => void;
	}

	let { onclose }: Props = $props();

	let visible = $state(false);

	$effect(() => {
		// Trigger entrance animation on next frame
		requestAnimationFrame(() => {
			visible = true;
		});
	});

	function handleClose() {
		if (onclose) {
			visible = false;
			setTimeout(() => onclose!(), 300);
		}
	}
</script>

<div class="insights-backdrop" class:visible onclick={handleClose} onkeydown={(e) => e.key === 'Escape' && handleClose()} role="button" tabindex="-1" aria-label="Close insights backdrop"></div>

<div class="insights-dashboard" class:visible>
	<!-- Handle bar -->
	<button class="handle-bar" onclick={handleClose} aria-label="Close insights">
		<span class="handle"></span>
	</button>

	<!-- Scrollable content -->
	<div class="insights-scroll">
		<section class="insight-card">
			<CheckInHistory />
		</section>

		<div class="divider"></div>

		<section class="insight-card">
			<MoodTrends />
		</section>

		<div class="divider"></div>

		<section class="insight-card">
			<HabitInsights />
		</section>

		<div class="divider"></div>

		<section class="insight-card">
			<JournalThemes />
		</section>
	</div>
</div>

<style>
	.insights-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.3);
		backdrop-filter: blur(4px);
		opacity: 0;
		transition: opacity 0.3s ease;
		z-index: 90;
		pointer-events: none;
	}

	.insights-backdrop.visible {
		opacity: 1;
		pointer-events: auto;
	}

	.insights-dashboard {
		position: fixed;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%) translateY(100%);
		width: min(95vw, 480px);
		max-height: 60vh;
		display: flex;
		flex-direction: column;
		background: rgba(255, 255, 255, 0.04);
		backdrop-filter: blur(24px);
		border-radius: 24px 24px 0 0;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-bottom: none;
		box-shadow:
			0 -8px 40px rgba(0, 0, 0, 0.4),
			0 -2px 12px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
		opacity: 0;
		transition:
			transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
			opacity 0.3s ease;
		z-index: 100;
	}

	.insights-dashboard.visible {
		transform: translateX(-50%) translateY(0);
		opacity: 1;
	}

	.handle-bar {
		display: flex;
		justify-content: center;
		padding: 12px 0 4px;
		background: none;
		border: none;
		cursor: pointer;
		flex-shrink: 0;
	}

	.handle {
		display: block;
		width: 48px;
		height: 4px;
		border-radius: 9999px;
		background: rgba(255, 255, 255, 0.15);
		transition: background 0.2s ease;
	}

	.handle-bar:hover .handle {
		background: rgba(255, 255, 255, 0.25);
	}

	.insights-scroll {
		flex: 1;
		overflow-y: auto;
		padding: 8px 16px 24px;
		display: flex;
		flex-direction: column;
		gap: 16px;

		/* Custom scrollbar */
		scrollbar-width: thin;
		scrollbar-color: rgba(255, 255, 255, 0.12) transparent;
	}

	.insights-scroll::-webkit-scrollbar {
		width: 4px;
	}

	.insights-scroll::-webkit-scrollbar-track {
		background: transparent;
	}

	.insights-scroll::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.12);
		border-radius: 9999px;
	}

	.insight-card {
		background: rgba(255, 255, 255, 0.04);
		backdrop-filter: blur(8px);
		border-radius: 16px;
		padding: 16px;
		border: 1px solid rgba(255, 255, 255, 0.06);
	}

	.divider {
		height: 1px;
		background: rgba(255, 255, 255, 0.05);
		margin: 0 8px;
		flex-shrink: 0;
	}
</style>
