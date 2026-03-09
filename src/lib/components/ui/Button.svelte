<!-- Button.svelte — Themed button with variants (primary, secondary, ghost) -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	let { variant = 'primary', children, onclick, class: className = '' }: {
		variant?: 'primary' | 'secondary' | 'ghost';
		children: Snippet;
		onclick?: () => void;
		class?: string;
	} = $props();

	const variants = {
		primary: 'bg-ember-orange text-white hover:bg-ember-orange/90',
		secondary: 'bg-parchment-dark text-earth-brown hover:bg-parchment-dark/80',
		ghost: 'bg-transparent text-earth-brown hover:bg-parchment-dark/50',
	};
</script>

<button class="px-5 py-2.5 rounded-xl font-sans font-semibold transition-all {variants[variant]} {className}" {onclick}>
	{@render children()}
</button>
