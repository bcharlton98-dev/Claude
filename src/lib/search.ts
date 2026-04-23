import type { AppState } from '../types';

export const MAX_SEARCH_RESULTS = 50;

export interface SearchResult {
  kind: 'transcript' | 'excerpt-memo' | 'transcript-memo' | 'code';
  id: string;
  transcriptId: string;
  transcriptTitle: string;
  snippet: string;
  matchStart: number;
}

const CONTEXT_CHARS = 40;

export function searchAll(state: AppState, query: string): SearchResult[] {
  if (!query.trim()) return [];

  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const t of Object.values(state.transcripts)) {
    if (results.length >= MAX_SEARCH_RESULTS) break;

    const lowerText = t.text.toLowerCase();
    let idx = lowerText.indexOf(q);
    while (idx !== -1 && results.length < MAX_SEARCH_RESULTS) {
      const contextStart = Math.max(0, idx - CONTEXT_CHARS);
      const contextEnd = Math.min(t.text.length, idx + query.length + CONTEXT_CHARS);
      results.push({
        kind: 'transcript',
        id: t.id,
        transcriptId: t.id,
        transcriptTitle: t.title,
        snippet: (contextStart > 0 ? '...' : '') +
          t.text.slice(contextStart, contextEnd) +
          (contextEnd < t.text.length ? '...' : ''),
        matchStart: idx,
      });
      idx = lowerText.indexOf(q, idx + 1);
    }

    if (t.memo && results.length < MAX_SEARCH_RESULTS) {
      const memoIdx = t.memo.toLowerCase().indexOf(q);
      if (memoIdx !== -1) {
        results.push({
          kind: 'transcript-memo',
          id: t.id,
          transcriptId: t.id,
          transcriptTitle: t.title,
          snippet: t.memo.slice(Math.max(0, memoIdx - CONTEXT_CHARS), memoIdx + query.length + CONTEXT_CHARS),
          matchStart: memoIdx,
        });
      }
    }
  }

  for (const code of Object.values(state.codes)) {
    if (results.length >= MAX_SEARCH_RESULTS) break;
    const nameMatch = code.name.toLowerCase().includes(q);
    const memoMatch = code.memo?.toLowerCase().includes(q);
    if (nameMatch || memoMatch) {
      results.push({
        kind: 'code',
        id: code.id,
        transcriptId: '',
        transcriptTitle: '',
        snippet: nameMatch ? code.name : (code.memo || '').slice(0, 80),
        matchStart: 0,
      });
    }
  }

  for (const ex of Object.values(state.excerpts)) {
    if (results.length >= MAX_SEARCH_RESULTS) break;
    if (!ex.memo) continue;

    const memoIdx = ex.memo.toLowerCase().indexOf(q);
    if (memoIdx !== -1) {
      const t = state.transcripts[ex.transcriptId];
      if (!t) continue;
      results.push({
        kind: 'excerpt-memo',
        id: ex.id,
        transcriptId: ex.transcriptId,
        transcriptTitle: t.title,
        snippet: ex.memo.slice(Math.max(0, memoIdx - CONTEXT_CHARS), memoIdx + query.length + CONTEXT_CHARS),
        matchStart: ex.start,
      });
    }
  }

  return results;
}
