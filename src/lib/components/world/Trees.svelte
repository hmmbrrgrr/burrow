<!-- Trees.svelte — Scattered trees with swaying canopies -->
<script lang="ts">
	interface Props {
		layer?: 'back' | 'front';
	}

	let { layer = 'back' }: Props = $props();
</script>

{#if layer === 'back'}
	<!-- Back trees — larger, behind buildings -->
	<g class="tree tree-1" transform="translate(120, 350)">
		<rect x="-4" y="0" width="8" height="28" rx="2" fill="#8B6944" />
		<g class="canopy canopy-1">
			<ellipse cx="0" cy="-12" rx="22" ry="20" fill="#7DA06E" />
			<ellipse cx="-10" cy="-18" rx="16" ry="14" fill="#8BAF7C" />
			<ellipse cx="8" cy="-16" rx="14" ry="13" fill="#6E9060" />
		</g>
	</g>

	<g class="tree tree-2" transform="translate(640, 340) scale(0.85)">
		<rect x="-4" y="0" width="8" height="30" rx="2" fill="#8B6944" />
		<g class="canopy canopy-2">
			<ellipse cx="0" cy="-14" rx="24" ry="22" fill="#6E9060" />
			<ellipse cx="-8" cy="-20" rx="17" ry="15" fill="#8BAF7C" />
			<ellipse cx="10" cy="-17" rx="15" ry="14" fill="#7DA06E" />
		</g>
	</g>

	<g class="tree tree-3" transform="translate(720, 360) scale(0.7)">
		<rect x="-3" y="0" width="7" height="25" rx="2" fill="#8B6944" />
		<g class="canopy canopy-3">
			<ellipse cx="0" cy="-10" rx="18" ry="16" fill="#8BAF7C" />
			<ellipse cx="-6" cy="-14" rx="13" ry="11" fill="#98BF82" />
		</g>
	</g>
{:else}
	<!-- Front trees — smaller, in foreground -->
	<g class="tree tree-4" transform="translate(60, 450) scale(0.6)">
		<rect x="-3" y="0" width="7" height="22" rx="2" fill="#8B6944" />
		<g class="canopy canopy-4">
			<ellipse cx="0" cy="-10" rx="16" ry="14" fill="#98BF82" />
			<ellipse cx="6" cy="-13" rx="12" ry="10" fill="#8BAF7C" />
		</g>
	</g>

	<g class="tree tree-5" transform="translate(700, 440) scale(0.65)">
		<rect x="-3" y="0" width="7" height="24" rx="2" fill="#8B6944" />
		<g class="canopy canopy-5">
			<ellipse cx="0" cy="-11" rx="17" ry="15" fill="#8BAF7C" />
			<ellipse cx="-7" cy="-15" rx="12" ry="11" fill="#98BF82" />
			<ellipse cx="5" cy="-14" rx="11" ry="10" fill="#7DA06E" />
		</g>
	</g>
{/if}

<style>
	.canopy-1 {
		transform-origin: 0px 0px;
		animation: sway-tree 10s ease-in-out infinite;
	}
	.canopy-2 {
		transform-origin: 0px 0px;
		animation: sway-tree 12s ease-in-out infinite;
		animation-delay: -3s;
	}
	.canopy-3 {
		transform-origin: 0px 0px;
		animation: sway-tree 9s ease-in-out infinite;
		animation-delay: -6s;
	}
	.canopy-4 {
		transform-origin: 0px 0px;
		animation: sway-tree 11s ease-in-out infinite;
		animation-delay: -2s;
	}
	.canopy-5 {
		transform-origin: 0px 0px;
		animation: sway-tree 8s ease-in-out infinite;
		animation-delay: -5s;
	}

	@keyframes sway-tree {
		0%, 100% { transform: rotate(-1.5deg); }
		50% { transform: rotate(1.5deg); }
	}

	/* ===== REDUCED MOTION ===== */
	/* Disable tree sway — purely ambient */
	@media (prefers-reduced-motion: reduce) {
		.canopy-1, .canopy-2, .canopy-3, .canopy-4, .canopy-5 {
			animation: none !important;
			transform: rotate(0deg);
		}
	}
</style>
