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
</script>

<g class="cottage" transform="translate(240, 330)" filter="url(#hand-drawn)">
	<!-- Chimney -->
	<rect x="48" y="-30" width="10" height="22" rx="2" fill="#8B5E3C" />

	<!-- Smoke particles -->
	<g class="smoke">
		<circle class="smoke-1" cx="53" cy="-38" r="4" fill="#D4D0C8" opacity="0.4" />
		<circle class="smoke-2" cx="55" cy="-48" r="5" fill="#D4D0C8" opacity="0.3" />
		<circle class="smoke-3" cx="51" cy="-58" r="6" fill="#D4D0C8" opacity="0.2" />
		<circle class="smoke-4" cx="54" cy="-68" r="4.5" fill="#D4D0C8" opacity="0.1" />
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

	<!-- Windows with glow -->
	<rect x="8" y="12" width="13" height="13" rx="2" fill="#5C4D3C" />
	<rect x="9" y="13" width="11" height="11" rx="1" fill="#F2C94C" opacity={windowGlow} />
	<line x1="14.5" y1="13" x2="14.5" y2="24" stroke="#5C4D3C" stroke-width="1" />
	<line x1="9" y1="18.5" x2="20" y2="18.5" stroke="#5C4D3C" stroke-width="1" />

	<rect x="50" y="12" width="13" height="13" rx="2" fill="#5C4D3C" />
	<rect x="51" y="13" width="11" height="11" rx="1" fill="#F2C94C" opacity={windowGlow} />
	<line x1="56.5" y1="13" x2="56.5" y2="24" stroke="#5C4D3C" stroke-width="1" />
	<line x1="51" y1="18.5" x2="62" y2="18.5" stroke="#5C4D3C" stroke-width="1" />
</g>

<style>
	.smoke-1 {
		animation: smoke-rise 4s ease-out infinite;
	}
	.smoke-2 {
		animation: smoke-rise 4s ease-out infinite;
		animation-delay: -1s;
	}
	.smoke-3 {
		animation: smoke-rise 4s ease-out infinite;
		animation-delay: -2s;
	}
	.smoke-4 {
		animation: smoke-rise 4s ease-out infinite;
		animation-delay: -3s;
	}

	@keyframes smoke-rise {
		0% {
			transform: translate(0, 0) scale(1);
			opacity: 0.4;
		}
		50% {
			transform: translate(-4px, -15px) scale(1.3);
			opacity: 0.2;
		}
		100% {
			transform: translate(2px, -30px) scale(1.6);
			opacity: 0;
		}
	}
</style>
