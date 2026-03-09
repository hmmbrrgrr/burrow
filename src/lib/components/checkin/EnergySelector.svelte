<!-- EnergySelector.svelte — 3-option energy picker: Low / Medium / High -->
<script lang="ts">
	type EnergyLevel = 'low' | 'medium' | 'high' | null;

	interface Props {
		value: EnergyLevel;
	}

	let { value = $bindable<EnergyLevel>(null) }: Props = $props();

	const options = [
		{ id: 'low' as const, emoji: '\u{1F331}', label: 'Low', sublabel: 'Taking it easy', color: '#98BF82', bg: 'rgba(152,191,130,0.15)' },
		{ id: 'medium' as const, emoji: '\u2600\uFE0F', label: 'Medium', sublabel: 'Steady', color: '#F2C94C', bg: 'rgba(242,201,76,0.15)' },
		{ id: 'high' as const, emoji: '\u26A1', label: 'High', sublabel: 'Buzzing', color: '#E8945A', bg: 'rgba(232,148,90,0.15)' },
	];

	function select(id: EnergyLevel) {
		value = id;
	}
</script>

<div class="energy-selector">
	<h3 class="heading">How's your energy?</h3>
	<div class="options">
		{#each options as opt}
			<button
				class="energy-card"
				class:selected={value === opt.id}
				style="--accent: {opt.color}; --accent-bg: {opt.bg};"
				onclick={() => select(opt.id)}
				aria-pressed={value === opt.id}
				aria-label="{opt.label} energy - {opt.sublabel}"
			>
				<span class="emoji">{opt.emoji}</span>
				<span class="label">{opt.label}</span>
				<span class="sublabel">{opt.sublabel}</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.energy-selector {
		text-align: center;
	}

	.heading {
		font-family: var(--font-serif);
		font-size: 1.25rem;
		color: var(--color-earth-brown);
		margin: 0 0 20px;
		font-weight: 600;
	}

	.options {
		display: flex;
		gap: 12px;
		justify-content: center;
		flex-wrap: wrap;
	}

	.energy-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		width: 100px;
		min-height: 44px;
		padding: 16px 8px;
		border: 2px solid transparent;
		border-radius: 12px 16px 10px 14px;
		background: var(--accent-bg);
		cursor: pointer;
		transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
			border-color 0.2s ease,
			box-shadow 0.2s ease;
		-webkit-tap-highlight-color: transparent;
		touch-action: manipulation;
		min-width: 44px;
	}

	.energy-card:active {
		transform: scale(0.96);
	}

	.energy-card.selected {
		border-color: var(--accent);
		transform: scale(1.06);
		box-shadow: 0 4px 16px color-mix(in srgb, var(--accent) 25%, transparent);
	}

	.emoji {
		font-size: 2rem;
		line-height: 1;
	}

	.label {
		font-family: var(--font-sans);
		font-weight: 700;
		font-size: 0.9rem;
		color: var(--color-earth-brown);
	}

	.sublabel {
		font-family: var(--font-sans);
		font-size: 0.875rem;
		color: #70614F;
	}

	@media (max-width: 359px) {
		.options {
			flex-direction: column;
			align-items: center;
		}

		.energy-card {
			width: 100%;
			max-width: 200px;
		}
	}
</style>
