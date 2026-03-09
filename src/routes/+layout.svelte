<!-- Root layout — Auth guard, tab bar, FAB, global styles -->
<script lang="ts">
	import '../app.css';
	import TabBar from '$lib/components/ui/TabBar.svelte';
	import FAB from '$lib/components/ui/FAB.svelte';
	import CheckInSheet from '$lib/components/checkin/CheckInSheet.svelte';
	import { appState } from '$lib/stores/app.svelte';
	import { getTimeOfDay } from '$lib/utils/time';
	import { hasCheckedInToday } from '$lib/services/checkins';
	import { getDaysSinceFirstOpen, getUnlockedFeatures } from '$lib/services/unlocks';
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

	// Refresh session-sensitive state when user returns to app (tab switch, phone unlock)
	// Prevents stale data if app stays open overnight or is backgrounded across days
	$effect(() => {
		function refreshSessionState() {
			appState.timeOfDay = getTimeOfDay();
			appState.checkedInToday = hasCheckedInToday();
			appState.daysSinceFirstOpen = getDaysSinceFirstOpen();
			appState.unlockedFeatures = getUnlockedFeatures().map((f) => f.id);
		}

		function handleVisibilityChange() {
			if (document.visibilityState === 'visible') {
				refreshSessionState();
			}
		}

		document.addEventListener('visibilitychange', handleVisibilityChange);
		return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
	});

	let timeOfDay = $derived(appState.timeOfDay);

	// TODO: Auth guard — redirect to login if not authenticated
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Nunito:wght@300;400;600;700&display=swap" rel="stylesheet" />
</svelte:head>

<div class="app min-h-screen bg-parchment font-sans text-earth-brown overflow-x-hidden" data-time={timeOfDay}>
	<main class="break-words overflow-x-hidden" id="main-content" style="padding-bottom: calc(5rem + env(safe-area-inset-bottom, 0px));">
		{#key $page.url.pathname}
			<div class="page-transition">
				{@render children()}
			</div>
		{/key}
	</main>
	<TabBar />
	<FAB
		onvoice={() => { brainDumpOpen = true; }}
		oncheckin={() => { appState.isCheckInOpen = true; }}
		onbreathe={() => { breathingOpen = true; }}
	/>
</div>

<CheckInSheet bind:open={appState.isCheckInOpen} />
{#if breathingOpen}
	{#await import('$lib/components/toolbox/BreathingExercise.svelte') then { default: BreathingExercise }}
		<BreathingExercise bind:open={breathingOpen} />
	{/await}
{/if}
{#if brainDumpOpen}
	{#await import('$lib/components/toolbox/BrainDump.svelte') then { default: BrainDump }}
		<BrainDump bind:open={brainDumpOpen} startWithVoice={true} />
	{/await}
{/if}
