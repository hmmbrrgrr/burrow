<!-- Home page — World view fills the screen, check-in flow overlays -->
<script lang="ts">
	import { onMount } from 'svelte';
	import WorldScene from '$lib/components/world/WorldScene.svelte';
	import CheckInSheet from '$lib/components/checkin/CheckInSheet.svelte';
	import { hasCheckedInToday } from '$lib/services/checkins';
	import { appState } from '$lib/stores/app.svelte';

	let checkInOpen = $state(false);

	onMount(() => {
		// Check localStorage for existing check-in
		appState.checkedInToday = hasCheckedInToday();

		// Auto-open if user hasn't checked in today
		if (!appState.checkedInToday) {
			setTimeout(() => {
				checkInOpen = true;
			}, 1200);
		}
	});

	function openCheckIn() {
		checkInOpen = true;
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
