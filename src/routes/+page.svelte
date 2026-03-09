<svelte:head>
	<title>Home — Burrow</title>
</svelte:head>

<!-- Home page — World view fills the screen, check-in flow overlays -->
<script lang="ts">
	import { onMount } from 'svelte';
	import WorldScene from '$lib/components/world/WorldScene.svelte';
	import WorldSkeleton from '$lib/components/world/WorldSkeleton.svelte';
	import UnlockCelebration from '$lib/components/ui/UnlockCelebration.svelte';
	import StreakDisplay from '$lib/components/checkin/StreakDisplay.svelte';
	import InsightsDashboard from '$lib/components/checkin/InsightsDashboard.svelte';
	import DailyHabits from '$lib/components/habits/DailyHabits.svelte';
	import { hasCheckedInToday, getAllCheckIns } from '$lib/services/checkins';
	import { getEntries as getJournalEntries } from '$lib/services/journal';
	import { getCurrentStreak } from '$lib/services/insights';
	import { getEmberInsightMessage } from '$lib/services/ember-insights';
	import { getContextualResponse } from '$lib/services/ember-responses';
	import {
		setFirstOpenDate,
		getDaysSinceFirstOpen,
		getUnlockedFeatures,
		getNewUnlocks,
		markUnlockSeen,
		isUnlocked,
		type FeatureUnlock,
	} from '$lib/services/unlocks';
	import { appState, resetSessionState } from '$lib/stores/app.svelte';

	let loaded = $state(false);
	let celebrationQueue = $state<FeatureUnlock[]>([]);
	let currentCelebration = $derived(celebrationQueue.length > 0 ? celebrationQueue[0] : null);
	let showInsights = $state(false);
	let habitsUnlocked = $derived(isUnlocked('habits'));
	let insightsUnlocked = $derived(isUnlocked('insights'));

	// Show skeleton until world scene components have mounted
	$effect(() => {
		const timer = setTimeout(() => { loaded = true; }, 100);
		return () => clearTimeout(timer);
	});

	function updateEmberInsight() {
		if (typeof window === 'undefined') return;
		const checkIns = getAllCheckIns();
		const journal = getJournalEntries();
		const streak = getCurrentStreak();
		const insight = getEmberInsightMessage(checkIns, journal, streak.count);
		if (insight) {
			appState.emberMessage = insight.message;
			appState.emberState = insight.emberState;
		}
	}

	onMount(() => {
		// Reset transient state to prevent stale data from previous session / overnight SPA
		resetSessionState();

		// Initialize first open date (no-op if already set)
		setFirstOpenDate();

		// Refresh state from localStorage with safe fallbacks
		try {
			appState.daysSinceFirstOpen = getDaysSinceFirstOpen();
		} catch {
			appState.daysSinceFirstOpen = 0;
		}

		try {
			appState.unlockedFeatures = getUnlockedFeatures().map((f) => f.id);
		} catch {
			appState.unlockedFeatures = [];
		}

		// Check for new unlocks to celebrate
		let newUnlocks: FeatureUnlock[] = [];
		try {
			newUnlocks = getNewUnlocks();
			if (newUnlocks.length > 0) {
				celebrationQueue = [...newUnlocks];
			}
		} catch {
			// Corrupted unlock data — skip celebrations
		}

		// Check localStorage for existing check-in
		try {
			appState.checkedInToday = hasCheckedInToday();
		} catch {
			appState.checkedInToday = false;
		}

		// Update Ember contextual insight
		updateEmberInsight();

		// Auto-open check-in if no celebrations and hasn't checked in
		if (!appState.checkedInToday && newUnlocks.length === 0) {
			setTimeout(() => {
				appState.isCheckInOpen = true;
			}, 1200);
		}
	});

	// After check-in completes, show contextual Ember response with a delay
	$effect(() => {
		if (appState.checkedInToday && !appState.isCheckInOpen) {
			const timer = setTimeout(() => {
				const response = getContextualResponse();
				if (response) {
					appState.emberState = response.state;
					appState.emberMessage = response.message;
				}
			}, 2000);
			return () => clearTimeout(timer);
		}
	});

	function openCheckIn() {
		appState.isCheckInOpen = true;
	}

	function dismissCelebration() {
		if (currentCelebration) {
			markUnlockSeen(currentCelebration.id);
		}
		celebrationQueue = celebrationQueue.slice(1);

		// After all celebrations, open check-in if needed
		if (celebrationQueue.length === 0 && !appState.checkedInToday) {
			setTimeout(() => {
				appState.isCheckInOpen = true;
			}, 600);
		}
	}
