import type { AppState } from '../types';

export interface SearchResult {
  kind: 'transcript' | 'excerpt-memo' | 'transcript-memo';
  id: string;
  transcriptId: string;
  transcriptTitle: string;
  snippet: string;
  matchStart: number;
}

export function searchAll(state: AppState, query: string): SearchResult[] {
  if (!query.trim()) return [];

  const q = query.toLowerCase();
  const results: SearchResult[] = [];
  const MAX = 50;

  for (const t of Object.values(state.transcripts)) {
    if (results.length >= MAX) break;

    let idx = t.text.toLowerCase().indexOf(q);
    while (idx !== -1 && results.length < MAX) {
      const contextStart = Math.max(0, idx - 40);
      const contextEnd = Math.min(t.text.length, idx + query.length + 40);
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
      idx = t.text.toLowerCase().indexOf(q, idx + 1);
    }

    if (t.memo && results.length < MAX) {
      const memoIdx = t.memo.toLowerCase().indexOf(q);
      if (memoIdx !== -1) {
        results.push({
          kind: 'transcript-memo',
          id: t.id,
          transcriptId: t.id,
          transcriptTitle: t.title,
          snippet: t.memo.slice(Math.max(0, memoIdx - 40), memoIdx + query.length + 40),
          matchStart: memoIdx,
        });
      }
    }
  }

  for (const ex of Object.values(state.excerpts)) {
    if (results.length >= MAX) break;
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
        snippet: ex.memo.slice(Math.max(0, memoIdx - 40), memoIdx + query.length + 40),
        matchStart: ex.start,
      });
    }
  }

  return results;
}
