<!-- FAB.svelte — Floating action button with quick-action fan menu -->
<script lang="ts">
	interface Props {
		onvoice?: () => void;
		oncheckin?: () => void;
		onbreathe?: () => void;
	}

	let { onvoice, oncheckin, onbreathe }: Props = $props();

	let menuOpen = $state(false);

	function toggle() {
		menuOpen = !menuOpen;
	}

	function dismiss() {
		menuOpen = false;
	}

	function handleAction(fn?: () => void) {
		menuOpen = false;
		fn?.();
	}

	const actions = [
		{ icon: '🎤', label: 'Voice note', key: 'voice' as const },
		{ icon: '☀️', label: 'Check-in', key: 'checkin' as const },
		{ icon: '🌬️', label: 'Breathe', key: 'breathe' as const },
	];
</script>

{#if menuOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="fab-backdrop" onclick={dismiss}></div>
{/if}

<div class="fab-container">
	<!-- Mini action buttons -->
	{#each actions as action, i}
		<button
			class="fab-mini"
			class:visible={menuOpen}
			style="--offset: {(i + 1) * 56}px; --delay: {i * 0.04}s;"
			onclick={() => handleAction(
				action.key === 'voice' ? onvoice :
				action.key === 'checkin' ? oncheckin :
				onbreathe
			)}
			aria-label={action.label}
			title={action.label}
		>
			{action.icon}
		</button>
	{/each}

	<!-- Main FAB -->
	<button class="fab-main" class:open={menuOpen} onclick={toggle} aria-label="Quick actions">
		<span class="fab-icon">✦</span>
	</button>
</div>

<style>
	.fab-backdrop {
		position: fixed;
		inset: 0;
		z-index: 29;
	}

	.fab-container {
		position: fixed;
		bottom: calc(76px + env(safe-area-inset-bottom, 0px));
		right: 16px;
		z-index: 30;
		display: flex;
		flex-direction: column-reverse;
		align-items: center;
		gap: 0;
	}

	.fab-main {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		border: none;
		background: #E8945A;
		color: white;
		font-size: 1.4rem;
		cursor: pointer;
		box-shadow: 0 4px 16px rgba(232, 148, 90, 0.35);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), background 0.2s ease;
		-webkit-tap-highlight-color: transparent;
		z-index: 31;
	}

	.fab-main.open {
		transform: rotate(45deg);
		background: #5C4D3C;
	}

	.fab-icon {
		display: block;
		transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.fab-mini {
		position: absolute;
		bottom: 0;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		border: none;
		background: rgba(255, 255, 255, 0.9);
		font-size: 1.1rem;
		cursor: pointer;
		box-shadow: 0 2px 10px rgba(92, 77, 60, 0.15);
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transform: translateY(0) scale(0.5);
		transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
		transition-delay: var(--delay);
		pointer-events: none;
		-webkit-tap-highlight-color: transparent;
	}

	.fab-mini.visible {
		opacity: 1;
		transform: translateY(calc(-1 * var(--offset))) scale(1);
		pointer-events: auto;
	}

	.fab-mini:active {
		transform: translateY(calc(-1 * var(--offset))) scale(0.9);
	}
</style>
