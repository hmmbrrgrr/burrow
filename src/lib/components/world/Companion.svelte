<!-- Companion.svelte — Ember the red panda, simple charming SVG with breathing idle -->
<script lang="ts">
	// Placeholder red panda — will be replaced with proper Ember SVG later
</script>

<g class="ember" transform="translate(360, 440)">
	<!-- Tail — bushy, striped -->
	<g class="tail" transform="translate(14, -8)">
		<ellipse cx="16" cy="0" rx="14" ry="6" fill="#D47030" transform="rotate(30)" />
		<ellipse cx="22" cy="-4" rx="10" ry="4.5" fill="#5C4D3C" transform="rotate(25)" opacity="0.5" />
		<ellipse cx="28" cy="-6" rx="8" ry="4" fill="#D47030" transform="rotate(20)" />
		<ellipse cx="33" cy="-8" rx="6" ry="3.5" fill="#5C4D3C" transform="rotate(15)" opacity="0.5" />
	</g>

	<!-- Body -->
	<g class="body">
		<ellipse cx="0" cy="0" rx="14" ry="11" fill="#D47030" />
		<!-- Belly -->
		<ellipse cx="0" cy="2" rx="9" ry="7" fill="#E8A060" />
	</g>

	<!-- Head -->
	<g transform="translate(0, -18)">
		<!-- Head shape -->
		<circle cx="0" cy="0" r="11" fill="#D47030" />
		<!-- Face mask -->
		<ellipse cx="0" cy="2" rx="8" ry="6" fill="#F0C8A0" />
		<!-- Ears -->
		<polygon points="-9,-8 -12,-16 -5,-11" fill="#D47030" />
		<polygon points="9,-8 12,-16 5,-11" fill="#D47030" />
		<polygon points="-8,-9 -10,-14 -5.5,-10.5" fill="#E8A060" />
		<polygon points="8,-9 10,-14 5.5,-10.5" fill="#E8A060" />
		<!-- Eyes -->
		<ellipse cx="-4" cy="-1" rx="2.5" ry="2.8" fill="#5C4D3C" />
		<ellipse cx="4" cy="-1" rx="2.5" ry="2.8" fill="#5C4D3C" />
		<circle cx="-3.5" cy="-1.5" r="0.8" fill="white" />
		<circle cx="4.5" cy="-1.5" r="0.8" fill="white" />
		<!-- Nose -->
		<ellipse cx="0" cy="3" rx="2" ry="1.5" fill="#5C4D3C" />
		<!-- Eye markings (dark patches) -->
		<ellipse cx="-5" cy="-2" rx="4" ry="3.5" fill="#8B4020" opacity="0.3" />
		<ellipse cx="5" cy="-2" rx="4" ry="3.5" fill="#8B4020" opacity="0.3" />
	</g>

	<!-- Front paws -->
	<ellipse cx="-6" cy="10" rx="4" ry="3" fill="#5C4D3C" />
	<ellipse cx="6" cy="10" rx="4" ry="3" fill="#5C4D3C" />
</g>

<style>
	.ember {
		animation: breathe 3s ease-in-out infinite;
	}

	@keyframes breathe {
		0%, 100% { transform: translate(360px, 440px) scaleY(1); }
		50% { transform: translate(360px, 440px) scaleY(0.97); }
	}
</style>
