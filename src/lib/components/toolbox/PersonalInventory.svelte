<!-- PersonalInventory.svelte — Guided personal inventory with Ember -->
<script lang="ts">
	import { appState } from '$lib/stores/app.svelte';
	import {
		type ResentmentEntry,
		type FearEntry,
		type PatternEntry,
		type PatternTag,
		type StrengthEntry,
		type InventoryProgress,
		type PersonalInventorySnapshot,
		getInventoryProgress,
		saveInventoryProgress,
		clearInventoryProgress,
		saveInventorySnapshot,
		getInventorySnapshots,
	} from '$lib/services/inventory';
	import { startListening, stopListening, isListening, isSupported } from '$lib/services/voice';

	interface Props {
		open: boolean;
	}

	let { open = $bindable(false) }: Props = $props();

	const sections = ['Resentments', 'Fears', 'Patterns', 'Strengths', 'Review'] as const;

	const emberMessages: Record<string, string> = {
		Resentments: "What's been weighing on you? No judgment here.",
		Fears: "It's okay to name what scares you.",
		Patterns: 'Noticing patterns is the first step to change.',
		Strengths: "Don't skip this one — you deserve to see the good.",
		Review: "That took courage. I'm proud of you.",
	};

	let currentSection = $state(0);
	let direction = $state<'forward' | 'back'>('forward');

	// Section data
	let resentments = $state<ResentmentEntry[]>([]);
	let fears = $state<FearEntry[]>([]);
	let patterns = $state<PatternEntry[]>([]);
	let strengths = $state<StrengthEntry[]>([]);
	let intention = $state('');

	let previousEmberState = '';
	let previousEmberMessage = '';

	// ─── History / completion state ───
	let viewingHistory = $state(false);
	let pastSnapshots = $state<PersonalInventorySnapshot[]>([]);
	let expandedSnapshotId = $state<string | null>(null);
	let completing = $state(false);
	let completionTimer: ReturnType<typeof setTimeout> | null = null;

	// ─── Voice state ───
	let voiceSupported = $state(false);
	let voiceActiveField = $state<string | null>(null);

	// ─── Resentment form state ───
	let resentmentText = $state('');
	let resentmentWho = $state('');
	let resentmentWhy = $state('');
	let resentmentDifferently = $state('');
	let resentmentDetailOpen = $state(false);

	// ─── Fear form state ───
	let fearText = $state('');
	let fearWorstCase = $state('');
	let fearMoreLikely = $state('');
	let fearDetailOpen = $state(false);

	// ─── Voice helpers ───
	function stopAllVoice() {
		if (voiceActiveField) {
			stopListening();
			voiceActiveField = null;
		}
	}

	function toggleVoice(field: string, setter: (val: string) => void, getter: () => string) {
		if (voiceActiveField === field) {
			stopListening();
			voiceActiveField = null;
		} else {
			stopAllVoice();
			startListening(
				(result) => {
					const current = getter();
					setter(current + (current ? ' ' : '') + result);
				},
				() => {
					voiceActiveField = null;
				},
				{ continuous: false }
			);
			voiceActiveField = field;
		}
	}

	// ─── Resentment helpers ───
	function addResentment() {
		const trimmed = resentmentText.trim();
		if (!trimmed) return;
		const entry: ResentmentEntry = {
			id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
			type: 'resentment',
			text: trimmed,
			timestamp: Date.now(),
			who: resentmentWho.trim() || undefined,
			whyBothers: resentmentWhy.trim() || undefined,
			doDifferently: resentmentDifferently.trim() || undefined,
		};
		resentments = [...resentments, entry];
		resentmentText = '';
		resentmentWho = '';
		resentmentWhy = '';
		resentmentDifferently = '';
		resentmentDetailOpen = false;
		stopAllVoice();
		saveProgress();
	}

	function removeResentment(id: string) {
		resentments = resentments.filter((r) => r.id !== id);
		saveProgress();
	}

	// ─── Fear helpers ───
	function addFear() {
		const trimmed = fearText.trim();
		if (!trimmed) return;
		const entry: FearEntry = {
			id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
			type: 'fear',
			text: trimmed,
			timestamp: Date.now(),
			worstCase: fearWorstCase.trim() || undefined,
			moreLikely: fearMoreLikely.trim() || undefined,
		};
		fears = [...fears, entry];
		fearText = '';
		fearWorstCase = '';
		fearMoreLikely = '';
		fearDetailOpen = false;
		stopAllVoice();
		saveProgress();
	}

	function removeFear(id: string) {
		fears = fears.filter((f) => f.id !== id);
		saveProgress();
	}

	function textPreview(text: string, max = 80): string {
		return text.length > max ? text.slice(0, max) + '…' : text;
	}

	// ─── Lifecycle ───
	$effect(() => {
		if (open) {
			voiceSupported = isSupported();
			// Load saved progress
			const saved = getInventoryProgress();
			if (saved) {
				currentSection = saved.currentSection;
				resentments = (saved.snapshot.resentments ?? []) as ResentmentEntry[];
				fears = (saved.snapshot.fears ?? []) as FearEntry[];
				patterns = (saved.snapshot.patterns ?? []) as PatternEntry[];
				strengths = (saved.snapshot.strengths ?? []) as StrengthEntry[];
				intention = saved.snapshot.intention ?? '';
			} else {
				currentSection = 0;
				resentments = [];
				fears = [];
				patterns = [];
				strengths = [];
				intention = '';
			}
			direction = 'forward';
			previousEmberState = appState.emberState;
			previousEmberMessage = appState.emberMessage;
			appState.emberState = 'thinking';
			appState.emberMessage = emberMessages[sections[0]];
		} else {
			// Clean up voice listener if open is set externally to false
			if (voiceActiveField) {
				stopListening();
				voiceActiveField = null;
			}
		}
	});

	// Update ember message when section changes
	$effect(() => {
		if (open) {
			appState.emberMessage = emberMessages[sections[currentSection]];
		}
	});

	// ─── Navigation ───
	function nextSection() {
		if (currentSection < sections.length - 1) {
			direction = 'forward';
			currentSection += 1;
			saveProgress();
		}
	}

	function prevSection() {
		if (currentSection > 0) {
			direction = 'back';
			currentSection -= 1;
			saveProgress();
		}
	}

	function skipSection() {
		if (currentSection < sections.length - 1) {
			nextSection();
		}
	}

	function saveProgress() {
		const progress: InventoryProgress = {
			currentSection,
			snapshot: {
				resentments,
				fears,
				patterns,
				strengths,
				intention,
			},
			timestamp: Date.now(),
		};
		saveInventoryProgress(progress);
	}

	// ─── Patterns form state ───
	let patternText = $state('');
	let patternTags = $state<PatternTag[]>([]);
	const allPatternTags: PatternTag[] = ['relationships', 'work', 'health', 'money', 'self-talk'];

	function togglePatternTag(tag: PatternTag) {
		if (patternTags.includes(tag)) {
			patternTags = patternTags.filter((t) => t !== tag);
		} else {
			patternTags = [...patternTags, tag];
		}
	}

	function addPattern() {
		if (!patternText.trim()) return;
		const entry: PatternEntry = {
			id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
			type: 'pattern',
			text: patternText.trim(),
			timestamp: Date.now(),
			tags: [...patternTags],
		};
		patterns = [...patterns, entry];
		patternText = '';
		patternTags = [];
		saveProgress();
	}

	function deletePattern(id: string) {
		patterns = patterns.filter((p) => p.id !== id);
		saveProgress();
	}

	// ─── Strengths form state ───
	let strengthText = $state('');
	const strengthSuggestions = ['kind', 'creative', 'resilient', 'funny', 'loyal', 'hardworking', 'empathetic', 'honest'];

	function addStrength(text: string) {
		if (!text.trim()) return;
		const entry: StrengthEntry = {
			id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
			type: 'strength',
			text: text.trim(),
			timestamp: Date.now(),
		};
		strengths = [...strengths, entry];
		saveProgress();
	}

	function addStrengthFromForm() {
		if (!strengthText.trim()) return;
		addStrength(strengthText.trim());
		strengthText = '';
	}

	function toggleStrengthChip(word: string) {
		const existing = strengths.find((s) => s.text.toLowerCase() === word.toLowerCase());
		if (existing) {
			strengths = strengths.filter((s) => s.id !== existing.id);
		} else {
			addStrength(word);
		}
	}

	function isStrengthChipSelected(word: string): boolean {
		return strengths.some((s) => s.text.toLowerCase() === word.toLowerCase());
	}

	function deleteStrength(id: string) {
		strengths = strengths.filter((s) => s.id !== id);
		saveProgress();
	}

	function formatDate(ts: number): string {
		const d = new Date(ts);
		return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
	}

	function completeInventory() {
		completing = true;
		const snapshot: PersonalInventorySnapshot = {
			id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
			date: Date.now(),
			resentments: [...resentments],
			fears: [...fears],
			patterns: [...patterns],
			strengths: [...strengths],
			intention: intention.trim(),
			completed: true,
		};
		saveInventorySnapshot(snapshot);
		clearInventoryProgress();
		// Brief celebration, then close
		completionTimer = setTimeout(() => {
			completionTimer = null;
			completing = false;
			appState.emberState = previousEmberState as typeof appState.emberState;
			appState.emberMessage = previousEmberMessage;
			open = false;
		}, 1800);
	}

	function showHistory() {
		pastSnapshots = getInventorySnapshots();
		expandedSnapshotId = null;
		viewingHistory = true;
	}

	function hideHistory() {
		viewingHistory = false;
	}

	function toggleSnapshot(id: string) {
		expandedSnapshotId = expandedSnapshotId === id ? null : id;
	}

	function close() {
		if (completionTimer) {
			clearTimeout(completionTimer);
			completionTimer = null;
		}
		completing = false;
		stopAllVoice();
		saveProgress();
		appState.emberState = previousEmberState as typeof appState.emberState;
		appState.emberMessage = previousEmberMessage;
		open = false;
	}
