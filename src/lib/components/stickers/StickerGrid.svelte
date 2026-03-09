<!-- StickerGrid.svelte — Grid display of collected stickers with locked/unlocked states -->
<script lang="ts">
	import { STICKER_CATALOG, CATEGORIES, getEarnedStickerIds, getAllStickers, type Sticker } from '$lib/services/stickers';

	let { onStickerReveal }: { onStickerReveal?: (sticker: Sticker) => void } = $props();

	let activeCategory = $state<string>('all');
	let earnedIds = $state<string[]>(getEarnedStickerIds() ?? []);
	let selectedSticker = $state<Sticker | null>(null);

	const catalog = $derived(getAllStickers());

	const filteredStickers = $derived(
		activeCategory === 'all'
			? catalog
			: catalog.filter((s) => s.category === activeCategory)
	);

	const earnedCount = $derived(earnedIds.length);

	function handleStickerTap(sticker: Sticker) {
		const isEarned = earnedIds.includes(sticker.id);
		if (isEarned) {
			selectedSticker = sticker;
			onStickerReveal?.(sticker);
		} else {
			selectedSticker = sticker;
		}
	}

	function dismissTooltip() {
		selectedSticker = null;
	}

	function categoryHint(category: string): string {
		const hints: Record<string, string> = {
			nature: '🌿 Explore the natural world',
			cozy: '🕯️ Find comfort and warmth',
			ember: '✨ Kindle your inner fire',
			weather: '🌬️ Weather every storm',
			milestone: '⭐ Reach new heights'
		};
		return hints[category] || 'Keep exploring!';
	}
</script>

<div class="sticker-collection bg-parchment rounded-3xl p-5">
	<!-- Header -->
	<div class="flex items-center justify-between mb-4">
		<h2 class="font-serif text-xl font-bold text-earth-brown">Sticker Collection</h2>
		<span class="bg-ember-orange/15 text-ember-orange text-sm font-semibold font-sans px-2.5 py-1 rounded-full">
			{earnedCount}/30 collected
		</span>
	</div>

	<!-- Filter Tabs -->
	<div class="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
		{#each CATEGORIES as cat}
			<button
				class="filter-tab shrink-0 px-3.5 py-1.5 rounded-full text-sm font-semibold font-sans transition-all duration-200 {activeCategory === cat.value
					? 'bg-ember-orange text-white shadow-sm'
					: 'bg-parchment-dark text-earth-brown hover:bg-earth-brown/10'}"
				onclick={() => (activeCategory = cat.value)}
				aria-pressed={activeCategory === cat.value}
				aria-label="Filter by {cat.label}"
			>
				{cat.label}
			</button>
		{/each}
	</div>

	<!-- Sticker Grid -->
	{#if filteredStickers.length === 0}
		<div class="text-center py-8">
			<p class="text-3xl mb-2">🌱</p>
			<p class="font-serif text-earth-brown/60 text-sm">
				{activeCategory === 'all' ? 'No stickers available yet.' : 'No stickers in this category yet.'}
			</p>
		</div>
	{:else}
	<div class="grid grid-cols-4 sm:grid-cols-6 gap-3">
		{#each filteredStickers as sticker (sticker.id)}
			{@const isEarned = earnedIds.includes(sticker.id)}
			<button
				class="sticker-slot aspect-square flex items-center justify-center transition-all duration-200 relative
					{isEarned
					? 'sticker-earned bg-parchment hover:scale-105'
					: 'sticker-locked bg-parchment-dark opacity-50 hover:opacity-70'}"
				onclick={() => handleStickerTap(sticker)}
				title={isEarned ? sticker.name : 'Locked'}
				aria-label={isEarned ? `${sticker.name} sticker - collected` : `Locked sticker - ${sticker.name}`}
			>
				{#if isEarned}
					<span class="sticker-emoji select-none">{sticker.emoji}</span>
				{:else}
					<span class="text-xl text-earth-brown/40 font-serif font-bold select-none">?</span>
				{/if}
			</button>
		{/each}
	</div>
	{/if}

	<!-- Empty earned hint -->
	{#if earnedCount === 0}
		<p class="text-center text-earth-brown/50 text-sm font-sans mt-4 italic">
			No stickers earned yet — complete check-ins, journal entries, and exercises to start collecting!
		</p>
	{/if}

	<!-- Selected sticker detail -->
	{#if selectedSticker}
		{@const isSelectedEarned = earnedIds.includes(selectedSticker.id)}
		{#if isSelectedEarned}
			<!-- Earned: show name below grid -->
			<div class="mt-4 text-center">
				<p class="font-serif text-earth-brown text-sm font-bold">
					{selectedSticker.emoji} {selectedSticker.name}
				</p>
				<p class="text-earth-brown/60 text-sm font-sans mt-1">{selectedSticker.description}</p>
			</div>
		{:else}
			<!-- Locked: show hint tooltip -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="fixed inset-0 bg-black/20 z-40"
				onclick={dismissTooltip}
				onkeydown={(e) => e.key === 'Escape' && dismissTooltip()}
			></div>
			<div class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-parchment rounded-2xl shadow-lg border border-earth-brown/15 p-5 max-w-64 w-full text-center" role="dialog" aria-label="Locked sticker: {selectedSticker.name}">
				<div class="text-4xl mb-2 opacity-30">🔒</div>
				<p class="font-serif font-bold text-earth-brown text-sm mb-1">{selectedSticker.name}</p>
				<p class="text-earth-brown/60 text-sm font-sans mb-2">{categoryHint(selectedSticker.category)}</p>
				<p class="text-earth-brown/50 text-sm font-sans italic">"{selectedSticker.triggerDescription}"</p>
				<button
					class="mt-3 text-sm text-ember-orange font-semibold font-sans hover:underline"
					onclick={dismissTooltip}
					aria-label="Close sticker details"
				>
					Close
				</button>
			</div>
		{/if}
	{/if}
</div>

<style>
	.sticker-emoji {
		font-size: 2rem;
		line-height: 1;
	}

	.sticker-earned {
		border-radius: 14px 16px 12px 18px;
		box-shadow: 0 0 12px rgba(242, 201, 76, 0.4);
		animation: subtle-glow 3s ease-in-out infinite;
	}

	.sticker-locked {
		border-radius: 50%;
	}

	@keyframes subtle-glow {
		0%, 100% {
			box-shadow: 0 0 8px rgba(242, 201, 76, 0.3);
		}
		50% {
			box-shadow: 0 0 16px rgba(242, 201, 76, 0.5);
		}
	}

	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
</style>
