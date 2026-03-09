<!-- NewBadge.svelte — Pulsing orange dot for new unlocked features -->
<script lang="ts">
	interface Props {
		show?: boolean;
	}

	let { show = true }: Props = $props();
</script>

{#if show}
	<span class="new-badge" aria-label="New">
		<span class="badge-dot"></span>
		<span class="badge-ping"></span>
	</span>
{/if}

<style>
	.new-badge {
		position: absolute;
		top: -2px;
		right: -2px;
		width: 10px;
		height: 10px;
		display: block;
		pointer-events: none;
	}
	.badge-dot {
		position: absolute;
		inset: 1px;
		background: #E8945A;
		border-radius: 50%;
		z-index: 1;
	}
	.badge-ping {
		position: absolute;
		inset: 0;
		background: #E8945A;
		border-radius: 50%;
		animation: badge-pulse 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
	}
	@keyframes badge-pulse {
		0% { transform: scale(1); opacity: 0.6; }
		75%, 100% { transform: scale(2); opacity: 0; }
	}
</style>
