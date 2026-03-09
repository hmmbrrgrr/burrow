<!-- Buildings.svelte — Composes Cottage, Garden, and Path with unlock states -->
<script lang="ts">
	import type { TimeOfDay } from '$lib/utils/time';
	import Cottage from './Cottage.svelte';
	import Garden from './Garden.svelte';
	import Path from './Path.svelte';
	import LockedOverlay from './LockedOverlay.svelte';
	import { isUnlocked, getDaysSinceFirstOpen, getNextUnlock, FEATURE_SCHEDULE } from '$lib/services/unlocks';

	interface Props {
		time: TimeOfDay;
	}

	let { time }: Props = $props();

	let gardenUnlocked = $derived(isUnlocked('garden'));
	let cottageUnlocked = $derived(isUnlocked('cottage'));
	let days = $derived(getDaysSinceFirstOpen());

	// Garden growth stage: bare (0-1), seedlings (2-6), bloom (7+)
	let gardenStage = $derived<1 | 2 | 3>(days <= 1 ? 1 : days < 7 ? 2 : 3);

	function daysUntilFeature(id: string): number {
		const feature = FEATURE_SCHEDULE.find((f) => f.id === id);
		if (!feature) return 0;
		return Math.max(0, feature.unlockDay - days);
	}
</script>

<g class="buildings">
	<Path />

	<!-- Garden — greyed out silhouette when locked -->
	<g class="garden-wrapper" class:locked={!gardenUnlocked}>
		<Garden stage={gardenUnlocked ? gardenStage : 1} />
		{#if !gardenUnlocked}
			<LockedOverlay x={326} y={355} width={52} height={42} daysUntil={daysUntilFeature('garden')} label="Garden" />
		{/if}
	</g>

	<!-- Cottage — always visible (unlocks day 0), but wrapped for consistency -->
	<g class="cottage-wrapper" class:locked={!cottageUnlocked}>
		<Cottage {time} />
		{#if !cottageUnlocked}
			<LockedOverlay x={236} y={296} width={78} height={80} daysUntil={daysUntilFeature('cottage')} label="Cottage" />
		{/if}
	</g>
</g>

<style>
	.locked {
		opacity: 0.35;
		filter: saturate(0.2);
		transition: opacity 0.6s ease, filter 0.6s ease;
	}
	.garden-wrapper,
	.cottage-wrapper {
		transition: opacity 0.6s ease, filter 0.6s ease;
	}
	.garden-wrapper:not(.locked),
	.cottage-wrapper:not(.locked) {
		animation: world-appear 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
	}
	@keyframes world-appear {
		from {
			opacity: 0.35;
			filter: saturate(0.2);
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			filter: saturate(1);
			transform: scale(1);
		}
	}
</style>
