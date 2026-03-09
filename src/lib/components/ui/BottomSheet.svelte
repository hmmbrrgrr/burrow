<!-- BottomSheet.svelte — Draggable bottom sheet component with snap points -->
<script lang="ts">
	let { open = $bindable(false), children }: { open: boolean; children: any } = $props();
	// TODO: Touch-draggable with snap points, backdrop blur
</script>

{#if open}
	<div class="bottom-sheet fixed inset-x-0 bottom-0 z-40 bg-parchment rounded-t-3xl shadow-xl p-6 max-h-[80vh] overflow-y-auto">
		<div class="w-12 h-1 bg-earth-brown/20 rounded-full mx-auto mb-4"></div>
		{@render children()}
	</div>
	<button class="fixed inset-0 z-30 bg-earth-brown/20" onclick={() => open = false}></button>
{/if}
