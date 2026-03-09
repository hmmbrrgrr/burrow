<!-- WorldScene.svelte — Main container for the illustrated world view, composing Sky, Hills, Buildings, Companion, and Particles -->
<script lang="ts">
	import SvgFilters from './SvgFilters.svelte';
	import Sky from './Sky.svelte';
	import Hills from './Hills.svelte';
	import Buildings from './Buildings.svelte';
	import Companion from './Companion.svelte';
	import Particles from './Particles.svelte';

	// TODO: Accept time-of-day prop to drive the scene's visual state
</script>

<div class="world-scene relative w-full h-80 overflow-hidden rounded-2xl">
	<SvgFilters />
	<Sky>
		<Particles />
	</Sky>
	<Hills />
	<Buildings />
	<Companion />
</div>
