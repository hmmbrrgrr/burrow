<!-- Home page — World view fills the screen, check-in flow overlays -->
<script lang="ts">
	import { onMount } from 'svelte';
	import WorldScene from '$lib/components/world/WorldScene.svelte';
	import CheckInSheet from '$lib/components/checkin/CheckInSheet.svelte';
	import UnlockCelebration from '$lib/components/ui/UnlockCelebration.svelte';
	import { hasCheckedInToday } from '$lib/services/checkins';
	import {
		setFirstOpenDate,
		getDaysSinceFirstOpen,
		getUnlockedFeatures,
		getNewUnlocks,
		markUnlockSeen,
		type FeatureUnlock,
	} from '$lib/services/unlocks';
	import { appState } from '$lib/stores/app.svelte';

	let checkInOpen = $state(false);
	let celebrationQueue = $state<FeatureUnlock[]>([]);
	let currentCelebration = $derived(celebrationQueue.length > 0 ? celebrationQueue[0] : null);

	onMount(() => {
		// Initialize first open date (no-op if already set)
		setFirstOpenDate();

		// Sync unlock state to global store
		appState.daysSinceFirstOpen = getDaysSinceFirstOpen();
		appState.unlockedFeatures = getUnlockedFeatures().map((f) => f.id);

		// Check for new unlocks to celebrate
		const newUnlocks = getNewUnlocks();
		if (newUnlocks.length > 0) {
			celebrationQueue = [...newUnlocks];
		}

		// Check localStorage for existing check-in
		appState.checkedInToday = hasCheckedInToday();

		// Auto-open check-in if no celebrations and hasn't checked in
		if (!appState.checkedInToday && newUnlocks.length === 0) {
			setTimeout(() => {
				checkInOpen = true;
			}, 1200);
		}
	});

	function openCheckIn() {
		checkInOpen = true;
	}

	function dismissCelebration() {
		if (currentCelebration) {
			markUnlockSeen(currentCelebration.id);
		}
		celebrationQueue = celebrationQueue.slice(1);

		// After all celebrations, open check-in if needed
		if (celebrationQueue.length === 0 && !appState.checkedInToday) {
			setTimeout(() => {
				checkInOpen = true;
			}, 600);
		}
	}
</script>

<div class="home">
	<WorldScene />

	<!-- Check-in button / indicator -->
	{#if appState.checkedInToday}
		<div class="checkin-indicator">
			{'\u2713'} Checked in
		</div>
	{:else}
		<button class="checkin-btn" onclick={openCheckIn}>
			Check In
		</button>
	{/if}

	<CheckInSheet bind:open={checkInOpen} />

	<!-- Unlock celebration overlay -->
	{#if currentCelebration}
		<UnlockCelebration feature={currentCelebration} onDismiss={dismissCelebration} />
	{/if}
</div>

<style>
	.home {
		position: fixed;
		inset: 0;
		overflow: hidden;
	}

	.checkin-btn {
		position: fixed;
		bottom: max(24px, env(safe-area-inset-bottom, 24px));
		left: 50%;
		transform: translateX(-50%);
		z-index: 30;
		padding: 14px 32px;
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
	}

	.checkin-btn:active {
		transform: translateX(-50%) scale(0.95);
	}

	.checkin-indicator {
		position: fixed;
		bottom: max(24px, env(safe-area-inset-bottom, 24px));
		left: 50%;
		transform: translateX(-50%);
		z-index: 30;
		padding: 10px 24px;
		border-radius: 14px 18px 12px 16px;
		background: rgba(139, 175, 124, 0.9);
		color: white;
		font-family: var(--font-sans);
		font-size: 0.85rem;
		font-weight: 600;
		pointer-events: none;
	}
</style>
