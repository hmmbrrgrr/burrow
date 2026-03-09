<!-- Journal page — Quick voice/text journal entries -->
<script lang="ts">
	import { isUnlocked, getNextUnlock } from '$lib/services/unlocks';

	let journalUnlocked = $derived(isUnlocked('journal'));

	let nextInfo = $derived(() => {
		const next = getNextUnlock();
		if (next && next.feature.id === 'journal') return next;
		return null;
	});
</script>

<div class="journal p-4">
	<h1 class="font-serif text-2xl text-earth-brown mb-4">Journal</h1>

	{#if journalUnlocked}
		<p class="font-sans text-earth-brown/60">Your journal is being prepared...</p>
	{:else}
		<div class="locked-notice">
			<span class="lock-icon">🔒</span>
			<h2 class="font-serif text-lg text-earth-brown mt-2">The Reading Nook</h2>
			<p class="font-sans text-earth-brown/60 mt-1">
				This cozy corner is almost ready for you. Keep checking in and it will open soon.
			</p>
		</div>
	{/if}
</div>

<style>
	.locked-notice {
		text-align: center;
		padding: 3rem 1.5rem;
		opacity: 0.7;
	}
	.lock-icon {
		font-size: 2.5rem;
		filter: grayscale(0.5);
	}
</style>
