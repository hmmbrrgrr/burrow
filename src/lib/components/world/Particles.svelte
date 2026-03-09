<!-- Particles.svelte — Ambient floating particles: leaves by day, fireflies at night -->
<script lang="ts">
	import type { TimeOfDay } from '$lib/utils/time';

	interface Props {
		time: TimeOfDay;
	}

	let { time }: Props = $props();

	let isNight = $derived(time === 'night');
	let isDusk = $derived(time === 'dusk');
	let showLeaves = $derived(time === 'morning' || time === 'afternoon' || time === 'dawn');
	let showFireflies = $derived(isDusk || isNight);
	let fireflyCount = $derived(isNight ? 8 : isDusk ? 4 : 0);
</script>

<g class="particles" aria-hidden="true">
	{#if showLeaves}
		<g class="leaf leaf-1">
			<ellipse cx="150" cy="200" rx="4" ry="2" fill="#98BF82" opacity="0.6" transform="rotate(30)" />
		</g>
		<g class="leaf leaf-2">
			<ellipse cx="400" cy="150" rx="3.5" ry="1.8" fill="#8BAF7C" opacity="0.5" transform="rotate(-20)" />
		</g>
		<g class="leaf leaf-3">
			<ellipse cx="600" cy="250" rx="3" ry="1.5" fill="#6E9060" opacity="0.55" transform="rotate(45)" />
		</g>
		<g class="leaf leaf-4">
			<ellipse cx="300" cy="300" rx="3.5" ry="1.8" fill="#98BF82" opacity="0.45" transform="rotate(-35)" />
		</g>
	{/if}

	{#if showFireflies}
		<circle class="firefly firefly-1" cx="200" cy="380" r="2.5" fill="#F2C94C" />
		<circle class="firefly firefly-2" cx="450" cy="350" r="2" fill="#F2C94C" />
		<circle class="firefly firefly-3" cx="600" cy="400" r="2.5" fill="#F2C94C" />
		<circle class="firefly firefly-4" cx="150" cy="420" r="2" fill="#F2C94C" />
		{#if fireflyCount > 4}
			<circle class="firefly firefly-5" cx="350" cy="370" r="2" fill="#F2C94C" />
			<circle class="firefly firefly-6" cx="520" cy="430" r="2.5" fill="#F2C94C" />
			<circle class="firefly firefly-7" cx="680" cy="360" r="2" fill="#F2C94C" />
			<circle class="firefly firefly-8" cx="100" cy="450" r="2.5" fill="#F2C94C" />
		{/if}
	{/if}
</g>

<style>
	.leaf-1, .leaf-2, .leaf-3, .leaf-4 {
		will-change: transform, opacity;
	}
	.leaf-1 { animation: leaf-drift-1 12s ease-in-out infinite; }
	.leaf-2 { animation: leaf-drift-2 15s ease-in-out infinite; animation-delay: -4s; }
	.leaf-3 { animation: leaf-drift-3 18s ease-in-out infinite; animation-delay: -8s; }
	.leaf-4 { animation: leaf-drift-1 14s ease-in-out infinite; animation-delay: -6s; }

	@keyframes leaf-drift-1 {
		0% { transform: translate(0, 0) rotate(0deg); opacity: 0.6; }
		25% { transform: translate(30px, 40px) rotate(45deg); opacity: 0.5; }
		50% { transform: translate(60px, 90px) rotate(90deg); opacity: 0.4; }
		75% { transform: translate(40px, 140px) rotate(135deg); opacity: 0.3; }
		100% { transform: translate(80px, 200px) rotate(180deg); opacity: 0; }
	}
	@keyframes leaf-drift-2 {
		0% { transform: translate(0, 0) rotate(0deg); opacity: 0.5; }
		25% { transform: translate(-20px, 50px) rotate(-40deg); opacity: 0.45; }
		50% { transform: translate(-40px, 100px) rotate(-80deg); opacity: 0.35; }
		75% { transform: translate(-15px, 160px) rotate(-120deg); opacity: 0.2; }
		100% { transform: translate(-50px, 220px) rotate(-160deg); opacity: 0; }
	}
	@keyframes leaf-drift-3 {
		0% { transform: translate(0, 0) rotate(0deg); opacity: 0.55; }
		33% { transform: translate(25px, 60px) rotate(60deg); opacity: 0.4; }
		66% { transform: translate(10px, 130px) rotate(120deg); opacity: 0.25; }
		100% { transform: translate(45px, 200px) rotate(180deg); opacity: 0; }
	}

	.firefly {
		animation: firefly-glow 2s ease-in-out infinite;
		will-change: transform, opacity;
	}
	.firefly-1 { animation: firefly-float-1 6s ease-in-out infinite, firefly-glow 2s ease-in-out infinite; }
	.firefly-2 { animation: firefly-float-2 7s ease-in-out infinite, firefly-glow 2.5s ease-in-out infinite; animation-delay: -1s; }
	.firefly-3 { animation: firefly-float-3 5.5s ease-in-out infinite, firefly-glow 1.8s ease-in-out infinite; animation-delay: -2s; }
	.firefly-4 { animation: firefly-float-1 8s ease-in-out infinite, firefly-glow 2.2s ease-in-out infinite; animation-delay: -3s; }
	.firefly-5 { animation: firefly-float-2 6.5s ease-in-out infinite, firefly-glow 2s ease-in-out infinite; animation-delay: -1.5s; }
	.firefly-6 { animation: firefly-float-3 7.5s ease-in-out infinite, firefly-glow 2.3s ease-in-out infinite; animation-delay: -4s; }
	.firefly-7 { animation: firefly-float-1 5s ease-in-out infinite, firefly-glow 1.9s ease-in-out infinite; animation-delay: -2.5s; }
	.firefly-8 { animation: firefly-float-2 9s ease-in-out infinite, firefly-glow 2.1s ease-in-out infinite; animation-delay: -5s; }

	@keyframes firefly-glow {
		0%, 100% { opacity: 0.2; }
		50% { opacity: 0.9; }
	}
	@keyframes firefly-float-1 {
		0%, 100% { transform: translate(0, 0); }
		25% { transform: translate(10px, -15px); }
		50% { transform: translate(-5px, -8px); }
		75% { transform: translate(8px, 5px); }
	}
	@keyframes firefly-float-2 {
		0%, 100% { transform: translate(0, 0); }
		25% { transform: translate(-12px, -10px); }
		50% { transform: translate(6px, -20px); }
		75% { transform: translate(-8px, -5px); }
	}
	@keyframes firefly-float-3 {
		0%, 100% { transform: translate(0, 0); }
		25% { transform: translate(8px, 10px); }
		50% { transform: translate(-10px, -12px); }
		75% { transform: translate(5px, -18px); }
	}

	/* ===== REDUCED MOTION ===== */
	/* Disable all particle animations — leaves and fireflies are purely ambient */
	@media (prefers-reduced-motion: reduce) {
		.leaf-1, .leaf-2, .leaf-3, .leaf-4 {
			animation: none !important;
			opacity: 0.5;
		}
		.firefly,
		.firefly-1, .firefly-2, .firefly-3, .firefly-4,
		.firefly-5, .firefly-6, .firefly-7, .firefly-8 {
			animation: none !important;
			opacity: 0.6;
		}
	}
</style>
