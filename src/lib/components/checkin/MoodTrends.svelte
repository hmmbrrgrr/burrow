<!-- MoodTrends.svelte — 14-day energy trend chart with emotion summary -->
<script lang="ts">
	import { getEnergyTrend, getEmotionSummary } from '$lib/services/insights';

	const ENERGY_COLORS: Record<number, string> = {
		1: '#E88A8A', // low — rose
		2: '#F2C94C', // medium — warm-gold
		3: '#98BF82', // high — sage
	};

	const ENERGY_Y: Record<number, number> = {
		1: 90,  // low
		2: 55,  // medium
		3: 20,  // high
	};

	const EMOTION_EMOJI: Record<string, string> = {
		happy: '😊',
		calm: '😌',
		frustrated: '😤',
		anxious: '😰',
		tired: '😴',
		focused: '🎯',
		down: '😔',
		grateful: '🙏',
	};

	// SVG dimensions
	const W = 300;
	const H = 120;
	const PAD_X = 20;

	function getX(index: number, total: number): number {
		if (total <= 1) return W / 2;
		return PAD_X + (index / (total - 1)) * (W - PAD_X * 2);
	}

	function getY(energy: number): number {
		return ENERGY_Y[energy] ?? 55;
	}

	// Energy trend: 14 data points, oldest first, energy is number|null
	let energyData = $derived.by(() => getEnergyTrend(14));

	// Build SVG path segments (break on nulls, quadratic bezier smoothing)
	interface ChartPoint { x: number; y: number; energy: number }

	let chartSegments = $derived.by(() => {
		const points = energyData;
		const total = points.length;
		// Group consecutive non-null points into segments
		const segments: { path: string; colors: string[] }[] = [];
		let currentRun: ChartPoint[] = [];

		for (let i = 0; i < total; i++) {
			const p = points[i];
			if (p.energy !== null) {
				currentRun.push({ x: getX(i, total), y: getY(p.energy), energy: p.energy });
			} else {
				if (currentRun.length >= 2) {
					segments.push(buildSegment(currentRun));
				}
				currentRun = [];
			}
		}
		if (currentRun.length >= 2) {
			segments.push(buildSegment(currentRun));
		}
		return segments;
	});

	function buildSegment(pts: ChartPoint[]): { path: string; colors: string[] } {
		// Build a single smooth path using quadratic bezier between midpoints
		let d = `M ${pts[0].x} ${pts[0].y}`;
		for (let i = 1; i < pts.length; i++) {
			const prev = pts[i - 1];
			const curr = pts[i];
			const midX = (prev.x + curr.x) / 2;
			const midY = (prev.y + curr.y) / 2;
			if (i === 1) {
				d += ` Q ${prev.x} ${prev.y} ${midX} ${midY}`;
			} else {
				d += ` Q ${prev.x} ${prev.y} ${midX} ${midY}`;
			}
			if (i === pts.length - 1) {
				d += ` Q ${curr.x} ${curr.y} ${curr.x} ${curr.y}`;
			}
		}
		return { path: d, colors: pts.map((p) => ENERGY_COLORS[p.energy] || '#F2C94C') };
	}

	// All non-null data points for rendering dots
	let dotPoints = $derived.by(() => {
		const total = energyData.length;
		return energyData
			.map((p, i) => p.energy !== null ? { x: getX(i, total), y: getY(p.energy), energy: p.energy } : null)
			.filter((p): p is ChartPoint => p !== null);
	});

	// Colored line segments (individual lines between consecutive non-null points)
	let lineSegments = $derived.by(() => {
		const total = energyData.length;
		const segs: { x1: number; y1: number; x2: number; y2: number; color: string }[] = [];
		for (let i = 1; i < total; i++) {
			const prev = energyData[i - 1];
			const curr = energyData[i];
			if (prev.energy !== null && curr.energy !== null) {
				segs.push({
					x1: getX(i - 1, total),
					y1: getY(prev.energy),
					x2: getX(i, total),
					y2: getY(curr.energy),
					color: ENERGY_COLORS[curr.energy] || '#F2C94C',
				});
			}
		}
		return segs;
	});

	// Emotion summary: top 3-4 from last 14 days
	let topEmotions = $derived.by(() => getEmotionSummary(14).slice(0, 4));

	let hasData = $derived(dotPoints.length >= 2);

	function capitalise(s: string): string {
		return s.charAt(0).toUpperCase() + s.slice(1);
	}
