<svelte:head>
	<title>Toolbox — Burrow</title>
</svelte:head>

<!-- Toolbox page — ADHD coping tools grid -->
<script lang="ts">
	import { isUnlocked } from '$lib/services/unlocks';
	import { appState } from '$lib/stores/app.svelte';
	import { goto } from '$app/navigation';
	import BreathingExercise from '$lib/components/toolbox/BreathingExercise.svelte';
	import FocusTimer from '$lib/components/toolbox/FocusTimer.svelte';
	import BrainDump from '$lib/components/toolbox/BrainDump.svelte';
	import GroundingExercise from '$lib/components/toolbox/GroundingExercise.svelte';
	import BodyDoubling from '$lib/components/toolbox/BodyDoubling.svelte';
	import EmotionWheel from '$lib/components/toolbox/EmotionWheel.svelte';
	import ThoughtReframe from '$lib/components/toolbox/ThoughtReframe.svelte';
	import HabitTracker from '$lib/components/toolbox/HabitTracker.svelte';
	import WindDown from '$lib/components/toolbox/WindDown.svelte';
	import PersonalInventory from '$lib/components/toolbox/PersonalInventory.svelte';

	let breathingOpen = $state(false);
	let timerOpen = $state(false);
	let brainDumpOpen = $state(false);
	let groundingOpen = $state(false);
	let bodyDoublingOpen = $state(false);
	let emotionWheelOpen = $state(false);
	let thoughtReframeOpen = $state(false);
	let habitTrackerOpen = $state(false);
	let windDownOpen = $state(false);
	let inventoryOpen = $state(false);

	interface ToolItem {
		id: string;
		icon: string;
		name: string;
		description: string;
		color: string;
		shadow: string;
		action: () => void;
		unlockId?: string; // maps to unlock system; if absent, always available
	}

	const tools: ToolItem[] = [
		{
			id: 'checkin',
			icon: '☀️',
			name: 'Quick Check-In',
			description: 'How are you feeling right now?',
			color: '#E8945A',
			shadow: 'rgba(232, 148, 90, 0.15)',
			action: () => { appState.isCheckInOpen = true; },
			unlockId: 'checkin',
		},
		{
			id: 'breathing',
			icon: '🌬️',
			name: 'Breathing',
			description: 'A calming breathing exercise',
			color: '#B5A0D1',
			shadow: 'rgba(181, 160, 209, 0.15)',
			action: () => { breathingOpen = true; },
			unlockId: 'breathing',
		},
		{
			id: 'journal',
			icon: '📖',
			name: 'Journal',
			description: 'Write down your thoughts',
			color: '#98BF82',
			shadow: 'rgba(152, 191, 130, 0.15)',
			action: () => { goto('/journal'); },
			unlockId: 'journal',
		},
		{
			id: 'timer',
			icon: '⏱️',
			name: 'Focus Timer',
			description: '25 min work, 5 min break',
			color: '#E8945A',
			shadow: 'rgba(232, 148, 90, 0.15)',
			action: () => { timerOpen = true; },
		},
		{
			id: 'braindump',
			icon: '📋',
			name: 'Brain Dump',
			description: 'Get it out of your head',
			color: '#9EC5D6',
			shadow: 'rgba(158, 197, 214, 0.15)',
			action: () => { brainDumpOpen = true; },
		},
		{
			id: 'grounding',
			icon: '🌍',
			name: 'Grounding',
			description: 'Land in the moment',
			color: '#B5A0D1',
			shadow: 'rgba(181, 160, 209, 0.15)',
			action: () => { groundingOpen = true; },
		},
		{
			id: 'bodydoubling',
			icon: '🤝',
			name: 'Body Doubling',
			description: 'Work with Ember',
			color: '#98BF82',
			shadow: 'rgba(152, 191, 130, 0.15)',
			action: () => { bodyDoublingOpen = true; },
		},
		{
			id: 'emotiongarden',
			icon: '🌻',
			name: 'Emotion Garden',
			description: "What's blooming?",
			color: '#F2C94C',
			shadow: 'rgba(242, 201, 76, 0.15)',
			action: () => { emotionWheelOpen = true; },
		},
		{
			id: 'thoughtreframe',
			icon: '💭',
			name: 'Thought Reframe',
			description: 'A kinder lens',
			color: '#B5A0D1',
			shadow: 'rgba(181, 160, 209, 0.15)',
			action: () => { thoughtReframeOpen = true; },
		},
		{
			id: 'habits',
			icon: '🔥',
			name: 'Habits',
			description: 'Your daily wins',
			color: '#E8945A',
			shadow: 'rgba(232, 148, 90, 0.15)',
			action: () => { habitTrackerOpen = true; },
		},
		{
			id: 'winddown',
			icon: '🌙',
			name: 'Wind Down',
			description: 'Settle in for the night',
			color: '#5C4D3C',
			shadow: 'rgba(92, 77, 60, 0.15)',
			action: () => { windDownOpen = true; },
		},
		{
			id: 'inventory',
			icon: '📓',
			name: 'Personal Inventory',
			description: 'Guided self-reflection',
			color: '#B5A0D1',
			shadow: 'rgba(181, 160, 209, 0.15)',
			action: () => { inventoryOpen = true; },
		},
	];

	function isToolUnlocked(tool: ToolItem): boolean {
		if (!tool.unlockId) return true;
		return isUnlocked(tool.unlockId);
	}
