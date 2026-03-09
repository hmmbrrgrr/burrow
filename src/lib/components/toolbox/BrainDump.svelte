<!-- BrainDump.svelte — Rapid thought capture with voice input -->
<script lang="ts">
	import { saveDump, getDumps, deleteDump, type BrainDump as BrainDumpType } from '$lib/services/journal';
	import { startListening, stopListening, isListening, isSupported } from '$lib/services/voice';

	interface Props {
		open: boolean;
		startWithVoice?: boolean;
	}

	let { open = $bindable(false), startWithVoice = false }: Props = $props();

	let text = $state('');
	let dumps = $state<BrainDumpType[]>([]);
	let voiceActive = $state(false);
	let voiceSupported = $state(false);
	let expandedDumps = $state<Set<string>>(new Set());

	let wordCount = $derived(text.trim() ? text.trim().split(/\s+/).length : 0);

	function toggleExpand(id: string) {
		const next = new Set(expandedDumps);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		expandedDumps = next;
	}

	function shouldTruncate(t: string): boolean {
		return t.length > 150;
	}

	$effect(() => {
		if (open) {
			dumps = getDumps();
			voiceSupported = isSupported();
			if (startWithVoice && voiceSupported) {
				toggleVoice();
			}
		} else {
			if (voiceActive) {
				stopListening();
				voiceActive = false;
			}
		}
	});

	function toggleVoice() {
		if (voiceActive) {
			stopListening();
			voiceActive = false;
		} else {
			startListening(
				(result) => {
					text += (text ? ' ' : '') + result;
				},
				() => {
					voiceActive = false;
				},
				{ continuous: false }
			);
			voiceActive = true;
		}
	}

	function dump() {
		const trimmed = text.trim();
		if (!trimmed) return;
		saveDump(trimmed);
		text = '';
		dumps = getDumps();
	}

	function removeDump(id: string) {
		deleteDump(id);
		dumps = getDumps();
	}

	function close() {
		if (voiceActive) {
			stopListening();
			voiceActive = false;
		}
		text = '';
		open = false;
	}

	function formatDate(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
	}
</script>

