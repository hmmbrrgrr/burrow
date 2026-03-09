<!-- FAB.svelte — Floating action button for voice input / quick check-in -->
<script lang="ts">
	let { onclick }: { onclick?: () => void } = $props();
	// TODO: Microphone icon, pulse animation when recording
</script>

<button
	class="fab fixed bottom-20 right-4 z-30 w-14 h-14 bg-ember-orange text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:scale-105 transition-transform"
	{onclick}
>
	🎤
</button>
