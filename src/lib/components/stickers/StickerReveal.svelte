<!-- StickerReveal.svelte — Animated sticker unlock celebration with confetti -->
<script lang="ts">
	import type { Sticker } from '$lib/services/stickers';
	import { appState } from '$lib/stores/app.svelte';

	interface Props {
		sticker: Sticker;
		onCollect: () => void;
	}

	let { sticker, onCollect }: Props = $props();

	let visible = $state(false);

	const confettiColors = [
		'var(--color-warm-gold, #F2C94C)',
		'var(--color-ember-orange, #E8945A)',
		'var(--color-forest-green, #34D399)',
		'var(--color-lavender, #C4B5FD)',
		'var(--color-rose, #FDA4AF)',
	];

	// Generate 18 confetti particles
	const confettiParticles = Array.from({ length: 18 }, (_, i) => ({
		x: Math.random() * 100,
		delay: (Math.random() * 1.0).toFixed(2),
		duration: (1.5 + Math.random()).toFixed(2),
		color: confettiColors[i % confettiColors.length],
		size: 6 + Math.random() * 5,
	}));

	$effect(() => {
		// Trigger entrance animation on next frame
		requestAnimationFrame(() => { visible = true; });
		// Set Ember to celebrating mood
		appState.emberState = 'celebrating';

		return () => {
			appState.emberState = 'idle';
		};
	});

	function dismiss() {
		visible = false;
		setTimeout(() => {
			appState.emberState = 'idle';
			onCollect();
		}, 300);
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="reveal-overlay" class:visible onclick={dismiss}>
	<!-- Confetti particles -->
	{#each confettiParticles as particle}
		<span
			class="confetti-particle"
			style="
				left: {particle.x}%;
				width: {particle.size}px;
				height: {particle.size}px;
				background: {particle.color};
				animation-delay: {particle.delay}s;
				animation-duration: {particle.duration}s;
			"
		></span>
	{/each}

	<!-- Central content card -->
	<div class="reveal-card" class:visible>
		<!-- Golden glow -->
		<div class="sticker-glow"></div>

		<!-- Sticker emoji -->
		<div class="sticker-emoji">
			{sticker.emoji}
		</div>

		<!-- Sticker name -->
		<h2 class="sticker-name">{sticker.name}</h2>

		<!-- Description -->
		<p class="sticker-desc">{sticker.description}</p>

		<!-- Collect prompt -->
		<span class="collect-prompt">Tap to collect</span>
	</div>
</div>

<style>
	/* ── Overlay ── */
	.reveal-overlay {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(92, 77, 60, 0);
		transition: background 0.3s ease;
		pointer-events: none;
	}
	.reveal-overlay.visible {
		background: rgba(92, 77, 60, 0.55);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		pointer-events: auto;
	}

	/* ── Central card ── */
	.reveal-card {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 2.5rem 2rem 2rem;
		transform: scale(0.8);
		opacity: 0;
		transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
			opacity 0.3s ease;
	}
	.reveal-card.visible {
		transform: scale(1);
		opacity: 1;
	}

	/* ── Confetti ── */
	.confetti-particle {
		position: fixed;
		top: -20px;
		border-radius: 50%;
		z-index: 101;
		pointer-events: none;
		opacity: 0;
		animation-name: confetti-fall;
		animation-timing-function: ease-in;
		animation-fill-mode: forwards;
	}
	.reveal-overlay.visible .confetti-particle {
		opacity: 1;
	}

	@keyframes confetti-fall {
		0% {
			transform: translateY(-20px) translateX(0) rotate(0deg);
			opacity: 1;
		}
		25% {
			transform: translateY(27vh) translateX(12px) rotate(90deg);
			opacity: 1;
		}
		50% {
			transform: translateY(55vh) translateX(-8px) rotate(180deg);
			opacity: 0.8;
		}
		75% {
			transform: translateY(82vh) translateX(10px) rotate(270deg);
			opacity: 0.5;
		}
		100% {
			transform: translateY(100vh) translateX(-4px) rotate(360deg);
			opacity: 0;
		}
	}

	/* ── Golden glow behind sticker ── */
	.sticker-glow {
		position: absolute;
		top: 0;
		width: 180px;
		height: 180px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(242, 201, 76, 0.5) 0%, rgba(242, 201, 76, 0.15) 50%, transparent 70%);
		filter: blur(24px);
		animation: glow-pulse 2s ease-in-out infinite;
		pointer-events: none;
		z-index: -1;
	}

	@keyframes glow-pulse {
		0%, 100% {
			opacity: 0.6;
			transform: scale(1);
		}
		50% {
			opacity: 1;
			transform: scale(1.15);
		}
	}

	/* ── Sticker zoom-bounce ── */
	.sticker-emoji {
		font-size: 5rem;
		line-height: 1;
		animation: sticker-zoom 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both;
		filter: drop-shadow(0 4px 24px rgba(242, 201, 76, 0.4));
	}

	@keyframes sticker-zoom {
		0% {
			transform: scale(0.3);
			opacity: 0;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	/* ── Sticker name ── */
	.sticker-name {
		font-family: var(--font-serif, 'Fraunces', serif);
		color: #5C4D3C;
		font-size: 1.25rem;
		font-weight: 700;
		margin: 0;
		background: rgba(245, 235, 216, 0.85);
		padding: 0.25rem 1.25rem;
		border-radius: 20px 24px 18px 22px;
	}

	/* ── Description ── */
	.sticker-desc {
		font-family: var(--font-sans, system-ui, sans-serif);
		color: rgba(92, 77, 60, 0.7);
		font-size: 0.85rem;
		max-width: 240px;
		text-align: center;
		line-height: 1.5;
		margin: 0;
		background: rgba(245, 235, 216, 0.65);
		padding: 0.35rem 1rem;
		border-radius: 12px;
	}

	/* ── Collect prompt pulse ── */
	.collect-prompt {
		font-family: var(--font-sans, system-ui, sans-serif);
		font-size: 0.8rem;
		color: rgba(245, 235, 216, 0.6);
		margin-top: 1rem;
		animation: pulse-text 2s ease-in-out infinite;
	}

	@keyframes pulse-text {
		0%, 100% { opacity: 0.5; }
		50% { opacity: 1; }
	}
</style>