</script>

<div class="toolbox-page">
	<header class="toolbox-header">
		<h1 class="title"><span class="icon">🧰</span> Toolbox</h1>
	</header>

	<div class="tools-grid">
		{#each tools as tool (tool.id)}
			{#if isToolUnlocked(tool)}
				<button
					class="tool-card"
					style="--accent: {tool.color}; --shadow-color: {tool.shadow};"
					onclick={tool.action}
				>
					<span class="tool-icon">{tool.icon}</span>
					<h3 class="tool-name">{tool.name}</h3>
					<p class="tool-desc">{tool.description}</p>
				</button>
			{:else}
				<div class="tool-card locked">
					<span class="tool-icon">🔒</span>
					<h3 class="tool-name">{tool.name}</h3>
					<p class="tool-desc">Coming soon...</p>
				</div>
			{/if}
		{/each}
	</div>
</div>

<BreathingExercise bind:open={breathingOpen} />
<FocusTimer bind:open={timerOpen} />
<BrainDump bind:open={brainDumpOpen} />
<GroundingExercise bind:open={groundingOpen} />
<BodyDoubling bind:open={bodyDoublingOpen} />
<EmotionWheel bind:open={emotionWheelOpen} />
<ThoughtReframe bind:open={thoughtReframeOpen} />
<HabitTracker bind:open={habitTrackerOpen} />
<WindDown bind:open={windDownOpen} />
<PersonalInventory bind:open={inventoryOpen} />

<style>
	.toolbox-page {
		padding: 16px;
		max-width: 480px;
		margin: 0 auto;
	}

	.toolbox-header { margin-bottom: 20px; }

	.title {
		font-family: var(--font-serif);
		font-size: 1.6rem;
		color: #5C4D3C;
		margin: 0;
	}

	.icon { margin-right: 4px; }

	.tools-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}

	.tool-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 20px 12px;
		background: rgba(255, 255, 255, 0.45);
		border: 1px solid rgba(92, 77, 60, 0.08);
		border-radius: 16px 12px 18px 14px;
		cursor: pointer;
		transition: transform 0.15s ease, box-shadow 0.2s ease;
		box-shadow: 0 4px 12px var(--shadow-color, rgba(92, 77, 60, 0.08));
		-webkit-tap-highlight-color: transparent;
	}

	.tool-card:active {
		transform: scale(0.97);
	}

	.tool-card:hover {
		box-shadow: 0 6px 20px var(--shadow-color, rgba(92, 77, 60, 0.12));
	}

	.tool-card.locked {
		opacity: 0.45;
		cursor: default;
		filter: grayscale(0.4);
	}

	.tool-card.locked:active { transform: none; }

	.tool-icon {
		font-size: 2rem;
		margin-bottom: 8px;
	}

	.tool-name {
		font-family: var(--font-sans);
		font-size: 0.95rem;
		font-weight: 700;
		color: #5C4D3C;
		margin: 0 0 4px;
	}

	.tool-desc {
		font-family: var(--font-sans);
		font-size: 0.78rem;
		color: rgba(92, 77, 60, 0.55);
		margin: 0;
		line-height: 1.4;
	}
</style>
