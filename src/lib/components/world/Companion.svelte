<!-- Companion.svelte — Ember the red panda companion with 7 animation states -->
<script lang="ts">
	import type { EmberState } from '$lib/types/ember';

	interface Props {
		mood?: EmberState;
		message?: string;
		messageDuration?: number;
	}

	let { mood = 'idle', message = '', messageDuration = 6000 }: Props = $props();

	const moodDescriptions: Record<EmberState, string> = {
		idle: 'Ember is relaxing',
		happy: 'Ember is happy',
		sleeping: 'Ember is sleeping',
		waving: 'Ember is waving hello',
		celebrating: 'Ember is celebrating',
		thinking: 'Ember is thinking',
		sad: 'Ember is feeling sad',
	};

	let showMessage = $state(false);
	let currentMessage = $state('');
	$effect(() => {
		if (message) {
			currentMessage = message;
			showMessage = true;
			const timer = setTimeout(() => {
				showMessage = false;
			}, messageDuration);
			return () => clearTimeout(timer);
		} else {
			showMessage = false;
		}
	});


</script>

<!-- Speech bubble (HTML overlay positioned via foreignObject) -->
{#if showMessage}
	<g class="speech-bubble-group" transform="translate(310, 360)">
		<foreignObject width="120" height="80" x="-10" y="-10">
			<div class="speech-bubble" class:visible={showMessage}>
				<p>{currentMessage}</p>
				<div class="speech-pointer"></div>
			</div>
		</foreignObject>
	</g>
{/if}

<g
	class="ember"
	class:idle={mood === 'idle'}
	class:happy={mood === 'happy'}
	class:sleeping={mood === 'sleeping'}
	class:waving={mood === 'waving'}
	class:celebrating={mood === 'celebrating'}
	class:thinking={mood === 'thinking'}
	class:sad={mood === 'sad'}
	transform="translate(360, 440)"
	role="img"
	aria-label="Ember the fox companion, currently {mood}"
>
	<!-- Body shadow -->
	<ellipse class="body-shadow" cx="0" cy="15" rx="22" ry="5" fill="rgba(10, 6, 2, 0.45)" />

	<!-- Tail — bushy with alternating rings -->
	<g class="tail">
		<ellipse cx="30" cy="10" rx="16" ry="7" fill="#E8945A" transform="rotate(25, 30, 10)" />
		<ellipse cx="38" cy="6" rx="12" ry="5.5" fill="#5C4D3C" transform="rotate(20, 38, 6)" />
		<ellipse cx="45" cy="3" rx="10" ry="5" fill="#E8945A" transform="rotate(15, 45, 3)" />
		<ellipse cx="51" cy="1" rx="7" ry="4" fill="#5C4D3C" transform="rotate(10, 51, 1)" />
		<!-- Tail tip -->
		<ellipse cx="56" cy="0" rx="5" ry="3" fill="#E8945A" transform="rotate(5, 56, 0)" />
	</g>

	<!-- Back paws -->
	<g class="paws-back">
		<ellipse cx="-8" cy="12" rx="5" ry="3" fill="#5C4D3C" />
		<ellipse cx="8" cy="12" rx="5" ry="3" fill="#5C4D3C" />
	</g>

	<!-- Body — oval torso with cream belly -->
	<g class="body">
		<ellipse cx="0" cy="0" rx="16" ry="13" fill="#E8945A" />
		<ellipse cx="0" cy="2" rx="10" ry="8" fill="#F5EBD8" />
	</g>

	<!-- Front paws -->
	<g class="paws-front">
		<g class="paw-left">
			<ellipse cx="-10" cy="10" rx="4.5" ry="3.5" fill="#5C4D3C" />
		</g>
		<g class="paw-right">
			<ellipse cx="10" cy="10" rx="4.5" ry="3.5" fill="#5C4D3C" />
		</g>
	</g>

	<!-- Head group -->
	<g class="head" transform="translate(0, -20)">
		<!-- Head shape -->
		<circle cx="0" cy="0" r="14" fill="#E8945A" />

		<!-- Face cream markings -->
		<ellipse cx="0" cy="2" rx="10" ry="7.5" fill="#F5EBD8" />

		<!-- Cheek patches -->
		<circle cx="-8" cy="3" r="3" fill="#F5EBD8" opacity="0.7" />
		<circle cx="8" cy="3" r="3" fill="#F5EBD8" opacity="0.7" />

		<!-- Dark eye patches (like a real red panda) -->
		<ellipse cx="-5" cy="-1" rx="4.5" ry="4" fill="#5C4D3C" opacity="0.35" />
		<ellipse cx="5" cy="-1" rx="4.5" ry="4" fill="#5C4D3C" opacity="0.35" />

		<!-- Ears -->
		<g class="ears">
			<g class="ear-left">
				<polygon points="-10,-10 -15,-20 -5,-13" fill="#E8945A" />
				<polygon points="-9.5,-11 -13,-18 -6,-13" fill="#F5EBD8" />
			</g>
			<g class="ear-right">
				<polygon points="10,-10 15,-20 5,-13" fill="#E8945A" />
				<polygon points="9.5,-11 13,-18 6,-13" fill="#F5EBD8" />
			</g>
		</g>

		<!-- Eyes -->
		<g class="eyes">
			<g class="eye-left">
				<ellipse cx="-5" cy="-1" rx="2.8" ry="3.2" fill="#5C4D3C" />
				<circle cx="-4.3" cy="-2" r="1" fill="#FFFFFF" />
			</g>
			<g class="eye-right">
				<ellipse cx="5" cy="-1" rx="2.8" ry="3.2" fill="#5C4D3C" />
				<circle cx="5.7" cy="-2" r="1" fill="#FFFFFF" />
			</g>
		</g>

		<!-- Sleeping eyes (hidden by default) -->
		<g class="sleeping-eyes">
			<path d="M -7,-1 Q -5,1 -3,-1" fill="none" stroke="#5C4D3C" stroke-width="1.2" stroke-linecap="round" />
			<path d="M 3,-1 Q 5,1 7,-1" fill="none" stroke="#5C4D3C" stroke-width="1.2" stroke-linecap="round" />
		</g>

		<!-- Nose -->
		<g class="nose">
			<path d="M-1.5,4 L0,2.5 L1.5,4 Z" fill="#5C4D3C" />
		</g>

		<!-- Mouth -->
		<g class="mouth">
			<path d="M-3,5.5 Q0,7.5 3,5.5" fill="none" stroke="#5C4D3C" stroke-width="0.8" stroke-linecap="round" />
		</g>

		<!-- Thinking bubble (hidden by default) -->
		<g class="thought-bubble">
			<circle cx="12" cy="-18" r="4" fill="white" opacity="0.85" />
			<circle cx="8" cy="-12" r="2" fill="white" opacity="0.7" />
			<circle cx="5" cy="-9" r="1.2" fill="white" opacity="0.5" />
		</g>
	</g>

	<!-- Zzz for sleeping (hidden by default) -->
	<g class="zzz">
		<text x="15" y="-35" fill="#5C4D3C" font-size="8" font-family="var(--font-sans)" opacity="0.7" class="z1">z</text>
		<text x="22" y="-42" fill="#5C4D3C" font-size="10" font-family="var(--font-sans)" opacity="0.5" class="z2">z</text>
		<text x="28" y="-50" fill="#5C4D3C" font-size="12" font-family="var(--font-sans)" opacity="0.3" class="z3">Z</text>
	</g>

	<!-- Celebration hearts (hidden by default) -->
	<g class="hearts">
		<text x="-20" y="-35" font-size="8" class="heart h1">&#x2764;</text>
		<text x="15" y="-40" font-size="6" class="heart h2">&#x2764;</text>
		<text x="-10" y="-45" font-size="7" class="heart h3">&#x2764;</text>
		<text x="5" y="-38" font-size="5" class="heart h4">&#x2764;</text>
		<text x="20" y="-30" font-size="6" class="heart h5">&#x2764;</text>
	</g>

	<!-- Accessory slot -->
	<g class="accessory"></g>
</g>

<!-- Screen-reader-only mood description -->
<foreignObject x="0" y="0" width="1" height="1" aria-hidden="false">
	<span class="sr-only">{moodDescriptions[mood] ?? `Ember is ${mood}`}{#if showMessage}, saying: {currentMessage}{/if}</span>
</foreignObject>

<style>
	/* ===== BASE TRANSITIONS ===== */
	.ember {
		transition: transform 0.3s ease;
		will-change: transform;
	}
	.ember .body,
	.ember .head,
	.ember .tail,
	.ember .paws-front,
	.ember .paw-left,
	.ember .paw-right {
		transition: transform 0.3s ease, opacity 0.3s ease;
		will-change: transform;
	}
	.ember .ears,
	.ember .eyes,
	.ember .mouth,
	.ember .ear-left,
	.ember .ear-right,
	.ember .eye-left,
	.ember .eye-right {
		transition: transform 0.3s ease, opacity 0.3s ease;
	}

	/* Hidden by default */
	.sleeping-eyes,
	.zzz,
	.thought-bubble,
	.hearts {
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	/* ===== IDLE STATE ===== */
	.idle .body {
		animation: idle-breathe 3s ease-in-out infinite;
		transform-origin: 0px 0px;
	}
	.idle .tail {
		animation: idle-tail 3s linear infinite;
		transform-origin: 15px 10px;
	}
	.idle .ear-left,
	.idle .ear-right {
		animation: idle-ear-twitch 5s ease-in-out infinite;
		transform-origin: center;
	}
	.idle .ear-right {
		animation-delay: 0.3s;
	}

	@keyframes idle-breathe {
		0%, 100% { transform: scaleY(1); }
		50% { transform: scaleY(0.97); }
	}
	@keyframes idle-tail {
		0% { transform: rotate(-8deg); animation-timing-function: cubic-bezier(0.37, 0, 0.63, 1); }
		25% { transform: rotate(0deg); animation-timing-function: cubic-bezier(0.37, 0, 0.63, 1); }
		50% { transform: rotate(8deg); animation-timing-function: cubic-bezier(0.37, 0, 0.63, 1); }
		75% { transform: rotate(0deg); animation-timing-function: cubic-bezier(0.37, 0, 0.63, 1); }
		100% { transform: rotate(-8deg); }
	}
	@keyframes idle-ear-twitch {
		0%, 85%, 100% { transform: rotate(0deg); }
		90% { transform: rotate(5deg); }
		95% { transform: rotate(-3deg); }
	}

	/* ===== HAPPY STATE ===== */
	.happy .body {
		animation: happy-hop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
		transform-origin: 0px 0px;
	}
	.happy .tail {
		animation: happy-wag 0.4s ease-in-out infinite;
		transform-origin: 15px 10px;
	}
	.happy .eye-left,
	.happy .eye-right {
		transform: scaleY(0.3) translateY(2px);
		transform-origin: center;
	}
	.happy .ear-left {
		transform: rotate(-10deg);
		transform-origin: -10px -10px;
	}
	.happy .ear-right {
		transform: rotate(10deg);
		transform-origin: 10px -10px;
	}
	.happy .mouth {
		transform: scaleX(1.3) scaleY(1.2);
		transform-origin: 0px 6px;
	}

	@keyframes happy-hop {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-8px); }
	}
	@keyframes happy-wag {
		0%, 100% { transform: rotate(-15deg); }
		50% { transform: rotate(15deg); }
	}

	/* ===== SLEEPING STATE ===== */
	.sleeping .body {
		animation: sleep-breathe 5s ease-in-out infinite;
		transform-origin: 0px 0px;
	}
	.sleeping .tail {
		transform: translate(-20px, -5px) rotate(-30deg);
		transform-origin: 15px 10px;
	}
	.sleeping .eyes {
		opacity: 0;
	}
	.sleeping .sleeping-eyes {
		opacity: 1;
	}
	.sleeping .zzz {
		opacity: 1;
	}
	.sleeping .ear-left {
		transform: rotate(8deg);
		transform-origin: -10px -10px;
	}
	.sleeping .ear-right {
		transform: rotate(-8deg);
		transform-origin: 10px -10px;
	}
	.sleeping .z1 {
		animation: zzz-float 3s ease-in-out infinite;
	}
	.sleeping .z2 {
		animation: zzz-float 3s ease-in-out infinite 0.5s;
	}
	.sleeping .z3 {
		animation: zzz-float 3s ease-in-out infinite 1s;
	}

	@keyframes sleep-breathe {
		0%, 100% { transform: scaleY(1); }
		50% { transform: scaleY(0.97); }
	}
	@keyframes zzz-float {
		0% { transform: translateY(0); opacity: 0.8; }
		100% { transform: translateY(-15px); opacity: 0; }
	}

	/* ===== WAVING STATE ===== */
	.waving .paw-right {
		animation: wave-paw 0.5s ease-in-out 3;
		transform-origin: 10px 10px;
	}
	.waving .body {
		transform: rotate(-3deg);
		transform-origin: 0px 0px;
		animation: idle-breathe 3s ease-in-out infinite;
	}
	.waving .tail {
		animation: idle-tail 4s ease-in-out infinite;
		transform-origin: 15px 10px;
	}

	@keyframes wave-paw {
		0%, 100% { transform: translate(0px, -8px) rotate(-20deg); }
		50% { transform: translate(2px, -8px) rotate(20deg); }
	}

	/* ===== CELEBRATING STATE ===== */
	.celebrating .body {
		animation: celebrate-jump 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
		transform-origin: 0px 0px;
	}
	.celebrating .tail {
		animation: happy-wag 0.3s ease-in-out infinite;
		transform-origin: 15px 10px;
	}
	.celebrating .eye-left,
	.celebrating .eye-right {
		transform: scaleY(0.3) translateY(2px);
		transform-origin: center;
	}
	.celebrating .paw-left {
		transform: translate(-2px, -12px) rotate(-15deg);
		transform-origin: center;
	}
	.celebrating .paw-right {
		transform: translate(2px, -12px) rotate(15deg);
		transform-origin: center;
	}
	.celebrating .hearts {
		opacity: 1;
	}
	.celebrating .heart {
		fill: #E8945A;
	}
	.celebrating .h1 { animation: heart-float 1.5s ease-out infinite; }
	.celebrating .h2 { animation: heart-float 1.5s ease-out infinite 0.2s; }
	.celebrating .h3 { animation: heart-float 1.5s ease-out infinite 0.4s; }
	.celebrating .h4 { animation: heart-float 1.5s ease-out infinite 0.6s; }
	.celebrating .h5 { animation: heart-float 1.5s ease-out infinite 0.8s; }

	@keyframes celebrate-jump {
		0%, 100% { transform: translateY(0) rotate(0deg); }
		40% { transform: translateY(-20px) rotate(5deg); }
		60% { transform: translateY(-20px) rotate(-3deg); }
	}
	@keyframes heart-float {
		0% { transform: translateY(0); opacity: 1; }
		100% { transform: translateY(-25px); opacity: 0; }
	}

	/* ===== THINKING STATE ===== */
	.thinking .head {
		transform: translate(0px, -20px) rotate(-8deg);
		transform-origin: 0px 0px;
	}
	.thinking .paw-right {
		transform: translate(5px, -5px);
	}
	.thinking .eye-left,
	.thinking .eye-right {
		transform: translateY(-2px);
	}
	.thinking .tail {
		animation: idle-tail 5s ease-in-out infinite;
		transform-origin: 15px 10px;
	}
	.thinking .thought-bubble {
		opacity: 1;
	}
	.thinking .body {
		animation: idle-breathe 3s ease-in-out infinite;
		transform-origin: 0px 0px;
	}

	/* ===== SAD STATE ===== */
	.sad .ear-left {
		transform: rotate(15deg);
		transform-origin: -10px -10px;
	}
	.sad .ear-right {
		transform: rotate(-15deg);
		transform-origin: 10px -10px;
	}
	.sad .tail {
		transform: translate(5px, 15px) rotate(40deg);
		transform-origin: 15px 10px;
	}
	.sad .eye-left,
	.sad .eye-right {
		transform: scaleY(0.5);
		transform-origin: center;
	}
	.sad .body {
		transform: scaleY(0.95);
		transform-origin: 0px 0px;
	}
	.sad .head {
		transform: translate(0px, -18px) rotate(3deg);
		transform-origin: 0px 0px;
	}
	.sad .mouth {
		transform: scaleY(-0.8);
		transform-origin: 0px 6px;
	}

	/* ===== SPEECH BUBBLE ===== */
	.speech-bubble {
		background: #F5EBD8;
		color: #5C4D3C;
		font-family: var(--font-sans);
		font-size: 11px;
		line-height: 1.3;
		padding: 6px 8px;
		border-radius: 8px;
		position: relative;
		max-width: 100px;
		animation: bubble-enter 0.3s ease-out;
	}
	.speech-bubble p {
		margin: 0;
	}
	.speech-pointer {
		width: 0;
		height: 0;
		border-left: 5px solid transparent;
		border-right: 5px solid transparent;
		border-top: 6px solid #F5EBD8;
		position: absolute;
		bottom: -6px;
		left: 50%;
		transform: translateX(-50%);
	}

	@keyframes bubble-enter {
		0% { opacity: 0; transform: translateY(5px); }
		100% { opacity: 1; transform: translateY(0); }
	}

	/* ===== EYE BLINK (CSS animation) ===== */
	.idle .eye-left {
		animation: blink 4s ease-in-out infinite;
		transform-origin: center;
	}
	.idle .eye-right {
		animation: blink 4s ease-in-out infinite;
		animation-delay: 0.05s;
		transform-origin: center;
	}

	@keyframes blink {
		0%, 45%, 55%, 100% { transform: scaleY(1); }
		48% { transform: scaleY(0.1); }
		52% { transform: scaleY(1); }
	}

	/* ===== SCREEN READER ONLY ===== */
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}

	/* ===== BODY SHADOW ===== */
	.body-shadow {
		filter: blur(3px);
		opacity: 0.35;
	}

	/* ===== REDUCED MOTION ===== */
	/* Disable ambient animations but keep mood state transitions (transforms, opacity) */
	@media (prefers-reduced-motion: reduce) {
		/* Kill ambient breathing, tail wag, ear twitch */
		.idle .body,
		.idle .tail,
		.idle .ear-left,
		.idle .ear-right,
		.idle .eye-left,
		.idle .eye-right,
		.sleeping .body,
		.sleeping .z1,
		.sleeping .z2,
		.sleeping .z3,
		.waving .paw-right,
		.waving .body,
		.waving .tail,
		.happy .body,
		.happy .tail,
		.celebrating .body,
		.celebrating .tail,
		.celebrating .h1,
		.celebrating .h2,
		.celebrating .h3,
		.celebrating .h4,
		.celebrating .h5,
		.thinking .tail,
		.thinking .body {
			animation: none !important;
		}
		/* Keep mood state transitions working (transform changes between states) */
		.ember,
		.ember .body,
		.ember .head,
		.ember .tail,
		.ember .ears,
		.ember .eyes,
		.ember .mouth,
		.ember .paws-front,
		.ember .paw-left,
		.ember .paw-right,
		.ember .ear-left,
		.ember .ear-right,
		.ember .eye-left,
		.ember .eye-right {
			transition-duration: 0.3s !important;
		}
		.sleeping-eyes,
		.zzz,
		.thought-bubble,
		.hearts {
			transition-duration: 0.3s !important;
		}
	}
</style>