</script>

{#if open}
<div class="inventory-overlay">
	<!-- Close button -->
	<button class="close-btn" onclick={close} aria-label="Close">✕</button>

	<!-- Progress dots -->
	<div class="progress-dots">
		{#each sections as section, i}
			<span
				class="dot"
				class:active={i === currentSection}
				class:completed={i < currentSection}
				title={section}
			></span>
		{/each}
	</div>

	{#if viewingHistory}
	<!-- Past Inventories View -->
	<div class="inventory-content">
		<h2 class="section-title">Past Inventories</h2>

		{#if pastSnapshots.length === 0}
			<div class="empty-history">
				<p class="placeholder-text">No completed inventories yet.</p>
			</div>
		{:else}
			<div class="history-list">
				{#each pastSnapshots as snap (snap.id)}
					<button class="history-card" onclick={() => toggleSnapshot(snap.id)}>
						<div class="history-header">
							<span class="history-date">{formatDate(snap.date)}</span>
							<span class="history-arrow" class:expanded={expandedSnapshotId === snap.id}>▸</span>
						</div>
						<div class="history-counts">
							{#if snap.resentments.length > 0}<span class="history-count">😤 {snap.resentments.length}</span>{/if}
							{#if snap.fears.length > 0}<span class="history-count">😰 {snap.fears.length}</span>{/if}
							{#if snap.patterns.length > 0}<span class="history-count">🔄 {snap.patterns.length}</span>{/if}
							{#if snap.strengths.length > 0}<span class="history-count">💪 {snap.strengths.length}</span>{/if}
						</div>
						{#if expandedSnapshotId === snap.id}
							<div class="history-details" onclick={(e) => e.stopPropagation()}>
								{#if snap.resentments.length > 0}
									<div class="history-section">
										<h4 class="history-section-title">😤 Resentments</h4>
										{#each snap.resentments as r}
											<p class="history-entry">{r.text}</p>
										{/each}
									</div>
								{/if}
								{#if snap.fears.length > 0}
									<div class="history-section">
										<h4 class="history-section-title">😰 Fears</h4>
										{#each snap.fears as f}
											<p class="history-entry">{f.text}</p>
										{/each}
									</div>
								{/if}
								{#if snap.patterns.length > 0}
									<div class="history-section">
										<h4 class="history-section-title">🔄 Patterns</h4>
										{#each snap.patterns as p}
											<p class="history-entry">{p.text}{#if p.tags && p.tags.length > 0} <span class="history-tags">({p.tags.join(', ')})</span>{/if}</p>
										{/each}
									</div>
								{/if}
								{#if snap.strengths.length > 0}
									<div class="history-section">
										<h4 class="history-section-title">💪 Strengths</h4>
										<p class="history-entry">{snap.strengths.map(s => s.text).join(', ')}</p>
									</div>
								{/if}
								{#if snap.intention}
									<div class="history-section">
										<h4 class="history-section-title">🎯 Intention</h4>
										<p class="history-entry">{snap.intention}</p>
									</div>
								{/if}
							</div>
						{/if}
					</button>
				{/each}
			</div>
		{/if}

		<button class="nav-btn next-btn" onclick={hideHistory}>Back to new inventory</button>
	</div>
	{:else}

	<!-- "View Past" link — show on first section only -->
	{#if currentSection === 0}
		<button class="view-past-btn" onclick={showHistory}>View Past</button>
	{/if}

	<div class="inventory-content">
		{#key currentSection}
		<div class="section-screen {direction === 'forward' ? 'slide-in-right' : 'slide-in-left'}">
			<!-- Section title -->
			<h2 class="section-title">{sections[currentSection]}</h2>

			<!-- Ember speech bubble -->
			<div class="ember-bubble">
				<span class="ember-icon">🔥</span>
				<div class="ember-speech">
					<p class="ember-text">{emberMessages[sections[currentSection]]}</p>
					<span class="ember-pointer"></span>
				</div>
			</div>

			<!-- Section content (placeholders) -->
			{#if currentSection === 0}
				<div class="section-body">
					<div class="input-group">
						<textarea
							class="entry-textarea"
							rows={4}
							placeholder="What's been on your mind..."
							bind:value={resentmentText}
						></textarea>
						<div class="input-actions">
							{#if voiceSupported}
								<button
									class="voice-btn"
									class:active={voiceActiveField === 'resentment-text'}
									onclick={() => toggleVoice('resentment-text', (v) => resentmentText = v, () => resentmentText)}
									aria-label="Voice input"
								>🎙️</button>
							{/if}
						</div>
					</div>

					<button class="detail-toggle" onclick={() => resentmentDetailOpen = !resentmentDetailOpen}>
						<span class="toggle-arrow" class:expanded={resentmentDetailOpen}>▸</span>
						Add more detail
					</button>

					{#if resentmentDetailOpen}
						<div class="detail-fields">
							<label class="field-label">
								Who or what?
								<input type="text" class="entry-input" bind:value={resentmentWho} placeholder="Person, situation, or thing..." />
							</label>
							<label class="field-label">
								Why does it bother you?
								<textarea class="entry-textarea small" bind:value={resentmentWhy} rows={2} placeholder="What feelings come up..."></textarea>
							</label>
							<label class="field-label">
								Is there anything you'd do differently?
								<textarea class="entry-textarea small" bind:value={resentmentDifferently} rows={2} placeholder="Looking back..."></textarea>
							</label>
						</div>
					{/if}

					<button class="add-entry-btn" onclick={addResentment} disabled={!resentmentText.trim()}>
						Add Entry
					</button>

					{#if resentments.length > 0}
						<div class="entry-list">
							{#each resentments as entry (entry.id)}
								<div class="entry-card">
									<div class="entry-content">
										<p class="entry-text">{textPreview(entry.text)}</p>
										{#if entry.who}
											<span class="entry-detail">→ {entry.who}</span>
										{/if}
									</div>
									<button class="delete-entry-btn" onclick={() => removeResentment(entry.id)} aria-label="Delete entry">✕</button>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{:else if currentSection === 1}
				<div class="section-body">
					<div class="input-group">
						<textarea
							class="entry-textarea"
							rows={4}
							placeholder="What scares you right now..."
							bind:value={fearText}
						></textarea>
						<div class="input-actions">
							{#if voiceSupported}
								<button
									class="voice-btn"
									class:active={voiceActiveField === 'fear-text'}
									onclick={() => toggleVoice('fear-text', (v) => fearText = v, () => fearText)}
									aria-label="Voice input"
								>🎙️</button>
							{/if}
						</div>
					</div>

					<button class="detail-toggle" onclick={() => fearDetailOpen = !fearDetailOpen}>
						<span class="toggle-arrow" class:expanded={fearDetailOpen}>▸</span>
						Gentle reframe
					</button>

					{#if fearDetailOpen}
						<div class="detail-fields">
							<label class="field-label">
								What's the worst that could happen?
								<textarea class="entry-textarea small" bind:value={fearWorstCase} rows={2} placeholder="If the fear came true..."></textarea>
							</label>
							<label class="field-label">
								What's actually more likely?
								<textarea class="entry-textarea small" bind:value={fearMoreLikely} rows={2} placeholder="Realistically..."></textarea>
							</label>
						</div>
					{/if}

					<button class="add-entry-btn" onclick={addFear} disabled={!fearText.trim()}>
						Add Entry
					</button>

					{#if fears.length > 0}
						<div class="entry-list">
							{#each fears as entry (entry.id)}
								<div class="entry-card">
									<div class="entry-content">
										<p class="entry-text">{textPreview(entry.text)}</p>
										{#if entry.worstCase && entry.moreLikely}
											<span class="entry-detail">↻ reframed</span>
										{/if}
									</div>
									<button class="delete-entry-btn" onclick={() => removeFear(entry.id)} aria-label="Delete entry">✕</button>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{:else if currentSection === 2}
				<div class="section-body">
					<p class="section-intro">What keeps showing up? Behaviors or situations that repeat.</p>

					<textarea
						class="entry-textarea"
						rows="4"
						placeholder="I notice that I tend to..."
						bind:value={patternText}
					></textarea>

					<!-- Tag selector -->
					<div class="tag-chips">
						{#each allPatternTags as tag}
							<button
								class="tag-chip"
								class:selected={patternTags.includes(tag)}
								onclick={() => togglePatternTag(tag)}
							>
								{tag}
							</button>
						{/each}
					</div>

					<button class="add-entry-btn" onclick={addPattern} disabled={!patternText.trim()}>
						Add Entry
					</button>

					<!-- Entry list -->
					{#if patterns.length > 0}
						<div class="entry-list">
							{#each patterns as entry (entry.id)}
								<div class="entry-card">
									<div class="entry-content">
										<p class="entry-text">{entry.text}</p>
										{#if entry.tags && entry.tags.length > 0}
											<div class="entry-tags">
												{#each entry.tags as tag}
													<span class="entry-tag-badge">{tag}</span>
												{/each}
											</div>
										{/if}
									</div>
									<button class="delete-entry-btn" onclick={() => deletePattern(entry.id)} aria-label="Delete entry">✕</button>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{:else if currentSection === 3}
				<div class="section-body">
					<p class="section-intro">What are you proud of? This section matters.</p>

					<!-- Suggestion chips -->
					<div class="suggestion-chips">
						{#each strengthSuggestions as word}
							<button
								class="suggestion-chip"
								class:selected={isStrengthChipSelected(word)}
								onclick={() => toggleStrengthChip(word)}
							>
								{word}
							</button>
						{/each}
					</div>

					<textarea
						class="entry-textarea"
						rows="3"
						placeholder="Something else you're proud of..."
						bind:value={strengthText}
					></textarea>

					<button class="add-entry-btn" onclick={addStrengthFromForm} disabled={!strengthText.trim()}>
						Add Entry
					</button>

					<!-- Entry list -->
					{#if strengths.length > 0}
						<div class="entry-list">
							{#each strengths as entry (entry.id)}
								<div class="entry-card strength-card">
									<p class="entry-text">{entry.text}</p>
									<button class="delete-entry-btn" onclick={() => deleteStrength(entry.id)} aria-label="Delete entry">✕</button>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{:else if currentSection === 4}
				<div class="section-body review-body">
				{#if completing}
					<div class="completion-animation">
						<span class="completion-emoji">🧡</span>
						<p class="completion-text">Inventory saved. You did great.</p>
					</div>
				{:else}
					{#if resentments.length === 0 && fears.length === 0 && patterns.length === 0 && strengths.length === 0}
						<div class="empty-review">
							<p class="ember-text" style="text-align: center; font-style: italic;">You skipped everything — and that's okay. You showed up, and that counts. You can always come back.</p>
						</div>
					{/if}
					{#if resentments.length > 0}
						<div class="summary-card summary-resentments">
							<h3 class="summary-title"><span class="summary-emoji">😤</span> Resentments</h3>
							<p class="summary-detail">{resentments.length} {resentments.length === 1 ? 'entry' : 'entries'} — "{textPreview(resentments[0].text, 60)}"</p>
						</div>
					{/if}
					{#if fears.length > 0}
						<div class="summary-card summary-fears">
							<h3 class="summary-title"><span class="summary-emoji">😰</span> Fears</h3>
							<p class="summary-detail">{fears.length} {fears.length === 1 ? 'entry' : 'entries'} — "{textPreview(fears[0].text, 60)}"</p>
						</div>
					{/if}
					{#if patterns.length > 0}
						<div class="summary-card summary-patterns">
							<h3 class="summary-title"><span class="summary-emoji">🔄</span> Patterns</h3>
							<p class="summary-detail">{patterns.length} {patterns.length === 1 ? 'entry' : 'entries'}{#if patterns.some(p => p.tags && p.tags.length > 0)} — tags: {[...new Set(patterns.flatMap(p => p.tags || []))].join(', ')}{/if}</p>
						</div>
					{/if}
					{#if strengths.length > 0}
						<div class="summary-card summary-strengths">
							<h3 class="summary-title"><span class="summary-emoji">💪</span> Strengths</h3>
							<p class="summary-detail">{strengths.map(s => s.text).join(', ')}</p>
						</div>
					{/if}

					<div class="intention-group">
						<label class="intention-label">One small thing to work on</label>
						<textarea
							class="entry-textarea"
							rows={2}
							placeholder="One small step I can take..."
							bind:value={intention}
						></textarea>
					</div>

					<div class="ember-celebration">
						<p class="celebration-text">That took courage. I'm really proud of you. 🧡</p>
					</div>

					<button class="complete-btn" onclick={completeInventory}>
						Complete Inventory
					</button>
				{/if}
				</div>
			{/if}
		</div>
		{/key}

		<!-- Navigation -->
		<div class="nav-row">
			<div class="nav-left">
				{#if currentSection > 0}
					<button class="nav-btn back-btn" onclick={prevSection}>← Back</button>
				{:else}
					<div></div>
				{/if}
			</div>

			<div class="nav-center">
				{#if currentSection < 4}
					<button class="skip-link" onclick={skipSection}>Skip</button>
				{/if}
			</div>

			<div class="nav-right">
				{#if currentSection < sections.length - 1}
					<button class="nav-btn next-btn" onclick={nextSection}>Next →</button>
				{:else}
					<button class="nav-btn finish-btn" onclick={close}>Done ✨</button>
				{/if}
			</div>
		</div>
	</div>
	{/if}
</div>
{/if}

<style>
	/* ─── Overlay ─── */
	.inventory-overlay {
		position: fixed;
		inset: 0;
		z-index: 50;
		background: #F5EBD8;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		overflow-y: auto;
	}

	/* ─── Close Button ─── */
	.close-btn {
		position: fixed;
		top: 16px;
		right: 16px;
		z-index: 51;
		background: rgba(92, 77, 60, 0.08);
		border: none;
		border-radius: 50%;
		width: 44px;
		height: 44px;
		font-size: 18px;
		color: #5C4D3C;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.2s ease;
	}
	.close-btn:hover {
		background: rgba(92, 77, 60, 0.14);
	}

	/* ─── Progress Dots ─── */
	.progress-dots {
		position: fixed;
		top: 24px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 12px;
		z-index: 51;
	}

	.dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: rgba(92, 77, 60, 0.15);
		border: 1.5px solid rgba(92, 77, 60, 0.1);
		transition: all 0.3s ease;
	}

	.dot.active {
		background: #E8945A;
		border-color: #E8945A;
		transform: scale(1.3);
		box-shadow: 0 0 8px rgba(232, 148, 90, 0.4);
	}

	.dot.completed {
		background: #98BF82;
		border-color: #98BF82;
	}

	/* ─── Content ─── */
	.inventory-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24px;
		padding: 64px 24px 0;
		padding-bottom: max(32px, env(safe-area-inset-bottom));
		max-width: 480px;
		width: 100%;
		min-height: 100dvh;
	}

	.section-screen {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
		width: 100%;
	}

	/* ─── Section Title ─── */
	.section-title {
		font-family: 'Fraunces', Georgia, serif;
		font-size: 1.5rem;
		font-weight: 700;
		color: #5C4D3C;
		text-align: center;
		letter-spacing: -0.02em;
		line-height: 1.3;
	}

	/* ─── Ember Speech Bubble ─── */
	.ember-bubble {
		display: flex;
		gap: 10px;
		align-items: flex-start;
		width: 100%;
	}

	.ember-icon {
		font-size: 1.2rem;
		flex-shrink: 0;
		margin-top: 8px;
	}

	.ember-speech {
		position: relative;
		background: rgba(255, 255, 255, 0.6);
		border-radius: 16px;
		padding: 12px 16px;
		flex: 1;
	}

	.ember-text {
		font-family: 'Fraunces', Georgia, serif;
		font-size: 0.9rem;
		font-style: italic;
		color: #5C4D3C;
		line-height: 1.5;
		margin: 0;
	}

	.ember-pointer {
		position: absolute;
		left: -6px;
		top: 14px;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-right: 6px solid rgba(255, 255, 255, 0.6);
	}

	/* ─── Section Placeholder ─── */
	.section-placeholder {
		width: 100%;
		background: rgba(255, 255, 255, 0.4);
		border: 1.5px dashed rgba(92, 77, 60, 0.15);
		border-radius: 16px;
		padding: 40px 24px;
		text-align: center;
		min-height: 200px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.placeholder-text {
		font-size: 0.9rem;
		color: rgba(92, 77, 60, 0.4);
		font-style: italic;
		margin: 0;
	}

	/* ─── Navigation ─── */
	.nav-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		margin-top: auto;
		padding-top: 16px;
	}

	.nav-left,
	.nav-center,
	.nav-right {
		flex: 1;
		display: flex;
	}

	.nav-left {
		justify-content: flex-start;
	}

	.nav-center {
		justify-content: center;
	}

	.nav-right {
		justify-content: flex-end;
	}

	.nav-btn {
		border: none;
		border-radius: 14px;
		padding: 12px 24px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
	}

	.back-btn {
		background: transparent;
		color: #5C4D3C;
	}
	.back-btn:hover {
		background: rgba(92, 77, 60, 0.06);
	}

	.next-btn {
		background: #E8945A;
		color: white;
	}
	.next-btn:hover {
		background: #D4824E;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(232, 148, 90, 0.3);
	}

	.finish-btn {
		background: #98BF82;
		color: #3A5A28;
	}
	.finish-btn:hover {
		background: #89B071;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(152, 191, 130, 0.3);
	}

	.skip-link {
		background: none;
		border: none;
		color: rgba(92, 77, 60, 0.4);
		font-size: 0.8rem;
		font-weight: 500;
		cursor: pointer;
		padding: 12px 16px;
		min-height: 44px;
		transition: color 0.2s ease;
		text-decoration: underline;
		text-decoration-color: rgba(92, 77, 60, 0.2);
		text-underline-offset: 2px;
	}
	.skip-link:hover {
		color: rgba(92, 77, 60, 0.65);
	}

	/* ─── Section Body ─── */
	.section-body {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.section-intro {
		font-family: 'Fraunces', Georgia, serif;
		color: rgba(92, 77, 60, 0.7);
		font-size: 0.85rem;
		font-style: italic;
		margin: 0;
		line-height: 1.5;
	}

	.entry-textarea {
		width: 100%;
		border: 1.5px solid rgba(92, 77, 60, 0.15);
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.5);
		padding: 12px 14px;
		font-family: inherit;
		font-size: 0.9rem;
		color: #5C4D3C;
		resize: vertical;
		transition: border-color 0.2s ease;
		line-height: 1.5;
	}
	.entry-textarea:focus {
		outline: none;
		border-color: rgba(92, 77, 60, 0.35);
	}
	.entry-textarea::placeholder {
		color: rgba(92, 77, 60, 0.35);
	}

	.add-entry-btn {
		align-self: flex-start;
		border: none;
		border-radius: 12px;
		padding: 10px 20px;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		background: #E8945A;
		color: white;
		transition: all 0.2s ease;
		font-family: inherit;
	}
	.add-entry-btn:hover:not(:disabled) {
		background: #D4824E;
		transform: translateY(-1px);
	}
	.add-entry-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	/* ─── Tag Chips (Patterns) ─── */
	.tag-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.tag-chip {
		border-radius: 9999px;
		padding: 8px 14px;
		min-height: 44px;
		font-size: 0.85rem;
		border: 1.5px solid rgba(92, 77, 60, 0.2);
		color: rgba(92, 77, 60, 0.6);
		background: rgba(255, 255, 255, 0.3);
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
	}
	.tag-chip:hover {
		border-color: rgba(92, 77, 60, 0.35);
	}
	.tag-chip.selected {
		background: rgba(183, 169, 214, 0.4);
		border-color: #B7A9D6;
		color: #5C4D3C;
	}

	/* ─── Suggestion Chips (Strengths) ─── */
	.suggestion-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.suggestion-chip {
		border-radius: 9999px;
		padding: 8px 14px;
		min-height: 44px;
		font-size: 0.85rem;
		background: rgba(152, 191, 130, 0.2);
		border: 1px solid rgba(152, 191, 130, 0.3);
		color: #5C4D3C;
		cursor: pointer;
		transition: all 0.2s ease;
		font-family: inherit;
	}
	.suggestion-chip:hover {
		background: rgba(152, 191, 130, 0.4);
	}
	.suggestion-chip.selected {
		background: rgba(152, 191, 130, 0.5);
		border-color: #98BF82;
	}

	/* ─── Entry List ─── */
	.entry-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: 100%;
	}

	.entry-card {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		background: rgba(255, 255, 255, 0.45);
		border-radius: 14px;
		padding: 12px 14px;
	}

	.entry-card.strength-card {
		background: rgba(152, 191, 130, 0.1);
	}

	.entry-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.entry-text {
		margin: 0;
		font-size: 0.88rem;
		color: #5C4D3C;
		line-height: 1.5;
		flex: 1;
	}

	.entry-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}

	.entry-tag-badge {
		border-radius: 9999px;
		background: rgba(183, 169, 214, 0.2);
		padding: 2px 8px;
		font-size: 0.72rem;
		color: rgba(92, 77, 60, 0.7);
	}

	.delete-entry-btn {
		flex-shrink: 0;
		border: none;
		background: none;
		color: rgba(92, 77, 60, 0.25);
		font-size: 0.75rem;
		cursor: pointer;
		min-width: 44px;
		min-height: 44px;
		padding: 10px;
		border-radius: 6px;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.delete-entry-btn:hover {
		color: rgba(92, 77, 60, 0.6);
		background: rgba(92, 77, 60, 0.06);
	}

	/* ─── Input Group & Voice ─── */
	.input-group {
		width: 100%;
	}

	.input-actions {
		display: flex;
		gap: 8px;
		margin-top: 8px;
		justify-content: flex-end;
	}

	.voice-btn {
		width: 44px;
		height: 44px;
		border: 1.5px solid rgba(92, 77, 60, 0.15);
		background: rgba(255, 255, 255, 0.5);
		border-radius: 50%;
		font-size: 1.2rem;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
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

	/* ─── Detail Toggle / Accordion ─── */
	.detail-toggle {
		display: flex;
		align-items: center;
		gap: 6px;
		border: none;
		background: none;
		font-family: inherit;
		font-size: 0.82rem;
		color: rgba(92, 77, 60, 0.5);
		cursor: pointer;
		padding: 4px 0;
		transition: color 0.2s ease;
	}
	.detail-toggle:hover {
		color: #5C4D3C;
	}

	.toggle-arrow {
		display: inline-block;
		transition: transform 0.2s ease;
		font-size: 0.7rem;
	}
	.toggle-arrow.expanded {
		transform: rotate(90deg);
	}

	.detail-fields {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding-left: 12px;
		border-left: 2px solid rgba(92, 77, 60, 0.1);
		animation: slideRight 0.25s ease-out;
	}

	.field-label {
		font-family: inherit;
		font-size: 0.78rem;
		font-weight: 600;
		color: rgba(92, 77, 60, 0.55);
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.entry-input {
		width: 100%;
		padding: 10px 14px;
		border: 1.5px solid rgba(92, 77, 60, 0.15);
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.5);
		font-family: inherit;
		font-size: 0.9rem;
		color: #5C4D3C;
		outline: none;
		transition: border-color 0.2s ease;
		box-sizing: border-box;
	}
	.entry-input:focus {
		border-color: rgba(92, 77, 60, 0.35);
	}
	.entry-input::placeholder {
		color: rgba(92, 77, 60, 0.35);
	}

	.entry-textarea.small {
		font-size: 0.85rem;
		padding: 10px 12px;
	}

	.entry-detail {
		font-size: 0.75rem;
		color: rgba(92, 77, 60, 0.45);
		display: block;
	}

	/* ─── Animations ─── */
	.slide-in-right {
		animation: slideRight 0.35s ease-out;
	}
	@keyframes slideRight {
		from { opacity: 0; transform: translateY(12px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.slide-in-left {
		animation: slideLeft 0.35s ease-out;
	}
	@keyframes slideLeft {
		from { opacity: 0; transform: translateY(-12px); }
		to { opacity: 1; transform: translateY(0); }
	}

	/* ─── View Past Button ─── */
	.view-past-btn {
		position: fixed;
		top: 20px;
		left: 16px;
		z-index: 51;
		background: none;
		border: none;
		font-size: 0.78rem;
		color: rgba(92, 77, 60, 0.45);
		cursor: pointer;
		padding: 12px;
		min-height: 44px;
		text-decoration: underline;
		text-underline-offset: 2px;
		font-family: inherit;
	}
	.view-past-btn:hover {
		color: rgba(92, 77, 60, 0.7);
	}

	/* ─── Review Summary Cards ─── */
	.review-body {
		gap: 12px;
	}

	.summary-card {
		width: 100%;
		background: rgba(255, 255, 255, 0.45);
		border-radius: 14px;
		padding: 14px 16px;
	}

	.summary-title {
		font-family: 'Fraunces', Georgia, serif;
		font-size: 0.9rem;
		font-weight: 600;
		color: #5C4D3C;
		margin: 0 0 4px;
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.summary-emoji {
		font-style: normal;
	}

	.summary-detail {
		font-size: 0.82rem;
		color: rgba(92, 77, 60, 0.6);
		margin: 0;
		line-height: 1.5;
	}

	/* ─── Intention Group ─── */
	.intention-group {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.intention-label {
		font-family: 'Fraunces', Georgia, serif;
		font-size: 0.85rem;
		font-weight: 600;
		color: #5C4D3C;
	}

	/* ─── Celebration / Completion ─── */
	.ember-celebration {
		text-align: center;
		padding: 8px 0;
	}

	.celebration-text {
		font-family: 'Fraunces', Georgia, serif;
		font-size: 0.9rem;
		font-style: italic;
		color: rgba(92, 77, 60, 0.7);
		margin: 0;
	}

	.complete-btn {
		width: 100%;
		border: none;
		border-radius: 14px;
		padding: 14px 24px;
		font-size: 0.95rem;
		font-weight: 700;
		cursor: pointer;
		background: #98BF82;
		color: #3A5A28;
		transition: all 0.2s ease;
		font-family: inherit;
	}
	.complete-btn:hover {
		background: #89B071;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(152, 191, 130, 0.3);
	}

	.completion-animation {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16px;
		padding: 40px 0;
		animation: fadeIn 0.5s ease-out;
	}

	.completion-emoji {
		font-size: 3rem;
		animation: pulse-heart 1.5s ease-in-out infinite;
	}

	@keyframes pulse-heart {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.15); }
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(8px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.completion-text {
		font-family: 'Fraunces', Georgia, serif;
		font-size: 1rem;
		color: #5C4D3C;
		text-align: center;
		margin: 0;
	}

	/* ─── Empty Review ─── */
	.empty-review {
		width: 100%;
		padding: 24px 16px;
		text-align: center;
	}

	/* ─── History View ─── */
	.history-list {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.history-card {
		width: 100%;
		background: rgba(255, 255, 255, 0.45);
		border: 1px solid rgba(92, 77, 60, 0.08);
		border-radius: 14px;
		padding: 14px 16px;
		cursor: pointer;
		text-align: left;
		font-family: inherit;
		transition: background 0.2s ease;
	}
	.history-card:hover {
		background: rgba(255, 255, 255, 0.6);
	}

	.history-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.history-date {
		font-size: 0.85rem;
		font-weight: 600;
		color: #5C4D3C;
	}

	.history-arrow {
		font-size: 0.75rem;
		color: rgba(92, 77, 60, 0.4);
		transition: transform 0.2s ease;
		display: inline-block;
	}
	.history-arrow.expanded {
		transform: rotate(90deg);
	}

	.history-counts {
		display: flex;
		gap: 10px;
		margin-top: 6px;
	}

	.history-count {
		font-size: 0.78rem;
		color: rgba(92, 77, 60, 0.55);
	}

	.history-details {
		margin-top: 12px;
		padding-top: 12px;
		border-top: 1px solid rgba(92, 77, 60, 0.08);
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.history-section-title {
		font-size: 0.8rem;
		font-weight: 600;
		color: rgba(92, 77, 60, 0.6);
		margin: 0 0 4px;
	}

	.history-entry {
		font-size: 0.82rem;
		color: #5C4D3C;
		margin: 2px 0;
		line-height: 1.5;
	}

	.history-tags {
		font-size: 0.72rem;
		color: rgba(92, 77, 60, 0.45);
	}

	.empty-history {
		padding: 40px 24px;
		text-align: center;
	}
</style>