</script>

<div class="mood-trends">
	<h3 class="heading">Your journey so far</h3>

	{#if !hasData}
		<div class="empty-state">
			<span class="empty-icon">🌱</span>
			<p class="empty-text">Keep checking in to see your journey unfold</p>
			{#if dotPoints.length === 1}
				<p class="empty-sub">1 check-in so far — you're on your way!</p>
			{/if}
		</div>
	{:else}
		<!-- SVG Chart -->
		<div class="chart-wrap">
			<svg viewBox="0 0 {W} {H}" width="100%" preserveAspectRatio="xMidYMid meet" class="chart-svg" aria-label="Energy level trend over the past 2 weeks">
				<!-- Horizontal guide lines at energy levels -->
				{#each [90, 55, 20] as yLevel}
					<line
						x1={PAD_X}
						y1={yLevel}
						x2={W - PAD_X}
						y2={yLevel}
						class="guide-line"
					/>
				{/each}

				<!-- Color-coded line segments between consecutive data points -->
				{#each lineSegments as seg}
					<line
						x1={seg.x1}
						y1={seg.y1}
						x2={seg.x2}
						y2={seg.y2}
						stroke={seg.color}
						stroke-width="2.5"
						stroke-linecap="round"
						opacity="0.85"
					/>
				{/each}

				<!-- Data point dots -->
				{#each dotPoints as point}
					<circle
						cx={point.x}
						cy={point.y}
						r="4"
						fill={ENERGY_COLORS[point.energy]}
						stroke="rgba(255,255,255,0.15)"
						stroke-width="1.5"
					/>
				{/each}
			</svg>
		</div>

		<!-- Emotion summary -->
		{#if topEmotions.length > 0}
			<div class="emotion-section">
				<p class="emotion-heading">Most felt this week</p>
				<div class="emotion-pills">
					{#each topEmotions as item}
						<span class="emotion-pill">
							<span class="emotion-emoji">{EMOTION_EMOJI[item.emotion] || '💭'}</span>
							<span class="emotion-label">{capitalise(item.emotion)}</span>
						</span>
					{/each}
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.mood-trends {
		width: 100%;
	}

	.heading {
		font-family: var(--font-serif, Georgia, serif);
		font-size: var(--text-sm, 0.72rem);
		color: #5C4D3C;
		margin: 0 0 12px;
		font-weight: 600;
	}

	/* Empty state */
	.empty-state {
		text-align: center;
		padding: 24px 12px;
	}

	.empty-icon {
		font-size: 2rem;
		display: block;
		margin-bottom: 10px;
	}

	.empty-text {
		font-family: var(--font-sans);
		font-size: 0.9rem;
		color: #5C4D3C;
		margin: 0 0 6px;
	}

	.empty-sub {
		font-family: var(--font-sans);
		font-size: 0.75rem;
		color: rgba(92, 77, 60, 0.5);
		margin: 0;
	}

	/* Chart */
	.chart-wrap {
		width: 100%;
		margin-bottom: 14px;
	}

	.chart-svg {
		width: 100%;
		height: auto;
		display: block;
	}

	.chart-svg :global(.guide-line) {
		stroke: rgba(92, 77, 60, 0.10);
		stroke-width: 1;
		stroke-dasharray: 3 3;
	}

	/* Emotion summary */
	.emotion-section {
		text-align: center;
	}

	.emotion-heading {
		font-family: var(--font-sans);
		font-size: 0.65rem;
		color: rgba(92, 77, 60, 0.55);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0 0 8px;
		font-weight: 600;
	}

	.emotion-pills {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		justify-content: center;
	}

	.emotion-pill {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 3px 10px;
		background: rgba(92, 77, 60, 0.05);
		border-radius: 20px;
	}

	.emotion-emoji {
		font-size: 0.8rem;
		line-height: 1;
	}

	.emotion-label {
		font-family: var(--font-sans);
		font-size: 0.7rem;
		color: #5C4D3C;
		font-weight: 500;
	}
</style>