</script>

<div class="home">
	<div class="world-section">
		{#if loaded}
			<WorldScene />
		{:else}
			<WorldSkeleton />
		{/if}

		<!-- Streak display overlay near Ember -->
		{#if appState.checkedInToday}
			<div class="streak-overlay">
				<StreakDisplay />
			</div>
		{/if}
	</div>

	<!-- Daily habits widget (only after check-in, hidden during check-in sheet, gated by unlock) -->
	{#if habitsUnlocked && appState.checkedInToday && !appState.isCheckInOpen}
		<div class="habits-overlay">
			<DailyHabits />
		</div>
	{/if}

	<!-- Check-in button / indicator -->
	{#if appState.checkedInToday}
		<div class="checkin-indicator">
			{'\u2713'} Checked in
		</div>
		{#if insightsUnlocked}
			<button class="insights-btn" onclick={() => showInsights = true}>
				Insights
			</button>
		{/if}
	{:else}
		<button class="checkin-btn" onclick={openCheckIn}>
			Check In
		</button>
	{/if}

	<!-- Insights bottom sheet -->
	{#if showInsights}
		<InsightsDashboard onclose={() => showInsights = false} />
	{/if}

	<!-- Unlock celebration overlay -->
	{#if currentCelebration}
		<UnlockCelebration feature={currentCelebration} onDismiss={dismissCelebration} />
	{/if}
</div>

<style>
	.home {
		position: relative;
		min-height: 100dvh;
		overflow-y: auto;
		overflow-x: hidden;
		background: var(--bg, #06060A);
		max-width: 100%;
		box-sizing: border-box;
	}

	.world-section {
		position: relative;
		width: 100%;
		max-width: 100%;
		min-height: 0;
		overflow: hidden;
		box-sizing: border-box;
	}

	.streak-overlay {
		position: absolute;
		bottom: 180px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 20;
	}

	.insights-btn {
		position: fixed;
		bottom: calc(96px + env(safe-area-inset-bottom, 0px));
		left: 50%;
		transform: translateX(-50%);
		z-index: 30;
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.5);
		font-family: var(--font-sans);
		font-size: 0.875rem;
		font-weight: 500;
		text-decoration: underline;
		text-underline-offset: 2px;
		cursor: pointer;
		padding: 12px 20px;
		min-height: 44px;
		transition: color 0.2s ease;
		-webkit-tap-highlight-color: transparent;
	}

	.insights-btn:hover {
		color: rgba(255, 255, 255, 0.7);
	}

	.habits-overlay {
		position: fixed;
		bottom: calc(120px + env(safe-area-inset-bottom, 0px));
		left: 50%;
		transform: translateX(-50%);
		z-index: 15;
		width: 100%;
		max-width: 420px;
		padding: 0 16px;
		box-sizing: border-box;
	}

	.checkin-btn {
		position: fixed;
		bottom: calc(64px + env(safe-area-inset-bottom, 0px));
		left: 50%;
		transform: translateX(-50%);
		z-index: 30;
		padding: 14px 32px;
		min-height: 44px;
		border: none;
		border-radius: 14px 18px 12px 16px;
		background: #E8945A;
		color: white;
		font-family: var(--font-sans);
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		box-shadow: 0 4px 20px rgba(232, 148, 90, 0.4);
		transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
			box-shadow 0.2s ease;
		-webkit-tap-highlight-color: transparent;
		touch-action: manipulation;
	}

	.checkin-btn:active {
		transform: translateX(-50%) scale(0.95);
	}

	.checkin-indicator {
		position: fixed;
		bottom: calc(64px + env(safe-area-inset-bottom, 0px));
		left: 50%;
		transform: translateX(-50%);
		z-index: 30;
		padding: 10px 24px;
		min-height: 44px;
		display: flex;
		align-items: center;
		border-radius: 14px 18px 12px 16px;
		background: rgba(139, 175, 124, 0.9);
		color: white;
		font-family: var(--font-sans);
		font-size: 0.875rem;
		font-weight: 600;
		pointer-events: none;
	}
</style>
