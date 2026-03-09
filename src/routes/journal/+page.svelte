<svelte:head>
	<title>Journal — Burrow</title>
</svelte:head>

<!-- Journal page — The Reading Nook -->
<script lang="ts">
	import { isUnlocked, getNextUnlock } from '$lib/services/unlocks';
	import { saveEntry, getEntries, deleteEntry, updateEntry, type JournalEntry } from '$lib/services/journal';
	import { startListening, stopListening, isSupported } from '$lib/services/voice';

	let journalUnlocked = $derived(isUnlocked('journal'));

	let entries = $state<JournalEntry[]>([]);
	let text = $state('');
	let voiceActive = $state(false);
	let voiceSupported = $state(false);
	let expandedId = $state<string | null>(null);
	let editingId = $state<string | null>(null);
	let editText = $state('');
	let isVoiceEntry = $state(false);

	$effect(() => {
		entries = getEntries();
		voiceSupported = isSupported();
	});

	function toggleVoice() {
		if (voiceActive) {
			stopListening();
			voiceActive = false;
		} else {
			startListening(
				(result) => {
					text += (text ? ' ' : '') + result;
					isVoiceEntry = true;
				},
				() => { voiceActive = false; },
				{ continuous: true }
			);
			voiceActive = true;
		}
	}

	function save() {
		const trimmed = text.trim();
		if (!trimmed) return;
		if (voiceActive) { stopListening(); voiceActive = false; }
		saveEntry({ text: trimmed, createdAt: new Date().toISOString(), isVoice: isVoiceEntry });
		text = '';
		isVoiceEntry = false;
		entries = getEntries();
	}

	function toggle(id: string) {
		if (editingId === id) return;
		expandedId = expandedId === id ? null : id;
	}

	function startEdit(entry: JournalEntry) {
		editingId = entry.id;
		editText = entry.text;
		expandedId = entry.id;
	}

	function saveEdit() {
		if (editingId && editText.trim()) {
			updateEntry(editingId, editText.trim());
			entries = getEntries();
		}
		editingId = null;
		editText = '';
	}

	function cancelEdit() { editingId = null; editText = ''; }

	function remove(id: string) {
		deleteEntry(id);
		entries = getEntries();
		expandedId = null;
		editingId = null;
	}

	function formatDate(iso: string): string {
		return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
	}

	function formatTime(iso: string): string {
		return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
	}

	function preview(t: string): string {
		return t.length > 100 ? t.slice(0, 100) + '...' : t;
	}

	// Group entries by date
	let grouped = $derived.by(() => {
		const groups: { date: string; entries: JournalEntry[] }[] = [];
		const map = new Map<string, JournalEntry[]>();
		for (const e of entries) {
			const key = formatDate(e.createdAt);
			if (!map.has(key)) {
				map.set(key, []);
				groups.push({ date: key, entries: map.get(key)! });
			}
			map.get(key)!.push(e);
		}
		return groups;
	});
</script>

