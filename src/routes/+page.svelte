<!-- Home page — World view fills the screen -->
<script lang="ts">
	import WorldScene from '$lib/components/world/WorldScene.svelte';
</script>

<div class="home">
	<WorldScene />
</div>

<style>
	.home {
		position: fixed;
		inset: 0;
		overflow: hidden;
	}
</style>
