<!-- Toast.svelte — Animated toast notification for feedback messages -->
<script lang="ts">
	let { message = $bindable(''), visible = $bindable(false), duration = 3000 }: { message: string; visible: boolean; duration?: number } = $props();

	// Auto-dismiss after duration ms
	$effect(() => {
		if (visible && duration > 0) {
			const timer = setTimeout(() => {
				visible = false;
			}, duration);
			return () => clearTimeout(timer);
		}
	});
</script>

{#if visible}
	<div class="toast fixed top-4 inset-x-4 z-50 bg-earth-brown text-parchment font-sans text-sm rounded-xl px-4 py-3 shadow-lg text-center">
		{message}
	</div>
{/if}
