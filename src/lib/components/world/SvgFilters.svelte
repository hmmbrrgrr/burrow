<!-- SvgFilters.svelte — Shared SVG filter definitions for the illustrated world style -->
<script lang="ts">
	// These filters are referenced by other components via filter="url(#filter-name)"
</script>

<defs>
	<!-- Hand-drawn wobble effect -->
	<filter id="hand-drawn">
		<feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="3" result="turbulence" />
		<feDisplacementMap in="SourceGraphic" in2="turbulence" scale="3" />
	</filter>

	<!-- Watercolor paint effect -->
	<filter id="watercolor">
		<feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
		<feDisplacementMap in="SourceGraphic" in2="noise" scale="6" result="displaced" />
		<feGaussianBlur in="displaced" stdDeviation="0.8" result="blurred" />
		<feColorMatrix in="blurred" type="saturate" values="1.2" />
	</filter>

	<!-- Paper texture overlay -->
	<filter id="paper-texture">
		<feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="5" stitchTiles="stitch" result="noise" />
		<feColorMatrix in="noise" type="saturate" values="0" result="mono" />
		<feBlend in="SourceGraphic" in2="mono" mode="multiply" />
	</filter>
</defs>
