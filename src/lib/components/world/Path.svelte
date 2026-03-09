<!-- Path.svelte — Winding path from bottom of scene up to the cottage -->
<script lang="ts">
	// No props needed — the path is purely decorative
</script>

<g class="path">
	<!-- Main path — wider at bottom, narrower at top for perspective -->
	<path
		d="M420 600 Q410 570 395 540 Q375 510 385 480 Q400 450 380 420 Q355 395 345 380 Q335 370 310 370"
		stroke="#C4956A" stroke-width="28" fill="none" stroke-linecap="round"
		opacity="0.7"
	/>
	<!-- Lighter center line for depth -->
	<path
		d="M420 600 Q410 570 395 540 Q375 510 385 480 Q400 450 380 420 Q355 395 345 380 Q335 370 310 370"
		stroke="#D4BC8A" stroke-width="18" fill="none" stroke-linecap="round"
		opacity="0.5"
	/>

	<!-- Small stones along the path -->
	<ellipse cx="405" cy="560" rx="4" ry="3" fill="#B8A080" opacity="0.5" transform="rotate(-10)" />
	<ellipse cx="385" cy="510" rx="3.5" ry="2.5" fill="#B8A080" opacity="0.45" transform="rotate(15)" />
	<ellipse cx="392" cy="470" rx="3" ry="2.5" fill="#B8A080" opacity="0.5" transform="rotate(-5)" />
	<ellipse cx="375" cy="430" rx="3.5" ry="2" fill="#B8A080" opacity="0.45" transform="rotate(8)" />
	<ellipse cx="355" cy="395" rx="3" ry="2" fill="#B8A080" opacity="0.4" transform="rotate(-12)" />
</g>
