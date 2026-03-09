/**
 * Svelte action that uses IntersectionObserver to toggle a `data-visible`
 * attribute on the element.  When the element is offscreen the attribute is
 * set to "false", allowing CSS to pause animations, hide heavy layers, etc.
 *
 * Usage:  <div use:useVisibility>…</div>
 */
export function useVisibility(node: HTMLElement, options?: IntersectionObserverInit) {
	const observer = new IntersectionObserver(
		([entry]) => {
			node.dataset.visible = entry.isIntersecting ? 'true' : 'false';
		},
		{ threshold: 0, ...options }
	);

	// Start as visible (optimistic — avoids flash of paused state)
	node.dataset.visible = 'true';
	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
}
