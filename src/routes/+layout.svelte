<!-- Root layout — Auth guard, tab bar, FAB, global styles -->
<script lang="ts">
	import '../app.css';
	import TabBar from '$lib/components/ui/TabBar.svelte';
	import FAB from '$lib/components/ui/FAB.svelte';
	import CheckInSheet from '$lib/components/checkin/CheckInSheet.svelte';
	import BreathingExercise from '$lib/components/toolbox/BreathingExercise.svelte';
	import BrainDump from '$lib/components/toolbox/BrainDump.svelte';
	import { appState } from '$lib/stores/app.svelte';
	import { getTimeOfDay } from '$lib/utils/time';
	import { page } from '$app/stores';

	let { children } = $props();

	let breathingOpen = $state(false);
	let brainDumpOpen = $state(false);

	// Keep timeOfDay in sync — update every 60 seconds for day/night cycle
	$effect(() => {
		appState.timeOfDay = getTimeOfDay();
		const interval = setInterval(() => {
			appState.timeOfDay = getTimeOfDay();
		}, 60000);
		return () => clearInterval(interval);
	});

	let timeOfDay = $derived(appState.timeOfDay);

	// TODO: Auth guard — redirect to login if not authenticated
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Nunito:wght@300;400;600;700&display=swap" rel="stylesheet" />
</svelte:head>

<div class="app min-h-screen bg-parchment font-sans text-earth-brown" data-time={timeOfDay}>
	<main class="pb-20 break-words">
		{#key $page.url.pathname}
			<div class="page-transition">
				{@render children()}
			</div>
		{/key}
	</main>
	<FAB
		onvoice={() => { brainDumpOpen = true; }}
		oncheckin={() => { appState.isCheckInOpen = true; }}
		onbreathe={() => { breathingOpen = true; }}
	/>
	<TabBar />
</div>

<CheckInSheet bind:open={appState.isCheckInOpen} />
<BreathingExercise bind:open={breathingOpen} />
<BrainDump bind:open={brainDumpOpen} startWithVoice={true} />