<div class="journal-page">
	<header class="journal-header">
		<h1 class="title"><span class="icon">📖</span> The Reading Nook</h1>
	</header>

	{#if !journalUnlocked}
		<div class="locked-notice">
			<span class="lock-icon">🔒</span>
			<p class="locked-text">This cozy corner is almost ready for you. Keep checking in and it will open soon.</p>
		</div>
	{:else}
		<!-- Entry input -->
		<div class="entry-input">
			<textarea
				class="journal-textarea"
				bind:value={text}
				placeholder="What's on your mind?"
				rows={4}
			></textarea>
			<div class="input-actions">
				{#if voiceSupported}
					<button class="voice-btn" class:active={voiceActive} onclick={toggleVoice} aria-label="Dictate">
						🎤
					</button>
				{/if}
				<button class="save-btn" onclick={save} disabled={!text.trim()}>Save</button>
			</div>
		</div>

		<!-- Entries list -->
		{#if entries.length === 0}
			<div class="empty-state">
				<!-- Floating icon container -->
				<div class="empty-icon-circle">
					<svg class="empty-illustration" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
					<!-- Book spine -->
					<rect x="78" y="50" width="4" height="60" rx="2" fill="#8B7355" opacity="0.6" />
					<!-- Left page -->
					<path d="M78 50 C78 50, 76 48, 30 52 C24 52.5, 20 56, 20 60 L20 105 C20 108, 23 110, 28 110 L78 108 Z" fill="#F5EBD8" stroke="#C4B396" stroke-width="1.5" />
					<!-- Right page -->
					<path d="M82 50 C82 50, 84 48, 130 52 C136 52.5, 140 56, 140 60 L140 105 C140 108, 137 110, 132 110 L82 108 Z" fill="#F5EBD8" stroke="#C4B396" stroke-width="1.5" />
					<!-- Left page lines -->
					<line x1="35" y1="66" x2="70" y2="64" stroke="#C4B396" stroke-width="1" opacity="0.4" />
					<line x1="35" y1="76" x2="68" y2="74" stroke="#C4B396" stroke-width="1" opacity="0.3" />
					<line x1="35" y1="86" x2="65" y2="84" stroke="#C4B396" stroke-width="1" opacity="0.2" />
					<!-- Right page lines -->
					<line x1="90" y1="64" x2="125" y2="66" stroke="#C4B396" stroke-width="1" opacity="0.4" />
					<line x1="92" y1="74" x2="125" y2="76" stroke="#C4B396" stroke-width="1" opacity="0.3" />
					<line x1="94" y1="84" x2="125" y2="86" stroke="#C4B396" stroke-width="1" opacity="0.2" />
					<!-- Sparkles -->
					<g class="sparkle sparkle-1">
						<path d="M50 30 L52 36 L58 38 L52 40 L50 46 L48 40 L42 38 L48 36 Z" fill="#E8945A" opacity="0.7" />
					</g>
					<g class="sparkle sparkle-2">
						<path d="M115 24 L116.5 28 L120.5 29.5 L116.5 31 L115 35 L113.5 31 L109.5 29.5 L113.5 28 Z" fill="#B5A0D1" opacity="0.6" />
					</g>
					<g class="sparkle sparkle-3">
						<path d="M80 18 L81 22 L85 23 L81 24 L80 28 L79 24 L75 23 L79 22 Z" fill="#8BAF7C" opacity="0.5" />
					</g>
					<!-- Quill pen -->
					<path d="M130 20 C130 20, 128 30, 118 45 C116 48, 115 50, 115 50" stroke="#8B7355" stroke-width="1.5" fill="none" />
					<path d="M130 20 C132 18, 136 16, 138 18 C140 20, 138 24, 136 26 C134 28, 130 20, 130 20 Z" fill="#E8945A" opacity="0.8" />
					</svg>
				</div>
				<p class="empty-title">Your story begins here...</p>
				<p class="empty-hint">Tap above to write your first thought</p>
				<p class="empty-cta">Tap the pencil to begin...</p>
			</div>
		{:else}
			<div class="entries-list">
				{#each grouped as group (group.date)}
					<div class="date-group">
						<h3 class="date-header">{group.date}</h3>
						{#each group.entries as entry (entry.id)}
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								class="entry-card"
								class:expanded={expandedId === entry.id}
								onclick={() => toggle(entry.id)}
								onkeydown={(e) => { if (e.key === 'Enter') toggle(entry.id); }}
								role="button"
								tabindex="0"
							>
								<div class="entry-top">
									<span class="entry-time">{formatTime(entry.createdAt)}</span>
									{#if entry.isVoice}<span class="voice-badge">🎤</span>{/if}
								</div>

								{#if editingId === entry.id}
									<textarea
										class="edit-textarea"
										bind:value={editText}
										rows={4}
										onclick={(e) => e.stopPropagation()}
										onkeydown={(e) => e.stopPropagation()}
									></textarea>
									<div class="edit-actions">
										<button class="edit-btn save" onclick={(e) => { e.stopPropagation(); saveEdit(); }}>Save</button>
										<button class="edit-btn cancel" onclick={(e) => { e.stopPropagation(); cancelEdit(); }}>Cancel</button>
									</div>
								{:else if expandedId === entry.id}
									<p class="entry-full">{entry.text}</p>
									<div class="entry-actions">
										<button class="action-btn" onclick={(e) => { e.stopPropagation(); startEdit(entry); }}>Edit</button>
										<button class="action-btn delete" onclick={(e) => { e.stopPropagation(); remove(entry.id); }}>Delete</button>
									</div>
								{:else}
									<p class="entry-preview">{preview(entry.text)}</p>
								{/if}
							</div>
						{/each}
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>

<style>
	.journal-page {
		padding: 16px;
		padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
		max-width: 480px;
		margin: 0 auto;
	}

	.journal-header { margin-bottom: 20px; }

	.title {
		font-family: var(--font-serif);
		font-size: 1.6rem;
		color: #5C4D3C;
		margin: 0;
	}

	.icon { margin-right: 4px; }

	/* Locked */
	.locked-notice {
		text-align: center;
		padding: 3rem 1.5rem;
		opacity: 0.7;
	}
	.lock-icon { font-size: 2.5rem; filter: grayscale(0.5); }
	.locked-text {
		font-family: var(--font-sans);
		font-size: 1rem;
		color: rgba(92, 77, 60, 0.6);
		margin-top: 12px;
	}

	/* Input */
	.entry-input { margin-bottom: 28px; }

	.journal-textarea {
		width: 100%;
		padding: 16px;
		border: 2px solid rgba(92, 77, 60, 0.15);
		border-radius: 14px 10px 16px 12px;
		background: rgba(255, 255, 255, 0.5);
		font-family: var(--font-sans);
		font-size: 1rem;
		color: #5C4D3C;
		resize: vertical;
		outline: none;
		transition: border-color 0.2s ease;
		box-sizing: border-box;
		min-height: min(50dvh, 300px);
	}

	.journal-textarea:focus { border-color: #B5A0D1; }
	.journal-textarea::placeholder { color: rgba(92, 77, 60, 0.4); }

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

	.save-btn {
		padding: 10px 28px;
		border: none;
		border-radius: 12px 14px 10px 16px;
		background: #8BAF7C;
		color: white;
		font-family: var(--font-sans);
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		box-shadow: 0 4px 12px rgba(139, 175, 124, 0.3);
		transition: transform 0.15s ease, opacity 0.2s ease;
		min-height: 44px;
	}

	.save-btn:active { transform: scale(0.97); }
	.save-btn:disabled { opacity: 0.4; cursor: default; }

	/* Empty state */
	.empty-state {
		text-align: center;
		padding: 48px 20px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.empty-icon-circle {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		background: rgba(237, 224, 200, 0.45);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 20px;
		animation: float 3s ease-in-out infinite;
		box-shadow: 0 4px 20px rgba(196, 179, 150, 0.15);
	}
	.empty-illustration {
		width: 80px;
		height: auto;
	}
	@keyframes float {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-6px); }
	}
	.empty-title {
		font-family: var(--font-serif);
		font-size: 1.2rem;
		color: rgba(92, 77, 60, 0.6);
		margin: 0 0 8px;
		font-style: italic;
	}
	.empty-hint {
		font-family: var(--font-serif);
		font-size: 0.875rem;
		color: rgba(92, 77, 60, 0.35);
		margin: 0 0 12px;
	}
	.empty-cta {
		font-family: var(--font-sans);
		font-size: 0.875rem;
		color: rgba(92, 77, 60, 0.3);
		margin: 0;
		letter-spacing: 0.02em;
		animation: fade-pulse 3s ease-in-out infinite;
	}
	@keyframes fade-pulse {
		0%, 100% { opacity: 0.4; }
		50% { opacity: 0.8; }
	}

	/* Sparkle animations */
	.sparkle {
		animation: sparkle-float 3s ease-in-out infinite;
	}
	.sparkle-1 { animation-delay: 0s; }
	.sparkle-2 { animation-delay: 1s; }
	.sparkle-3 { animation-delay: 2s; }

	@keyframes sparkle-float {
		0%, 100% { opacity: 0.3; transform: translateY(0) scale(0.8); }
		50% { opacity: 1; transform: translateY(-4px) scale(1.1); }
	}

	/* Entries */
	.entries-list { display: flex; flex-direction: column; gap: 20px; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; }

	.date-header {
		font-family: var(--font-sans);
		font-size: 0.875rem;
		font-weight: 600;
		color: rgba(92, 77, 60, 0.45);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0 0 8px;
	}

	.date-group { display: flex; flex-direction: column; gap: 8px; }

	.entry-card {
		display: block;
		width: 100%;
		text-align: left;
		padding: 14px;
		background: rgba(255, 255, 255, 0.4);
		border: 1px solid rgba(92, 77, 60, 0.08);
		border-radius: 10px 14px 12px 16px;
		cursor: pointer;
		transition: transform 0.15s ease, box-shadow 0.15s ease;
		font-family: var(--font-sans);
	}

	.entry-card { touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
	.entry-card:active { transform: scale(0.97); }
	.entry-card.expanded { box-shadow: 0 4px 16px rgba(181, 160, 209, 0.15); }

	.entry-top { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
	.entry-time { font-size: 0.875rem; color: rgba(92, 77, 60, 0.45); }
	.voice-badge { font-size: 0.75rem; }

	.entry-preview {
		margin: 0;
		font-size: 0.9rem;
		color: #5C4D3C;
		line-height: 1.5;
	}

	.entry-full {
		margin: 0;
		font-size: 0.9rem;
		color: #5C4D3C;
		line-height: 1.6;
		white-space: pre-wrap;
	}

	.entry-actions, .edit-actions { display: flex; gap: 8px; margin-top: 12px; }

	.action-btn {
		padding: 10px 16px;
		min-height: 44px;
		border: 1px solid rgba(92, 77, 60, 0.15);
		background: rgba(255, 255, 255, 0.5);
		border-radius: 8px;
		font-family: var(--font-sans);
		font-size: 0.875rem;
		color: #5C4D3C;
		cursor: pointer;
	}

	.action-btn.delete { color: #E88A8A; border-color: rgba(232, 138, 138, 0.3); }

	.edit-textarea {
		width: 100%;
		padding: 10px;
		border: 2px solid #B5A0D1;
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.6);
		font-family: var(--font-sans);
		font-size: 0.9rem;
		color: #5C4D3C;
		resize: vertical;
		outline: none;
		margin-top: 4px;
		box-sizing: border-box;
	}

	.edit-btn {
		padding: 10px 16px;
		min-height: 44px;
		border: none;
		border-radius: 8px;
		font-family: var(--font-sans);
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
	}

	.edit-btn.save { background: #8BAF7C; color: white; }
	.edit-btn.cancel { background: rgba(92, 77, 60, 0.1); color: #5C4D3C; }

	@media (max-height: 700px) {
		.journal-textarea { min-height: min(30dvh, 200px); }
	}

	@media (min-width: 768px) {
		.journal-page { max-width: 720px; }
	}

	@media (min-width: 1440px) {
		.journal-page { max-width: 900px; }
	}
</style>
