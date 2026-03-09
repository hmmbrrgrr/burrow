<!-- Cottage.svelte — Stone cottage with thatched roof, chimney smoke, glowing windows -->
<script lang="ts">
	import type { TimeOfDay } from '$lib/utils/time';

	interface Props {
		time: TimeOfDay;
	}

	let { time }: Props = $props();

	let windowGlow = $derived(
		time === 'night' ? 0.9 : time === 'dusk' ? 0.7 : time === 'dawn' ? 0.4 : 0.15
	);

	let glowHalo = $derived(
		time === 'night' ? 0.25 : time === 'dusk' ? 0.15 : 0
	);
</script>

<defs>
	<radialGradient id="window-glow" cx="50%" cy="50%" r="50%">
		<stop offset="0%" stop-color="#FBBF24" stop-opacity="1" />
		<stop offset="40%" stop-color="#F59E0B" stop-opacity="0.85" />
		<stop offset="100%" stop-color="#D97706" stop-opacity="0.6" />
	</radialGradient>
</defs>

<g class="cottage" transform="translate(240, 330)" filter="url(#hand-drawn)">
	<!-- Chimney -->
	<rect x="48" y="-30" width="10" height="22" rx="2" fill="#8B5E3C" />

	<!-- Smoke particles — organic overlapping ellipses drifting upward -->
	<g class="smoke">
		<ellipse class="smoke-1" cx="53" cy="-35" rx="4" ry="3" fill="#D4D0C8" opacity="0.4" />
		<ellipse class="smoke-2" cx="55" cy="-40" rx="5.5" ry="3.5" fill="#C8C4BC" opacity="0.35" />
		<ellipse class="smoke-3" cx="51" cy="-38" rx="3.5" ry="2.5" fill="#DCD8D0" opacity="0.38" />
		<ellipse class="smoke-4" cx="54" cy="-42" rx="6" ry="4" fill="#D4D0C8" opacity="0.3" />
		<ellipse class="smoke-5" cx="52" cy="-36" rx="4.5" ry="3" fill="#C8C4BC" opacity="0.32" />
		<ellipse class="smoke-6" cx="56" cy="-44" rx="5" ry="3.5" fill="#DCD8D0" opacity="0.25" />
		<ellipse class="smoke-7" cx="50" cy="-39" rx="3" ry="2" fill="#D4D0C8" opacity="0.4" />
	</g>

	<!-- Roof — thatched, slightly asymmetric -->
	<path
		d="M-8 0 Q15 -35 35 -38 Q55 -35 78 0 Z"
		fill="#8B5E3C"
	/>
	<!-- Roof thatch texture lines -->
	<path d="M5 -8 Q20 -28 35 -30" stroke="#7A4E2C" stroke-width="0.8" fill="none" opacity="0.5" />
	<path d="M15 -5 Q30 -25 45 -28" stroke="#7A4E2C" stroke-width="0.8" fill="none" opacity="0.5" />
	<path d="M60 -5 Q48 -22 40 -30" stroke="#7A4E2C" stroke-width="0.8" fill="none" opacity="0.5" />

	<!-- Walls -->
	<path
		d="M0 0 Q0 -2 2 -2 L68 -2 Q70 -2 70 0 L70 42 Q70 44 68 44 L2 44 Q0 44 0 42 Z"
		fill="#D4BC8A"
	/>
	<!-- Stone texture -->
	<rect x="5" y="8" width="12" height="8" rx="2" fill="#C4A87A" opacity="0.4" />
	<rect x="22" y="5" width="10" height="7" rx="2" fill="#C4A87A" opacity="0.3" />
	<rect x="50" y="10" width="14" height="6" rx="2" fill="#C4A87A" opacity="0.35" />
	<rect x="8" y="25" width="11" height="7" rx="2" fill="#C4A87A" opacity="0.3" />
	<rect x="52" y="28" width="10" height="6" rx="2" fill="#C4A87A" opacity="0.4" />

	<!-- Door — round top -->
	<path
		d="M28 44 L28 28 Q28 20 35 20 Q42 20 42 28 L42 44 Z"
		fill="#7A4E2C"
	/>
	<circle cx="39" cy="33" r="1.5" fill="#F2C94C" />

	<!-- Windows with warm glow -->
	<!-- Left window glow halo -->
	<ellipse class="window-glow-halo" cx="14.5" cy="18.5" rx="10" ry="10" fill="#F2C94C" opacity={glowHalo} />
	<rect x="8" y="12" width="13" height="13" rx="2" fill="#5C4D3C" />
	<rect class="window-pane" x="9" y="13" width="11" height="11" rx="1" fill="url(#window-glow)" opacity={windowGlow} />
	<line x1="14.5" y1="13" x2="14.5" y2="24" stroke="#5C4D3C" stroke-width="1" />
	<line x1="9" y1="18.5" x2="20" y2="18.5" stroke="#5C4D3C" stroke-width="1" />

	<!-- Right window glow halo -->
	<ellipse class="window-glow-halo" cx="56.5" cy="18.5" rx="10" ry="10" fill="#F2C94C" opacity={glowHalo} />
	<rect x="50" y="12" width="13" height="13" rx="2" fill="#5C4D3C" />
	<rect class="window-pane" x="51" y="13" width="11" height="11" rx="1" fill="url(#window-glow)" opacity={windowGlow} />
	<line x1="56.5" y1="13" x2="56.5" y2="24" stroke="#5C4D3C" stroke-width="1" />
	<line x1="51" y1="18.5" x2="62" y2="18.5" stroke="#5C4D3C" stroke-width="1" />
