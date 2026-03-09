<!-- EmotionFlowers.svelte — Flower-picking emotion selector, each emotion is a different flower -->
<script lang="ts">
	let { selected = $bindable<string[]>([]) }: { selected: string[] } = $props();
	// TODO: SVG flower illustrations for each emotion
	const emotions = ['calm', 'anxious', 'happy', 'overwhelmed', 'focused', 'scattered', 'hopeful', 'tired'];
</script>

<div class="emotion-flowers grid grid-cols-4 gap-3 py-4">
	{#each emotions as emotion}
		<button
			class="p-2 rounded-lg text-xs font-sans transition-all {selected.includes(emotion) ? 'bg-lavender text-white' : 'bg-parchment-dark text-earth-brown'}"
			onclick={() => {
				if (selected.includes(emotion)) {
					selected = selected.filter(e => e !== emotion);
				} else {
					selected = [...selected, emotion];
				}
			}}
		>
			{emotion}
		</button>
	{/each}
</div>
