<!-- TabBar.svelte — Bottom navigation tab bar (Home, Toolbox, Journal, Stickers) -->
<script lang="ts">
	import { page } from '$app/stores';

	const tabs = [
		{ href: '/', label: 'Home', icon: '🏡' },
		{ href: '/toolbox', label: 'Toolbox', icon: '🧰' },
		{ href: '/journal', label: 'Journal', icon: '📓' },
		{ href: '/stickers', label: 'Stickers', icon: '⭐' },
	];
</script>

<nav class="tab-bar fixed bottom-0 inset-x-0 z-20 bg-parchment border-t border-parchment-dark">
	<div class="flex justify-around py-2">
		{#each tabs as tab}
			<a
				href={tab.href}
				class="flex flex-col items-center gap-0.5 px-3 py-1 text-xs font-sans transition-colors {$page.url.pathname === tab.href ? 'text-ember-orange' : 'text-earth-brown/60'}"
			>
				<span class="text-xl">{tab.icon}</span>
				<span>{tab.label}</span>
			</a>
		{/each}
	</div>
</nav>
