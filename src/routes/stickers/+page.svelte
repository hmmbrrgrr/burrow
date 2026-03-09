<!-- Stickers page — Collection of earned stickers -->
<script lang="ts">
	import StickerGrid from '$lib/components/stickers/StickerGrid.svelte';
	import { isUnlocked } from '$lib/services/unlocks';

	let stickersUnlocked = $derived(isUnlocked('stickers'));
</script>

<div class="stickers p-4">
	<h1 class="font-serif text-2xl text-earth-brown mb-4">Sticker Collection</h1>

	{#if stickersUnlocked}
		<StickerGrid />
	{:else}
		<div class="locked-notice">
			<span class="lock-icon">🔒</span>
			<h2 class="font-serif text-lg text-earth-brown mt-2">The Marketplace</h2>
			<p class="font-sans text-earth-brown/60 mt-1">
				A place to collect and trade is being set up. It will open when you are ready.
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
