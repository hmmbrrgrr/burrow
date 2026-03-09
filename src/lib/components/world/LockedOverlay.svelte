<!-- LockedOverlay.svelte — SVG overlay for locked world elements -->
<script lang="ts">
	interface Props {
		x?: number;
		y?: number;
		width?: number;
		height?: number;
		daysUntil: number;
		label?: string;
	}

	let { x = 0, y = 0, width = 60, height = 50, daysUntil, label = '' }: Props = $props();

	let hovered = $state(false);
</script>

<g
	class="locked-overlay"
	transform="translate({x}, {y})"
	role="img"
	aria-label="{label} - locked"
	onpointerenter={() => hovered = true}
	onpointerleave={() => hovered = false}
>
	<!-- Semi-transparent desaturating overlay -->
	<rect
		x={-4}
		y={-4}
		{width}
		{height}
		rx="6"
		fill="rgba(92, 77, 60, 0.25)"
		class="overlay-rect"
	/>

	<!-- Lock icon -->
	<g transform="translate({width / 2 - 8}, {height / 2 - 12})">
		<!-- Lock body -->
		<rect x="2" y="8" width="12" height="10" rx="2" fill="#5C4D3C" opacity="0.6" />
		<!-- Lock shackle -->
		<path d="M4,8 V5 Q4,0 8,0 Q12,0 12,5 V8" fill="none" stroke="#5C4D3C" stroke-width="2" stroke-linecap="round" opacity="0.6" />
		<!-- Keyhole -->
		<circle cx="8" cy="13" r="1.5" fill="#F5EBD8" opacity="0.7" />
	</g>

	<!-- Tooltip on hover -->
	{#if hovered}
		<g transform="translate({width / 2}, {-16})" class="tooltip-group">
			<rect
				x="-50"
				y="-12"
				width="100"
				height="24"
				rx="6"
				fill="#5C4D3C"
				opacity="0.85"
			/>
			<text
				x="0"
				y="4"
				text-anchor="middle"
				fill="#F5EBD8"
				font-size="9"
				font-family="var(--font-sans)"
			>
				Opens in {daysUntil} day{daysUntil === 1 ? '' : 's'}
			</text>
		</g>
	{/if}
</g>

<style>
	.locked-overlay {
		cursor: default;
	}
	.tooltip-group {
		animation: tooltip-fade 0.2s ease-out;
	}
	@keyframes tooltip-fade {
		from { opacity: 0; transform: translate(var(--tx, 0), -10px); }
		to { opacity: 1; transform: translate(var(--tx, 0), 0); }
	}
</style>
