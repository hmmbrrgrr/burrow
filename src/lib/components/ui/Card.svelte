<!-- Card.svelte — Paper-textured card with soft shadows -->
<script lang="ts">
	let { children, class: className = '' }: { children: any; class?: string } = $props();
</script>

<div class="card press-scale bg-parchment rounded-2xl shadow-md p-4 {className}">
	{@render children()}
</div>
