<!-- Hills.svelte — Layered SVG hills with organic curves and parallax sway -->
<script lang="ts">
	interface Props {
		layer?: 'back' | 'mid' | 'front';
	}

	let { layer = 'back' }: Props = $props();
</script>

{#if layer === 'back'}
	<g class="hill-back" filter="url(#watercolor)">
		<path
			d="M-20 420 Q80 340 180 360 Q280 380 350 350 Q420 320 500 340 Q580 360 680 345 Q750 335 820 370 L820 600 L-20 600 Z"
			fill="#6A8F5C"
		/>
	</g>
{:else if layer === 'mid'}
	<g class="hill-mid" filter="url(#watercolor)">
		<path
			d="M-20 440 Q60 380 160 410 Q230 430 320 395 Q400 365 480 390 Q560 415 650 400 Q730 388 820 420 L820 600 L-20 600 Z"
			fill="#8BAF7C"
		/>
	</g>
{:else}
	<g class="hill-front" filter="url(#watercolor)">
		<path
			d="M-20 480 Q80 440 200 460 Q300 475 400 455 Q500 435 600 458 Q700 478 820 460 L820 600 L-20 600 Z"
			fill="#98BF82"
		/>
	</g>
{/if}

<style>
	.hill-back {
		animation: sway-back 20s ease-in-out infinite;
	}
	.hill-mid {
		animation: sway-mid 17s ease-in-out infinite;
		animation-delay: -5s;
	}
	.hill-front {
		animation: sway-front 15s ease-in-out infinite;
		animation-delay: -10s;
	}

	@keyframes sway-back {
		0%, 100% { transform: translateX(0); }
		50% { transform: translateX(3px); }
	}
	@keyframes sway-mid {
		0%, 100% { transform: translateX(0); }
		50% { transform: translateX(-4px); }
	}
	@keyframes sway-front {
		0%, 100% { transform: translateX(0); }
		50% { transform: translateX(5px); }
	}
</style>
