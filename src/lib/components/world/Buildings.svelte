<!-- Buildings.svelte — Composes Cottage, Garden, and Path -->
<script lang="ts">
	import type { TimeOfDay } from '$lib/utils/time';
	import Cottage from './Cottage.svelte';
	import Garden from './Garden.svelte';
	import Path from './Path.svelte';

	interface Props {
		time: TimeOfDay;
	}

	let { time }: Props = $props();
</script>

<g class="buildings">
	<Path />
	<Garden stage={2} />
	<Cottage {time} />
</g>
