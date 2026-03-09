<!-- Garden.svelte — Small fenced garden next to the cottage -->
<script lang="ts">
	interface Props {
		stage?: 1 | 2 | 3;
	}

	let { stage = 2 }: Props = $props();
</script>

<g class="garden" transform="translate(330, 355)">
	<!-- Fence pickets — slightly wonky -->
	<rect x="0" y="5" width="3" height="20" rx="1" fill="#C4956A" transform="rotate(-2)" />
	<rect x="8" y="4" width="3" height="21" rx="1" fill="#C4956A" transform="rotate(1)" />
	<rect x="16" y="5" width="3" height="19" rx="1" fill="#C4956A" transform="rotate(-1)" />
	<rect x="24" y="4" width="3" height="20" rx="1" fill="#C4956A" transform="rotate(2)" />
	<rect x="32" y="5" width="3" height="20" rx="1" fill="#C4956A" transform="rotate(-1)" />
	<rect x="40" y="4" width="3" height="21" rx="1" fill="#C4956A" transform="rotate(1)" />
	<!-- Horizontal rails -->
	<rect x="-1" y="10" width="44" height="2.5" rx="1" fill="#B8875E" />
	<rect x="-1" y="19" width="44" height="2.5" rx="1" fill="#B8875E" />

	<!-- Garden bed (brown earth) -->
	<ellipse cx="21" cy="30" rx="18" ry="6" fill="#8B6944" opacity="0.6" />

	<!-- Plants based on stage -->
	{#if stage >= 1}
		<!-- Bare earth dots -->
		<circle cx="12" cy="28" r="1.5" fill="#6E5533" opacity="0.5" />
		<circle cx="21" cy="29" r="1.5" fill="#6E5533" opacity="0.5" />
		<circle cx="30" cy="28" r="1.5" fill="#6E5533" opacity="0.5" />
	{/if}
	{#if stage >= 2}
		<!-- Seedlings -->
		<line x1="12" y1="28" x2="12" y2="22" stroke="#8BAF7C" stroke-width="1.5" stroke-linecap="round" />
		<circle cx="12" cy="21" r="2" fill="#98BF82" />
		<line x1="21" y1="29" x2="21" y2="23" stroke="#8BAF7C" stroke-width="1.5" stroke-linecap="round" />
		<circle cx="21" cy="22" r="2" fill="#98BF82" />
		<line x1="30" y1="28" x2="30" y2="22" stroke="#8BAF7C" stroke-width="1.5" stroke-linecap="round" />
		<circle cx="30" cy="21" r="2" fill="#98BF82" />
	{/if}
	{#if stage >= 3}
		<!-- Full bloom flowers -->
		<circle cx="12" cy="19" r="3.5" fill="#E88A8A" />
		<circle cx="12" cy="19" r="1.5" fill="#F2C94C" />
		<circle cx="21" cy="20" r="3.5" fill="#B5A0D1" />
		<circle cx="21" cy="20" r="1.5" fill="#F2C94C" />
		<circle cx="30" cy="19" r="3.5" fill="#FFB088" />
		<circle cx="30" cy="19" r="1.5" fill="#F2C94C" />
	{/if}
</g>
