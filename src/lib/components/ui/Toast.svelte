<!-- Toast.svelte — Animated toast notification for feedback messages -->
<script lang="ts">
	let { message = $bindable(''), visible = $bindable(false) }: { message: string; visible: boolean } = $props();
	// TODO: Auto-dismiss after 3s, slide-up animation
</script>

{#if visible}
	<div class="toast fixed top-4 inset-x-4 z-50 bg-earth-brown text-parchment font-sans text-sm rounded-xl px-4 py-3 shadow-lg text-center">
		{message}
	</div>
{/if}
