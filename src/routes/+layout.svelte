<!-- Root layout — Auth guard, tab bar, FAB, global styles -->
<script lang="ts">
	import '../app.css';
	import TabBar from '$lib/components/ui/TabBar.svelte';
	import FAB from '$lib/components/ui/FAB.svelte';

	let { children } = $props();

	// TODO: Auth guard — redirect to login if not authenticated
	// TODO: Drive data-time from getTimeOfDay()
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Nunito:wght@300;400;600;700&display=swap" rel="stylesheet" />
</svelte:head>

<div class="app min-h-screen bg-parchment font-sans text-earth-brown" data-time="morning">
	<main class="pb-20">
		{@render children()}
	</main>
	<FAB onclick={() => { /* TODO: Open voice input or check-in */ }} />
	<TabBar />
</div>
