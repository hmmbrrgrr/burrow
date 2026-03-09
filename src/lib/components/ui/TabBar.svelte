<!-- TabBar.svelte — Bottom navigation tab bar (Home, Toolbox, Journal, Stickers) -->
<script lang="ts">
	import { page } from '$app/stores';
	import NewBadge from './NewBadge.svelte';
	import { getNewUnlocks } from '$lib/services/unlocks';

	const tabs = [
		{ href: '/', label: 'Home', icon: '\uD83C\uDFE1', featureIds: ['cottage', 'garden'] },
		{ href: '/toolbox', label: 'Toolbox', icon: '\uD83E\uDDF0', featureIds: ['checkin', 'breathing', 'habits', 'exercises'] },
		{ href: '/journal', label: 'Journal', icon: '\uD83D\uDCD3', featureIds: ['journal'] },
		{ href: '/stickers', label: 'Stickers', icon: '\u2B50', featureIds: ['stickers'] },
	];

	let newUnlocks = $derived(getNewUnlocks());

	function tabHasNew(featureIds: string[]): boolean {
		return newUnlocks.some((u) => featureIds.includes(u.id));
	}
</script>

<nav class="tab-bar fixed bottom-0 inset-x-0 z-20 bg-parchment border-t border-parchment-dark">
	<div class="flex justify-around py-2">
		{#each tabs as tab}
			<a
				href={tab.href}
				class="tab-link flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-sans transition-colors {$page.url.pathname === tab.href ? 'text-ember-orange' : 'text-earth-brown/60'}"
			>
				<span class="tab-icon text-xl">
					{tab.icon}
					<NewBadge show={tabHasNew(tab.featureIds)} />
				</span>
				<span>{tab.label}</span>
			</a>
		{/each}
	</div>
</nav>

<style>
	.tab-link {
		position: relative;
	}
	.tab-icon {
		position: relative;
		display: inline-block;
	}
</style>
