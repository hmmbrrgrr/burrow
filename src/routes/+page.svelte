<!-- Home page — World view + check-in entry point -->
<script lang="ts">
	import WorldScene from '$lib/components/world/WorldScene.svelte';
	import { formatDate } from '$lib/utils/formatting';
	import { COMPANION_NAME } from '$lib/utils/constants';
</script>

<div class="home p-4 space-y-4">
	<header class="text-center pt-2">
		<h1 class="font-serif text-2xl text-earth-brown">Good morning!</h1>
		<p class="font-sans text-sm text-earth-brown/60">{formatDate(new Date())}</p>
	</header>

	<WorldScene />

	<div class="text-center py-4">
		<p class="font-sans text-earth-brown/80">{COMPANION_NAME} is here with you today.</p>
	</div>
</div>
