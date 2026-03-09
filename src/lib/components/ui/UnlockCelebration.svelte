<!-- UnlockCelebration.svelte — Full-screen celebration when a new feature unlocks -->
<script lang="ts">
	import type { FeatureUnlock } from '$lib/services/unlocks';
	import { appState } from '$lib/stores/app.svelte';

	interface Props {
		feature: FeatureUnlock;
		onDismiss: () => void;
	}

	let { feature, onDismiss }: Props = $props();

	let visible = $state(false);
	let autoDismissTimer: ReturnType<typeof setTimeout>;

	$effect(() => {
		// Trigger entrance animation
		requestAnimationFrame(() => { visible = true; });
		// Set Ember to celebrating mood
		appState.emberState = 'celebrating';
		// Auto-dismiss after 5 seconds
		autoDismissTimer = setTimeout(dismiss, 5000);
		return () => {
			clearTimeout(autoDismissTimer);
			appState.emberState = 'idle';
		};
	});

	function dismiss() {
		visible = false;
		clearTimeout(autoDismissTimer);
		setTimeout(() => {
			appState.emberState = 'idle';
			onDismiss();
		}, 300);
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="celebration-overlay" class:visible onclick={dismiss}>
	<!-- Particle burst -->
	<div class="particles">
		{#each Array(12) as _, i}
			<div
				class="particle"
				style="--angle: {i * 30}deg; --delay: {i * 0.05}s; --dist: {60 + Math.random() * 40}px"
			></div>
		{/each}
	</div>

	<!-- Parchment card -->
	<div class="celebration-card" class:visible>
		<div class="card-icon">{feature.icon}</div>
		<h2 class="card-title">{feature.name}</h2>
		<p class="card-desc">{feature.description}</p>
		<div class="card-badge">New!</div>
		<button class="explore-btn" onclick={dismiss}>
			Explore
		</button>
	</div>
</div>

<style>
	.celebration-overlay {
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
	.celebration-overlay.visible {
		background: rgba(92, 77, 60, 0.4);
		pointer-events: auto;
	}

	.celebration-card {
		background: #F5EBD8;
		border: 2px solid #E8945A;
		border-radius: 20px 24px 18px 22px;
		padding: 2rem 2.5rem;
		text-align: center;
		max-width: 280px;
		position: relative;
		transform: scale(0.8);
		opacity: 0;
		transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
			opacity 0.3s ease;
		box-shadow: 0 8px 32px rgba(232, 148, 90, 0.3);
	}
	.celebration-card.visible {
		transform: scale(1);
		opacity: 1;
	}

	.card-icon {
		font-size: 3rem;
		margin-bottom: 0.5rem;
		animation: icon-bounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
	}
	@keyframes icon-bounce {
		from { transform: scale(0) rotate(-10deg); }
		to { transform: scale(1) rotate(0deg); }
	}

	.card-title {
		font-family: var(--font-serif);
		color: #5C4D3C;
		font-size: 1.4rem;
		margin: 0 0 0.25rem;
	}
	.card-desc {
		font-family: var(--font-sans);
		color: #5C4D3C;
		opacity: 0.7;
		font-size: 0.9rem;
		margin: 0 0 1rem;
	}

	.card-badge {
		position: absolute;
		top: -8px;
		right: -8px;
		background: #E8945A;
		color: white;
		font-family: var(--font-sans);
		font-size: 0.7rem;
		font-weight: 700;
		padding: 3px 10px;
		border-radius: 10px;
		transform: rotate(12deg);
	}

	.explore-btn {
		background: #E8945A;
		color: white;
		border: none;
		border-radius: 10px 12px 8px 14px;
		padding: 10px 28px;
		font-family: var(--font-sans);
		font-size: 0.95rem;
		font-weight: 700;
		cursor: pointer;
		transition: transform 0.2s ease;
	}
	.explore-btn:active {
		transform: scale(0.95);
	}

	/* Golden particles */
	.particles {
		position: absolute;
		top: 50%;
		left: 50%;
		pointer-events: none;
	}
	.particle {
		position: absolute;
		width: 8px;
		height: 8px;
		background: #F2C94C;
		border-radius: 50%;
		animation: particle-burst 0.8s cubic-bezier(0.22, 1, 0.36, 1) var(--delay) forwards;
		opacity: 0;
	}
	.celebration-overlay.visible .particle {
		opacity: 1;
	}
	@keyframes particle-burst {
		0% {
			transform: translate(0, 0) scale(1);
			opacity: 1;
		}
		70% {
			opacity: 0.8;
		}
		100% {
			transform: translate(
				calc(cos(var(--angle)) * var(--dist)),
				calc(sin(var(--angle)) * var(--dist))
			) scale(0);
			opacity: 0;
		}
	}
</style>
