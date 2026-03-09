<!-- WorldSkeleton.svelte — Shimmer placeholder while WorldScene loads -->
<script lang="ts">
	// No props needed — pure presentational skeleton
</script>

<div class="world-skeleton">
	<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" class="skeleton-svg">
		<defs>
			<!-- Sky gradient in muted parchment tones -->
			<linearGradient id="skel-sky" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="#d4c5a9" />
				<stop offset="100%" stop-color="#c2b393" />
			</linearGradient>
		</defs>

		<!-- Sky background -->
		<rect width="800" height="600" fill="url(#skel-sky)" />

		<!-- Back hills placeholder -->
		<ellipse cx="400" cy="420" rx="500" ry="80" fill="#b8a888" opacity="0.6" />

		<!-- Mid hills placeholders (rounded) -->
		<rect x="0" y="430" width="500" height="120" rx="50" fill="#a89878" opacity="0.7" />
		<rect x="350" y="420" width="450" height="130" rx="50" fill="#a89878" opacity="0.7" />

		<!-- Cottage placeholder -->
		<rect x="320" y="340" width="130" height="90" rx="10" fill="#9a8a6e" opacity="0.7" />
		<!-- Roof -->
		<polygon points="310,345 385,290 460,345" fill="#8e7e62" opacity="0.6" />
		<!-- Chimney -->
		<rect x="405" y="298" width="22" height="45" rx="4" fill="#8e7e62" opacity="0.5" />

		<!-- Companion placeholder (small rounded shape) -->
		<ellipse cx="500" cy="480" rx="28" ry="22" fill="#9a8a6e" opacity="0.6" />

		<!-- Front hills -->
		<rect x="-50" y="500" width="900" height="150" rx="60" fill="#8e7e62" opacity="0.8" />
	</svg>

	<!-- Shimmer overlay -->
	<div class="shimmer-overlay"></div>
</div>

<style>
	.world-skeleton {
		width: 100%;
		height: 100vh;
		overflow: hidden;
		position: relative;
	}

	.skeleton-svg {
		width: 100%;
		height: 100%;
		display: block;
	}

	.shimmer-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 255, 255, 0.12) 50%,
			transparent 100%
		);
		animation: shimmer 1.5s infinite;
	}

	@keyframes shimmer {
		0% { transform: translateX(-100%); }
		100% { transform: translateX(100%); }
	}
</style>
