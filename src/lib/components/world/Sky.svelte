<!-- Sky.svelte — Gradient sky with clouds, sun/moon, stars based on time-of-day -->
<script lang="ts">
	import type { TimeOfDay } from '$lib/utils/time';

	interface Props {
		time: TimeOfDay;
	}

	let { time }: Props = $props();

	const gradients: Record<TimeOfDay, { top: string; bottom: string }> = {
		dawn: { top: '#FFB088', bottom: '#FFD4A8' },
		morning: { top: '#87CEEB', bottom: '#B8E0F0' },
		afternoon: { top: '#9EC5D6', bottom: '#C8E0EC' },
		dusk: { top: '#E8945A', bottom: '#B5A0D1' },
		night: { top: '#0B1D3A', bottom: '#1A2E4A' },
	};

	let grad = $derived(gradients[time]);

	let sunY = $derived(
		time === 'dawn' ? 160 : time === 'morning' ? 60 : time === 'afternoon' ? 80 : time === 'dusk' ? 180 : -50
	);
	let showSun = $derived(time !== 'night');
	let showMoon = $derived(time === 'night');
	let starsOpacity = $derived(time === 'night' ? 1 : time === 'dusk' ? 0.3 : 0);
	let cloudOpacity = $derived(time === 'night' ? 0.15 : time === 'dusk' ? 0.5 : 0.7);
</script>

<g class="sky">
	<!-- Sky gradient -->
	<defs>
		<linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0%" stop-color={grad.top} />
			<stop offset="100%" stop-color={grad.bottom} />
		</linearGradient>
	</defs>
	<rect width="800" height="600" fill="url(#sky-grad)" />

	<!-- Stars (visible at night/dusk) -->
	<g class="stars" opacity={starsOpacity}>
		<circle cx="120" cy="45" r="1.5" fill="#fff" class="star star-1" />
		<circle cx="230" cy="80" r="1" fill="#fff" class="star star-2" />
		<circle cx="380" cy="35" r="1.8" fill="#fff" class="star star-3" />
		<circle cx="500" cy="65" r="1.2" fill="#fff" class="star star-4" />
		<circle cx="620" cy="40" r="1.5" fill="#fff" class="star star-5" />
		<circle cx="710" cy="90" r="1" fill="#fff" class="star star-6" />
		<circle cx="160" cy="110" r="1.2" fill="#fff" class="star star-1" />
		<circle cx="450" cy="100" r="1.5" fill="#fff" class="star star-3" />
		<circle cx="550" cy="25" r="1" fill="#fff" class="star star-2" />
		<circle cx="310" cy="55" r="1.3" fill="#fff" class="star star-4" />
		<circle cx="680" cy="70" r="1.8" fill="#fff" class="star star-5" />
		<circle cx="80" cy="75" r="1.1" fill="#fff" class="star star-6" />
	</g>

	<!-- Sun -->
	{#if showSun}
		<g class="sun-group" transform="translate(620, {sunY})">
			<circle r="40" fill="#F2C94C" opacity="0.2" />
			<circle r="28" fill="#F2C94C" opacity="0.35" />
			<circle r="18" fill="#FFFBE6" />
		</g>
	{/if}

	<!-- Moon -->
	{#if showMoon}
		<g class="moon-group" transform="translate(620, 70)">
			<circle r="22" fill="#E8E4D4" />
			<circle r="22" fill="#1A2E4A" cx="6" cy="-5" />
		</g>
	{/if}

	<!-- Clouds -->
	<g class="cloud cloud-1" opacity={cloudOpacity}>
		<ellipse cx="0" cy="0" rx="50" ry="16" fill="white" opacity="0.8" />
		<ellipse cx="-15" cy="-10" rx="28" ry="18" fill="white" opacity="0.9" />
		<ellipse cx="18" cy="-8" rx="22" ry="14" fill="white" opacity="0.85" />
	</g>

	<g class="cloud cloud-2" opacity={cloudOpacity}>
		<ellipse cx="0" cy="0" rx="38" ry="12" fill="white" opacity="0.7" />
		<ellipse cx="-10" cy="-8" rx="22" ry="14" fill="white" opacity="0.8" />
		<ellipse cx="14" cy="-6" rx="18" ry="11" fill="white" opacity="0.75" />
	</g>

	<g class="cloud cloud-3" opacity={cloudOpacity}>
		<ellipse cx="0" cy="0" rx="44" ry="14" fill="white" opacity="0.75" />
		<ellipse cx="-12" cy="-9" rx="25" ry="16" fill="white" opacity="0.85" />
		<ellipse cx="16" cy="-7" rx="20" ry="12" fill="white" opacity="0.8" />
	</g>
</g>

<style>
	.cloud-1 {
		animation: drift1 45s linear infinite;
	}
	.cloud-2 {
		animation: drift2 55s linear infinite;
	}
	.cloud-3 {
		animation: drift3 38s linear infinite;
	}

	@keyframes drift1 {
		0% { transform: translate(-100px, 50px); }
		100% { transform: translate(900px, 50px); }
	}
	@keyframes drift2 {
		0% { transform: translate(900px, 85px); }
		100% { transform: translate(-100px, 85px); }
	}
	@keyframes drift3 {
		0% { transform: translate(-80px, 65px); }
		100% { transform: translate(900px, 65px); }
	}

	.star {
		animation: twinkle 3s ease-in-out infinite;
	}
	.star-1 { animation-delay: 0s; }
	.star-2 { animation-delay: 0.5s; }
	.star-3 { animation-delay: 1s; }
	.star-4 { animation-delay: 1.5s; }
	.star-5 { animation-delay: 2s; }
	.star-6 { animation-delay: 2.5s; }

	@keyframes twinkle {
		0%, 100% { opacity: 0.4; }
		50% { opacity: 1; }
	}
</style>
