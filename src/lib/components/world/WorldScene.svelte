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

	interface Props {
		time?: TimeOfDay;
	}

	let { time: timeProp }: Props = $props();

	let time = $derived(timeProp ?? getTimeOfDay());
</script>

<div class="world-scene">
	<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet" width="100%" class="world-svg">
		<SvgFilters />
		<!-- 1. Sky background -->
		<Sky {time} />
		<!-- 2. Back hills -->
		<Hills layer="back" />
		<!-- 3. Back trees -->
		<Trees layer="back" />
		<!-- 4. Mid hills -->
		<Hills layer="mid" />
		<!-- 5. Buildings (cottage, garden, path) -->
		<Buildings {time} />
		<!-- 6. Front hills -->
		<Hills layer="front" />
		<!-- 7. Front trees -->
		<Trees layer="front" />
		<!-- 8. Companion (Ember) -->
		<Companion mood={appState.emberState} message={appState.emberMessage} />
		<!-- 9. Particles overlay -->
		<Particles {time} />
	</svg>
</div>

<style>
	.world-scene {
		width: 100%;
		height: 100vh;
		overflow: hidden;
		position: relative;
	}
	.world-svg {
		width: 100%;
		height: 100%;
		display: block;
	}
</style>
