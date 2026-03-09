<!-- BottomSheet.svelte — Slide-up panel with drag-to-dismiss -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		height?: 'half' | 'full' | 'auto';
		children: Snippet;
	}

	let { open = $bindable(false), height = 'auto', children }: Props = $props();

	let sheetEl: HTMLDivElement | undefined = $state();
	let dragStartY = $state(0);
	let dragOffset = $state(0);
	let isDragging = $state(false);

	const maxHeight = $derived(
		height === 'full' ? '95vh' : height === 'half' ? '50vh' : '85vh'
	);

	function onTouchStart(e: TouchEvent) {
		dragStartY = e.touches[0].clientY;
		isDragging = true;
		dragOffset = 0;
	}

	function onTouchMove(e: TouchEvent) {
		if (!isDragging) return;
		const delta = e.touches[0].clientY - dragStartY;
		// Only allow dragging down
		dragOffset = Math.max(0, delta);
	}

	function onTouchEnd() {
		isDragging = false;
		if (dragOffset > 120) {
			open = false;
		}
		dragOffset = 0;
	}

	function onBackdropClick() {
		open = false;
	}
</script>

{#if open}
	<!-- Backdrop -->
	<button
		class="sheet-backdrop"
		class:visible={open}
		onclick={onBackdropClick}
		aria-label="Close"
	></button>

	<!-- Sheet -->
	<div
		bind:this={sheetEl}
		class="sheet"
		class:dragging={isDragging}
		style="max-height: {maxHeight}; transform: translateY({dragOffset}px);"
		ontouchstart={onTouchStart}
		ontouchmove={onTouchMove}
		ontouchend={onTouchEnd}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<!-- Drag handle -->
		<div class="sheet-handle">
			<div class="handle-bar"></div>
		</div>

		<!-- Content -->
		<div class="sheet-content">
			{@render children()}
		</div>
	</div>
{/if}

<style>
	.sheet-backdrop {
		position: fixed;
		inset: 0;
		z-index: 40;
		background: rgba(92, 77, 60, 0.3);
		border: none;
		cursor: default;
		animation: backdrop-in 0.35s ease-out forwards;
	}

	@keyframes backdrop-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.sheet {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 50;
		background: #F5EBD8;
		border-radius: 16px 16px 0 0;
		box-shadow: 0 -4px 24px rgba(92, 77, 60, 0.15);
		overflow-y: auto;
		animation: sheet-spring 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
		transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
		will-change: transform;
	}

	.sheet.dragging {
		transition: none;
	}

	@keyframes sheet-spring {
		from { transform: translateY(100%); }
		to { transform: translateY(0); }
	}

	.sheet-handle {
		display: flex;
		justify-content: center;
		padding: 12px 0 4px;
		cursor: grab;
	}

	.handle-bar {
		width: 40px;
		height: 4px;
		border-radius: 2px;
		background: rgba(92, 77, 60, 0.2);
	}

	.sheet-content {
		padding: 8px 24px 32px;
		/* Safe area for bottom-of-screen phones */
		padding-bottom: max(32px, env(safe-area-inset-bottom));
		overflow-y: auto;
	}
</style>
