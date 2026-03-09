<svelte:head>
	<title>Stickers — Burrow</title>
</svelte:head>

<!-- Stickers page — Collection of earned stickers -->
<script lang="ts">
	import { onMount } from 'svelte';
	import StickerGrid from '$lib/components/stickers/StickerGrid.svelte';
	import StickerReveal from '$lib/components/stickers/StickerReveal.svelte';
	import { isUnlocked } from '$lib/services/unlocks';
	import { checkStickers, getEarnedStickerIds, STICKER_CATALOG, type Sticker } from '$lib/services/stickers';
	import { useVisibility } from '$lib/utils/visibility';

	let stickersUnlocked = $derived(isUnlocked('stickers'));
	let earnedCount = $derived(getEarnedStickerIds().length);
	let revealSticker = $state<Sticker | null>(null);
	let showReveal = $state(false);

	onMount(() => {
		const newlyEarned = checkStickers();
		if (newlyEarned.length > 0) {
			const sticker = STICKER_CATALOG.find((s) => s.id === newlyEarned[0]);
			if (sticker) {
				revealSticker = sticker;
				showReveal = true;
			}
		}
	});

	function handleCollect() {
		showReveal = false;
		revealSticker = null;
	}
</script>

<div class="stickers-page min-h-screen bg-parchment pb-24" use:useVisibility>
	{#if stickersUnlocked}
		{#if earnedCount === 0}
			<div class="empty-collection">
				<!-- Floating icon with sparkle decorations -->
				<div class="empty-icon-wrap" aria-hidden="true">
					<span class="twinkle twinkle-1">✨</span>
					<span class="twinkle twinkle-2">✨</span>
					<span class="twinkle twinkle-3">✨</span>
					<svg class="empty-illustration" viewBox="0 0 160 150" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Empty sticker album">
						<!-- Album/book shape -->
						<rect x="30" y="35" width="100" height="85" rx="8" fill="#EDE0C8" stroke="#C4B396" stroke-width="1.5" />
						<!-- Album cover detail -->
						<rect x="38" y="43" width="84" height="69" rx="5" fill="#F5EBD8" stroke="#C4B396" stroke-width="1" opacity="0.7" />
						<!-- Empty grid slots -->
						<rect x="46" y="52" width="22" height="22" rx="6" fill="#E8E0D0" opacity="0.6" />
						<rect x="74" y="52" width="22" height="22" rx="6" fill="#E8E0D0" opacity="0.6" />
						<rect x="102" y="52" width="14" height="22" rx="5" fill="#E8E0D0" opacity="0.4" />
						<rect x="46" y="80" width="22" height="22" rx="6" fill="#E8E0D0" opacity="0.5" />
						<rect x="74" y="80" width="22" height="22" rx="6" fill="#E8E0D0" opacity="0.4" />
						<rect x="102" y="80" width="14" height="22" rx="5" fill="#E8E0D0" opacity="0.3" />
						<!-- Album spine -->
						<rect x="30" y="35" width="8" height="85" rx="4" fill="#C4B396" opacity="0.5" />
						<!-- Star on top -->
						<g class="star-float">
							<path d="M80 8 L84.5 19.5 L97 19.5 L87 27 L90.5 38.5 L80 31 L69.5 38.5 L73 27 L63 19.5 L75.5 19.5 Z" fill="#E8945A" opacity="0.8" />
							<path d="M80 12 L83 20 L91 20 L84.5 25.5 L87 33 L80 28 L73 33 L75.5 25.5 L69 20 L77 20 Z" fill="#F2C94C" opacity="0.6" />
						</g>
						<!-- Small sparkles -->
						<circle cx="45" cy="22" r="2" fill="#E8945A" opacity="0.4" class="sparkle sparkle-1" />
						<circle cx="118" cy="16" r="1.5" fill="#B5A0D1" opacity="0.4" class="sparkle sparkle-2" />
						<circle cx="55" cy="132" r="1.5" fill="#8BAF7C" opacity="0.3" class="sparkle sparkle-3" />
					</svg>
				</div>
				<span class="sr-only">Decorative sticker album illustration with sparkles</span>
				<p class="empty-title font-serif text-lg text-earth-brown">Your Collection Awaits</p>
				<p class="empty-hint font-sans text-sm text-earth-brown/50">
					Complete check-ins and journal entries to earn stickers!
				</p>
			</div>
		{:else}
			<div class="p-4">
				<div class="flex justify-between items-baseline mb-4">
					<h1 class="font-serif text-2xl text-earth-brown">Sticker Collection</h1>
					<span class="text-sm font-sans text-earth-brown/60">{earnedCount}/30 collected</span>
				</div>
				<StickerGrid />
			</div>
		{/if}
	{:else}
		<div class="locked-notice">
			<span class="lock-icon">🔒</span>
			<h2 class="font-serif text-lg text-earth-brown mt-2">The Marketplace</h2>
			<p class="font-sans text-earth-brown/60 mt-1">
				A place to collect and trade is being set up. It will open when you are ready.
			</p>
		</div>
	{/if}

	{#if showReveal && revealSticker}
		<StickerReveal sticker={revealSticker} onCollect={handleCollect} />
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

	/* Empty collection state */
	.empty-collection {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 3rem 1.5rem;
	}
	.empty-icon-wrap {
		position: relative;
		animation: float 3s ease-in-out infinite;
		margin-bottom: 20px;
	}
	.empty-illustration {
		width: 140px;
		height: auto;
	}
	.empty-title {
		margin: 0 0 8px;
	}
	.empty-hint {
		margin: 0;
		max-width: 240px;
	}

	/* Twinkle sparkle decorations */
	.twinkle {
		position: absolute;
		font-size: 0.9rem;
		animation: twinkle 2s ease-in-out infinite;
		pointer-events: none;
		z-index: 1;
	}
	.twinkle-1 { top: -4px; left: -8px; animation-delay: 0s; }
	.twinkle-2 { top: 12px; right: -12px; animation-delay: 0.3s; }
	.twinkle-3 { bottom: 20px; left: -6px; animation-delay: 0.6s; }

	@keyframes twinkle {
		0%, 100% { opacity: 0; transform: scale(0.7); }
		50% { opacity: 1; transform: scale(1); }
	}

	@keyframes float {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-6px); }
	}

	/* Star float animation */
	.star-float {
		animation: star-bob 3s ease-in-out infinite;
		transform-origin: center;
	}
	@keyframes star-bob {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-5px); }
	}

	/* Sparkle pulse */
	.sparkle {
		animation: sparkle-pulse 2.5s ease-in-out infinite;
	}
	.sparkle-1 { animation-delay: 0s; }
	.sparkle-2 { animation-delay: 0.8s; }
	.sparkle-3 { animation-delay: 1.6s; }
	@keyframes sparkle-pulse {
		0%, 100% { opacity: 0.2; transform: scale(0.8); }
		50% { opacity: 0.7; transform: scale(1.3); }
	}

	/* Responsive max-width for stickers page content */
	.stickers-page {
		max-width: 720px;
		margin: 0 auto;
	}

	@media (min-width: 1440px) {
		.stickers-page {
			max-width: 960px;
		}
	}

	/* Pause all child animations when offscreen */
	.stickers-page:global([data-visible='false']) :global(*) {
		animation-play-state: paused !important;
	}
</style>
