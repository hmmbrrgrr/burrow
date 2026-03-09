<!-- EnergySelector.svelte — Visual battery/spoon energy level selector (1-5 scale) -->
<script lang="ts">
	let { level = $bindable(3) }: { level: number } = $props();
	// TODO: Animated battery or spoon visual
</script>

<div class="energy-selector flex gap-2 justify-center py-4">
	{#each [1, 2, 3, 4, 5] as value}
		<button
			class="w-10 h-10 rounded-full transition-all {level >= value ? 'bg-ember-orange' : 'bg-parchment-dark'}"
			onclick={() => level = value}
		>
			{value}
		</button>
	{/each}
</div>
