<!-- Toolbox page — ADHD coping tools and timers -->
<script lang="ts">
	import { isUnlocked, getNextUnlock, FEATURE_SCHEDULE } from '$lib/services/unlocks';

	// Tools in the toolbox
	const toolIds = ['checkin', 'breathing', 'habits', 'exercises'];

	let tools = $derived(
		toolIds
			.map((id) => FEATURE_SCHEDULE.find((f) => f.id === id))
			.filter((f): f is NonNullable<typeof f> => f != null)
	);
</script>

<div class="toolbox p-4">
	<h1 class="font-serif text-2xl text-earth-brown mb-4">Toolbox</h1>

	<div class="grid gap-3">
		{#each tools as tool}
			{#if isUnlocked(tool.id)}
				<div class="tool-card bg-parchment-dark/50 rounded-2xl p-4">
					<span class="text-2xl">{tool.icon}</span>
					<div class="ml-3">
						<h3 class="font-sans font-bold text-earth-brown">{tool.name}</h3>
						<p class="font-sans text-sm text-earth-brown/60">{tool.description}</p>
					</div>
				</div>
			{:else}
				<div class="tool-card bg-parchment-dark/30 rounded-2xl p-4 opacity-50">
					<span class="text-2xl grayscale">🔒</span>
					<div class="ml-3">
						<h3 class="font-sans font-bold text-earth-brown/50">{tool.name}</h3>
						<p class="font-sans text-sm text-earth-brown/40">Coming soon...</p>
					</div>
				</div>
			{/if}
		{/each}
	</div>
</div>

<style>
	.tool-card {
		display: flex;
		align-items: center;
		transition: opacity 0.3s ease;
	}
	.grayscale {
		filter: grayscale(1);
	}
</style>
