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
		<!-- Grass tufts along front hill top edge -->
		<g class="grass-tuft tuft-1">
			<path d="M50 468 Q48 455 44 445" stroke="#6B8F5E" stroke-width="1.3" fill="none" stroke-linecap="round" />
			<path d="M53 468 Q55 452 54 442" stroke="#7BA36E" stroke-width="1.1" fill="none" stroke-linecap="round" />
			<path d="M56 467 Q60 456 62 448" stroke="#8BAF7C" stroke-width="1" fill="none" stroke-linecap="round" />
		</g>
		<g class="grass-tuft tuft-2">
			<path d="M130 456 Q126 443 123 435" stroke="#7BA36E" stroke-width="1.2" fill="none" stroke-linecap="round" />
			<path d="M133 455 Q134 440 136 432" stroke="#6B8F5E" stroke-width="1" fill="none" stroke-linecap="round" />
		</g>
		<g class="grass-tuft tuft-3">
			<path d="M210 462 Q206 448 203 438" stroke="#8BAF7C" stroke-width="1.1" fill="none" stroke-linecap="round" />
			<path d="M213 461 Q215 447 214 437" stroke="#6B8F5E" stroke-width="1.3" fill="none" stroke-linecap="round" />
			<path d="M217 462 Q221 450 224 442" stroke="#7BA36E" stroke-width="1" fill="none" stroke-linecap="round" />
		</g>
		<g class="grass-tuft tuft-4">
			<path d="M300 468 Q296 454 293 444" stroke="#6B8F5E" stroke-width="1" fill="none" stroke-linecap="round" />
			<path d="M303 467 Q305 452 307 443" stroke="#8BAF7C" stroke-width="1.2" fill="none" stroke-linecap="round" />
		</g>
		<g class="grass-tuft tuft-5">
			<path d="M380 456 Q377 442 373 432" stroke="#7BA36E" stroke-width="1.3" fill="none" stroke-linecap="round" />
			<path d="M383 455 Q384 440 386 430" stroke="#6B8F5E" stroke-width="1" fill="none" stroke-linecap="round" />
			<path d="M387 456 Q391 444 394 436" stroke="#8BAF7C" stroke-width="1.1" fill="none" stroke-linecap="round" />
		</g>
		<g class="grass-tuft tuft-6">
			<path d="M460 448 Q456 434 453 424" stroke="#8BAF7C" stroke-width="1.2" fill="none" stroke-linecap="round" />
			<path d="M463 447 Q465 432 464 422" stroke="#7BA36E" stroke-width="1" fill="none" stroke-linecap="round" />
		</g>
		<g class="grass-tuft tuft-7">
			<path d="M540 452 Q536 438 533 428" stroke="#6B8F5E" stroke-width="1.1" fill="none" stroke-linecap="round" />
			<path d="M543 451 Q545 436 544 426" stroke="#8BAF7C" stroke-width="1.3" fill="none" stroke-linecap="round" />
			<path d="M547 452 Q551 440 554 432" stroke="#7BA36E" stroke-width="1" fill="none" stroke-linecap="round" />
		</g>
		<g class="grass-tuft tuft-8">
			<path d="M620 458 Q617 444 614 434" stroke="#7BA36E" stroke-width="1" fill="none" stroke-linecap="round" />
			<path d="M623 457 Q625 442 627 433" stroke="#6B8F5E" stroke-width="1.2" fill="none" stroke-linecap="round" />
		</g>
		<g class="grass-tuft tuft-9">
			<path d="M700 466 Q696 452 693 442" stroke="#8BAF7C" stroke-width="1.3" fill="none" stroke-linecap="round" />
			<path d="M703 465 Q705 450 704 440" stroke="#7BA36E" stroke-width="1" fill="none" stroke-linecap="round" />
			<path d="M707 466 Q711 454 714 446" stroke="#6B8F5E" stroke-width="1.1" fill="none" stroke-linecap="round" />
		</g>
		<g class="grass-tuft tuft-10">
			<path d="M775 462 Q772 448 769 438" stroke="#6B8F5E" stroke-width="1" fill="none" stroke-linecap="round" />
			<path d="M778 461 Q780 446 782 437" stroke="#8BAF7C" stroke-width="1.2" fill="none" stroke-linecap="round" />
		</g>
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

	.grass-tuft {
		animation: grass-sway 3.5s ease-in-out infinite;
		transform-origin: bottom center;
	}

	.tuft-1 { animation-delay: 0s; }
	.tuft-2 { animation-delay: -0.4s; }
	.tuft-3 { animation-delay: -1.1s; }
	.tuft-4 { animation-delay: -0.7s; }
	.tuft-5 { animation-delay: -1.8s; }
	.tuft-6 { animation-delay: -0.3s; }
	.tuft-7 { animation-delay: -2.2s; }
	.tuft-8 { animation-delay: -1.5s; }
	.tuft-9 { animation-delay: -0.9s; }
	.tuft-10 { animation-delay: -2.6s; }

	@keyframes grass-sway {
		0%, 100% { transform: rotate(-3deg); }
		50% { transform: rotate(3deg); }
	}
</style>
