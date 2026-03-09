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
				<p class="empty-icon">📚</p>
				<p class="empty-text">Your nook is waiting for your first thought...</p>
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
	}

	.save-btn:active { transform: scale(0.97); }
	.save-btn:disabled { opacity: 0.4; cursor: default; }

	/* Empty state */
	.empty-state { text-align: center; padding: 48px 20px; }
	.empty-icon { font-size: 3rem; margin-bottom: 12px; }
	.empty-text {
		font-family: var(--font-serif);
		font-size: 1.1rem;
		color: rgba(92, 77, 60, 0.5);
		margin: 0;
	}

	/* Entries */
	.entries-list { display: flex; flex-direction: column; gap: 20px; }

	.date-header {
		font-family: var(--font-sans);
		font-size: 0.8rem;
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

	.entry-card:active { transform: scale(0.99); }
	.entry-card.expanded { box-shadow: 0 4px 16px rgba(181, 160, 209, 0.15); }

	.entry-top { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
	.entry-time { font-size: 0.75rem; color: rgba(92, 77, 60, 0.45); }
	.voice-badge { font-size: 0.7rem; }

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
		padding: 6px 16px;
		border: 1px solid rgba(92, 77, 60, 0.15);
		background: rgba(255, 255, 255, 0.5);
		border-radius: 8px;
		font-family: var(--font-sans);
		font-size: 0.8rem;
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
		padding: 6px 16px;
		border: none;
		border-radius: 8px;
		font-family: var(--font-sans);
		font-size: 0.8rem;
		font-weight: 600;
		cursor: pointer;
	}

	.edit-btn.save { background: #8BAF7C; color: white; }
	.edit-btn.cancel { background: rgba(92, 77, 60, 0.1); color: #5C4D3C; }
</style>
