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

	function isActive(href: string, pathname: string): boolean {
		if (href === '/') return pathname === '/';
		return pathname === href || pathname.startsWith(href + '/');
	}

	let activeIndex = $derived(
		tabs.findIndex((tab) => isActive(tab.href, $page.url.pathname))
	);
</script>

<nav class="tab-bar fixed bottom-0 inset-x-0 z-20 border-t border-parchment-dark" aria-label="Main navigation" style="padding-bottom: env(safe-area-inset-bottom, 0px); background: rgba(245, 235, 216, 0.92); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);">
	<div class="tab-container flex justify-around py-2">
		<!-- Sliding active indicator -->
		<div
			class="tab-indicator"
			style="transform: translateX({activeIndex * 100}%);"
		></div>
		{#each tabs as tab}
			<a
				href={tab.href}
				class="tab-link flex flex-col items-center justify-center gap-0.5 px-3 py-2 min-h-[44px] min-w-[44px] text-sm font-sans transition-colors {isActive(tab.href, $page.url.pathname) ? 'text-ember-orange' : 'text-earth-brown/80'}"
				aria-current={isActive(tab.href, $page.url.pathname) ? 'page' : undefined}
				aria-label={tab.label}
			>
				<span class="tab-icon text-xl" class:tab-icon-active={isActive(tab.href, $page.url.pathname)}>
					{tab.icon}
					<NewBadge show={tabHasNew(tab.featureIds)} />
				</span>
				<span>{tab.label}</span>
			</a>
		{/each}
	</div>
</nav>

<style>
	.tab-container {
		position: relative;
	}
	.tab-indicator {
		position: absolute;
		bottom: 0;
		left: 0;
		width: calc(100% / 4);
		height: 4px;
		display: flex;
		justify-content: center;
		transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.tab-indicator::after {
		content: '';
		width: 24px;
		height: 4px;
		border-radius: 9999px;
		background: var(--color-ember-orange, #E8945A);
		box-shadow: 0 0 8px rgba(232, 148, 90, 0.4);
	}
	.tab-link {
		position: relative;
		flex: 1;
		z-index: 1;
		min-height: 44px;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}
	.tab-icon {
		position: relative;
		display: inline-block;
		transition: transform 0.2s ease;
	}
	.tab-icon-active {
		transform: scale(1.1);
	}
</style>