{#if open}
	<div class="dump-overlay">
		<button class="close-btn" onclick={close} aria-label="Close">✕</button>

		<div class="dump-content fade-in">
			<h2 class="dump-title">Brain Dump</h2>

			<div class="input-area">
				<textarea
					class="dump-textarea"
					bind:value={text}
					placeholder="Just get it out of your head..."
					rows={4}
				></textarea>
				<div class="word-count">{wordCount} words</div>
				<div class="input-actions">
					{#if voiceSupported}
						<button class="voice-btn" class:active={voiceActive} onclick={toggleVoice} aria-label="Voice input">
							🎤
						</button>
					{/if}
					<button class="dump-btn" onclick={dump} disabled={!text.trim()}>Dump</button>
				</div>
			</div>

			{#if dumps.length > 0}
				<div class="past-dumps-section">
					<h3 class="past-dumps-header">Your thoughts ({dumps.length})</h3>
					<div class="past-dumps">
						{#each dumps as d (d.id)}
							<div class="dump-item">
								<div class="dump-meta">{formatDate(d.createdAt)} · {d.text.trim().split(/\s+/).length} words</div>
								{#if shouldTruncate(d.text) && !expandedDumps.has(d.id)}
									<p class="dump-text">{d.text.slice(0, 150)}…</p>
									<button class="show-more-btn" onclick={() => toggleExpand(d.id)}>show more</button>
								{:else}
									<p class="dump-text">{d.text}</p>
									{#if shouldTruncate(d.text)}
										<button class="show-more-btn" onclick={() => toggleExpand(d.id)}>show less</button>
									{/if}
								{/if}
								<button class="delete-btn" onclick={() => removeDump(d.id)} aria-label="Delete">✕</button>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.dump-overlay {
		position: fixed;
		inset: 0;
		z-index: 60;
		background: #F5EBD8;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		padding: 60px 20px 40px;
	}

	.close-btn {
		position: fixed;
		top: 16px;
		right: 16px;
		width: 40px;
		height: 40px;
		border: none;
		background: rgba(92, 77, 60, 0.1);
		border-radius: 50%;
		font-size: 1.2rem;
		color: #5C4D3C;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 61;
	}

	.dump-content {
		max-width: 480px;
		width: 100%;
		margin: 0 auto;
	}

	.dump-title {
		font-family: var(--font-serif);
		font-size: 1.5rem;
		color: #5C4D3C;
		margin: 0 0 20px;
	}

	.input-area {
		margin-bottom: 24px;
	}

	.dump-textarea {
		width: 100%;
		padding: 16px;
		border: 2px solid rgba(92, 77, 60, 0.15);
		border-radius: 14px 12px 16px 10px;
		background: rgba(255, 255, 255, 0.5);
		font-family: var(--font-sans);
		font-size: 1rem;
		color: #5C4D3C;
		resize: vertical;
		outline: none;
		transition: border-color 0.2s ease;
		box-sizing: border-box;
	}

	.dump-textarea:focus {
		border-color: #E8945A;
	}

	.dump-textarea::placeholder {
		color: rgba(92, 77, 60, 0.4);
	}

	.word-count {
		font-family: var(--font-sans);
		font-size: 0.75rem;
		color: rgba(92, 77, 60, 0.4);
		margin-top: 6px;
		text-align: left;
	}

	.input-actions {
		display: flex;
		gap: 8px;
		margin-top: 10px;
		justify-content: flex-end;
	}

	.voice-btn {
		width: 44px;
		height: 44px;
		border: 2px solid rgba(92, 77, 60, 0.15);
		background: rgba(255, 255, 255, 0.5);
		border-radius: 50%;
		font-size: 1.2rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.voice-btn.active {
		background: #E8945A;
		border-color: #E8945A;
		animation: pulse-mic 1.5s ease-in-out infinite;
	}

	@keyframes pulse-mic {
		0%, 100% { box-shadow: 0 0 0 0 rgba(232, 148, 90, 0.4); }
		50% { box-shadow: 0 0 0 8px rgba(232, 148, 90, 0); }
	}

	.dump-btn {
		padding: 10px 28px;
		border: none;
		border-radius: 12px 14px 10px 16px;
		background: #E8945A;
		color: white;
		font-family: var(--font-sans);
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		box-shadow: 0 4px 12px rgba(232, 148, 90, 0.3);
		transition: transform 0.15s ease, opacity 0.2s ease;
	}

	.dump-btn:active {
		transform: scale(0.97);
	}

	.dump-btn:disabled {
		opacity: 0.4;
		cursor: default;
	}

	.past-dumps-section {
		margin-top: 20px;
		padding-top: 20px;
		border-top: 1px solid rgba(92, 77, 60, 0.1);
	}

	.past-dumps-header {
		font-family: var(--font-serif);
		font-size: 1rem;
		color: rgba(92, 77, 60, 0.6);
		margin-bottom: 12px;
		font-weight: 500;
	}

	.past-dumps {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.dump-item {
		position: relative;
		padding: 12px 36px 12px 16px;
		background: rgba(255, 255, 255, 0.4);
		border-radius: 10px 12px 14px 8px;
		border: 1px solid rgba(92, 77, 60, 0.08);
		border-left: 3px solid #B5A0D1;
		animation: slide-in 0.3s ease forwards;
		transition: background 0.2s ease;
	}

	.dump-item:hover {
		background: rgba(255, 255, 255, 0.6);
	}

	@keyframes slide-in {
		from { opacity: 0; transform: translateX(-8px); }
		to { opacity: 1; transform: translateX(0); }
	}

	.dump-meta {
		font-family: var(--font-sans);
		font-size: 0.7rem;
		color: rgba(92, 77, 60, 0.35);
		margin-bottom: 4px;
		letter-spacing: 0.02em;
	}

	.dump-text {
		font-family: var(--font-sans);
		font-size: 0.9rem;
		color: #5C4D3C;
		margin: 0;
		white-space: pre-wrap;
	}

	.show-more-btn {
		background: none;
		border: none;
		font-family: var(--font-sans);
		font-size: 0.75rem;
		color: #B5A0D1;
		cursor: pointer;
		padding: 2px 0;
		margin-top: 4px;
		font-weight: 600;
		transition: color 0.15s ease;
	}

	.show-more-btn:hover {
		color: #9580B8;
	}

	.delete-btn {
		position: absolute;
		top: 8px;
		right: 8px;
		width: 24px;
		height: 24px;
		border: none;
		background: none;
		color: rgba(92, 77, 60, 0.3);
		font-size: 0.8rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.delete-btn:hover {
		color: #E88A8A;
	}

	.fade-in {
		animation: fade-in 0.4s ease forwards;
	}

	@keyframes fade-in {
		from { opacity: 0; transform: translateY(12px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