</g>

<style>
	.smoke-1 {
		animation: smoke-drift-a 6s ease-in-out infinite;
	}
	.smoke-2 {
		animation: smoke-drift-b 7s ease-in-out infinite;
		animation-delay: -1.5s;
	}
	.smoke-3 {
		animation: smoke-drift-c 5.5s ease-in-out infinite;
		animation-delay: -0.8s;
	}
	.smoke-4 {
		animation: smoke-drift-a 6.5s ease-in-out infinite;
		animation-delay: -3s;
	}
	.smoke-5 {
		animation: smoke-drift-b 5s ease-in-out infinite;
		animation-delay: -2.2s;
	}
	.smoke-6 {
		animation: smoke-drift-c 7s ease-in-out infinite;
		animation-delay: -4s;
	}
	.smoke-7 {
		animation: smoke-drift-a 5.5s ease-in-out infinite;
		animation-delay: -1s;
	}

	@keyframes smoke-drift-a {
		0% {
			transform: translate(0, 0) scale(1);
			opacity: 0.4;
		}
		25% {
			transform: translate(-4px, -18px) scale(1.3);
			opacity: 0.28;
		}
		55% {
			transform: translate(3px, -45px) scale(1.7);
			opacity: 0.12;
		}
		100% {
			transform: translate(-2px, -80px) scale(2.2);
			opacity: 0;
		}
	}

	@keyframes smoke-drift-b {
		0% {
			transform: translate(0, 0) scale(1);
			opacity: 0.35;
		}
		30% {
			transform: translate(5px, -15px) scale(1.25);
			opacity: 0.25;
		}
		60% {
			transform: translate(-3px, -40px) scale(1.6);
			opacity: 0.1;
		}
		100% {
			transform: translate(6px, -72px) scale(2);
			opacity: 0;
		}
	}

	@keyframes smoke-drift-c {
		0% {
			transform: translate(0, 0) scale(1);
			opacity: 0.38;
		}
		20% {
			transform: translate(-3px, -12px) scale(1.15);
			opacity: 0.3;
		}
		50% {
			transform: translate(4px, -35px) scale(1.5);
			opacity: 0.15;
		}
		100% {
			transform: translate(-4px, -68px) scale(1.9);
			opacity: 0;
		}
	}

	.window-pane {
		transition: opacity 2s ease;
	}

	.window-glow-halo {
		transition: opacity 2s ease;
		filter: blur(6px);
	}
</style>
