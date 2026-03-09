<script lang="ts">
	import { getCurrentStreak } from '$lib/services/insights';

	let streak = $derived(getCurrentStreak());
</script>

{#if streak.count > 0}
	<div class="streak-container">
		<svg
			class="streak-flame"
			class:pulse={streak.count >= 7}
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M12 2C12 2 7 8 7 13C7 16.5 9 19 12 21C15 19 17 16.5 17 13C17 8 12 2 12 2Z"
				fill="#E8945A"
				opacity="0.9"
			/>
			<path
				d="M12 8C12 8 9.5 11.5 9.5 14C9.5 16 10.5 17.5 12 18.5C13.5 17.5 14.5 16 14.5 14C14.5 11.5 12 8 12 8Z"
				fill="#F5C16C"
				opacity="0.8"
			/>
		</svg>
		<div class="streak-text">
			<span class="streak-count">{streak.count} day{streak.count === 1 ? '' : 's'}</span>
			{#if streak.message}
				<span class="streak-message">{streak.message}</span>
			{/if}
		</div>
	</div>
{/if}

<style>
	@keyframes streak-enter {
		from {
			opacity: 0;
			transform: scale(0.85);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes flame-pulse {
		0%, 100% {
			filter: drop-shadow(0 0 2px rgba(232, 148, 90, 0.3));
			transform: scale(1);
		}
		50% {
			filter: drop-shadow(0 0 6px rgba(232, 148, 90, 0.6));
			transform: scale(1.1);
		}
	}

	.streak-container {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: rgba(255, 255, 255, 0.04);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border-radius: 10px 12px 8px 14px;
		padding: 6px 12px;
		animation: streak-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
	}

	.streak-flame {
		flex-shrink: 0;
	}

	.streak-flame.pulse {
		animation: flame-pulse 2s ease-in-out infinite;
	}

	.streak-text {
		display: flex;
		flex-direction: column;
		line-height: 1.2;
	}

	.streak-count {
		font-size: 0.875rem;
		font-weight: 700;
		color: #E8945A;
	}

	.streak-message {
		font-size: 0.875rem;
		color: var(--text-muted, #8A8A95);
		opacity: 0.7;
	}
</style>
