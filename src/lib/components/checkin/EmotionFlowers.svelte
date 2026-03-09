<!-- EmotionFlowers.svelte — Multi-select emotion picker with blooming animation -->
<script lang="ts">
	interface Props {
		selected: string[];
	}

	let { selected = $bindable<string[]>([]) }: Props = $props();

	const emotions = [
		{ id: 'happy', emoji: '\u{1F60A}', label: 'Happy', color: '#F2C94C' },
		{ id: 'calm', emoji: '\u{1F60C}', label: 'Calm', color: '#B5A0D1' },
		{ id: 'frustrated', emoji: '\u{1F624}', label: 'Frustrated', color: '#E88A8A' },
		{ id: 'anxious', emoji: '\u{1F630}', label: 'Anxious', color: '#9EC5D6' },
		{ id: 'tired', emoji: '\u{1F634}', label: 'Tired', color: '#B5A0D1' },
		{ id: 'focused', emoji: '\u{1F3AF}', label: 'Focused', color: '#8BAF7C' },
		{ id: 'down', emoji: '\u{1F614}', label: 'Down', color: '#C4956A' },
		{ id: 'grateful', emoji: '\u{1F917}', label: 'Grateful', color: '#E8945A' },
	];

	function toggle(id: string) {
		if (selected.includes(id)) {
			selected = selected.filter(e => e !== id);
		} else if (selected.length < 3) {
			selected = [...selected, id];
		}
	}
</script>

<div class="emotion-flowers">
	<h3 class="heading">How are you feeling?</h3>
	<p class="hint">Pick up to 3</p>
	<div class="grid">
		{#each emotions as emo}
			<button
				class="flower-card"
				class:bloomed={selected.includes(emo.id)}
				style="--accent: {emo.color};"
				onclick={() => toggle(emo.id)}
			>
				<span class="emoji">{emo.emoji}</span>
				<span class="label">{emo.label}</span>
			</button>
		{/each}
	</div>
</div>

<style>
	.emotion-flowers {
		text-align: center;
	}

	.heading {
		font-family: var(--font-serif);
		font-size: 1.25rem;
		color: #5C4D3C;
		margin: 0 0 4px;
		font-weight: 600;
	}

	.hint {
		font-family: var(--font-sans);
		font-size: 0.75rem;
		color: rgba(92, 77, 60, 0.5);
		margin: 0 0 16px;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 10px;
	}

	.flower-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding: 12px 4px;
		border: 2px solid transparent;
		border-radius: 14px 10px 16px 12px;
		background: rgba(92, 77, 60, 0.05);
		cursor: pointer;
		transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
			border-color 0.2s ease,
			background 0.2s ease,
			box-shadow 0.2s ease;
		-webkit-tap-highlight-color: transparent;
	}

	.flower-card:active {
		transform: scale(0.93);
	}

	.flower-card.bloomed {
		border-color: var(--accent);
		background: color-mix(in srgb, var(--accent) 15%, transparent);
		transform: scale(1.08) rotate(-2deg);
		box-shadow: 0 3px 12px color-mix(in srgb, var(--accent) 20%, transparent);
	}

	.emoji {
		font-size: 1.5rem;
		line-height: 1;
		transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.bloomed .emoji {
		transform: scale(1.15);
	}

	.label {
		font-family: var(--font-sans);
		font-size: 0.7rem;
		font-weight: 600;
		color: #5C4D3C;
	}
</style>
