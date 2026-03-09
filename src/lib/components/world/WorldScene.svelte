<!-- WorldScene.svelte — Main SVG scene composing all world layers -->
<script lang="ts">
	import type { TimeOfDay } from '$lib/utils/time';
	import { getTimeOfDay } from '$lib/utils/time';
	import SvgFilters from './SvgFilters.svelte';
	import Sky from './Sky.svelte';
	import Hills from './Hills.svelte';
	import Buildings from './Buildings.svelte';
	import Companion from './Companion.svelte';
	import Particles from './Particles.svelte';
	import Trees from './Trees.svelte';
	import { appState } from '$lib/stores/app.svelte';
	import { useVisibility } from '$lib/utils/visibility';

	interface Props {
		time?: TimeOfDay;
	}

	let { time: timeProp }: Props = $props();

	let time = $derived(timeProp ?? getTimeOfDay());

	// Mouse-driven parallax — opposite direction for depth effect
	let mouseX = $state(0);
	let mouseY = $state(0);
	let rafId = 0;
	let sceneEl: HTMLDivElement;

	function handleMouseMove(event: MouseEvent) {
		if (rafId) return;
		rafId = requestAnimationFrame(() => {
			mouseX = -(event.clientX / window.innerWidth - 0.5);
			mouseY = -(event.clientY / window.innerHeight - 0.5);
			rafId = 0;
		});
	}

	// Attach mousemove with passive:true for scroll performance
	$effect(() => {
		const el = sceneEl;
		if (!el) return;
		el.addEventListener('mousemove', handleMouseMove, { passive: true });
		return () => el.removeEventListener('mousemove', handleMouseMove);
	});

	// Layer parallax multipliers (px): back ~1-2px, mid ~2-3px, front ~3-4px
	let backX = $derived(mouseX * 3);   // max ±1.5px
	let backY = $derived(mouseY * 2);
	let midX = $derived(mouseX * 5);    // max ±2.5px
	let midY = $derived(mouseY * 3);
	let frontX = $derived(mouseX * 7);  // max ±3.5px
	let frontY = $derived(mouseY * 4);
</script>

<div class="world-scene" use:useVisibility bind:this={sceneEl}>
	<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYEnd meet" class="world-svg" role="img" aria-label="Burrow world scene showing a cozy cottage in rolling hills with your companion Ember the red panda">
		<title>Burrow world scene showing a cozy cottage in rolling hills with your companion Ember the red panda</title>
		<SvgFilters />
		<!-- 1. Sky background -->
		<Sky {time} />
		<!-- 2. Back hills + 3. Back trees (parallax — least movement) -->
		<g transform="translate({backX}, {backY})">
			<Hills layer="back" />
			<Trees layer="back" />
		</g>
		<!-- 4. Mid hills (parallax — medium movement) -->
		<g transform="translate({midX}, {midY})">
			<Hills layer="mid" />
		</g>
		<!-- 5. Buildings (cottage, garden, path) -->
		<Buildings {time} />
		<!-- 6. Front hills (parallax — most movement) -->
		<g transform="translate({frontX}, {frontY})">
			<Hills layer="front" />
		</g>
		<!-- 7. Front trees (parallax — most movement) -->
		<g transform="translate({frontX}, {frontY})">
			<Trees layer="front" />
		</g>
		<!-- 8. Companion (Ember) -->
		<Companion mood={appState.emberState} message={appState.emberMessage} />
		<!-- 9. Particles overlay -->
		<Particles {time} />
		<!-- 10. Paper texture overlay -->
		<rect x="0" y="0" width="800" height="600" filter="url(#paper-texture)" opacity="0.08" fill="#F5EBD8" pointer-events="none" />
	</svg>
</div>

<style>
	.world-scene {
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
		overflow: hidden;
		position: relative;
		box-sizing: border-box;
	}
	.world-svg {
		width: 100%;
		height: auto;
		display: block;
	}

	/* On desktop, cap the scene height so check-in sheet gets more space */
	@media (min-width: 1024px) {
		.world-scene {
			max-height: 60dvh;
		}
		.world-svg {
			max-height: 60dvh;
			object-fit: cover;
		}
	}

	/* Pause all child animations when offscreen */
	.world-scene:global([data-visible='false']) :global(*) {
		animation-play-state: paused !important;
	}
</style>
