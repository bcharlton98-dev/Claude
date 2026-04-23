import { useMemo } from 'react';
import type { Code, Excerpt, ID } from '../types';
import { useAppState } from './AppStore';

export function useTranscript(id: ID) {
  const state = useAppState();
  return state.transcripts[id] ?? null;
}

export function useExcerptsForTranscript(transcriptId: ID): Excerpt[] {
  const state = useAppState();
  return useMemo(
    () =>
      Object.values(state.excerpts)
        .filter(e => e.transcriptId === transcriptId)
        .sort((a, b) => a.start - b.start),
    [state.excerpts, transcriptId],
  );
}

export interface CodeTreeNode {
  code: Code;
  children: CodeTreeNode[];
}

export function useCodesTree(): CodeTreeNode[] {
  const state = useAppState();
  return useMemo(() => {
    const codes = Object.values(state.codes);
    const childrenMap = new Map<string | 'root', Code[]>();
    childrenMap.set('root', []);

    for (const c of codes) {
      const key = c.parentId ?? 'root';
      if (!childrenMap.has(key)) childrenMap.set(key, []);
      childrenMap.get(key)!.push(c);
    }

    function buildTree(parentKey: string): CodeTreeNode[] {
      const children = childrenMap.get(parentKey) ?? [];
      return children
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(c => ({ code: c, children: buildTree(c.id) }));
    }

    return buildTree('root');
  }, [state.codes]);
}

export function useAllCodesList(): Code[] {
  const state = useAppState();
  return useMemo(
    () => Object.values(state.codes).sort((a, b) => a.name.localeCompare(b.name)),
    [state.codes],
  );
}

export function useCodeById(id: ID): Code | null {
  const state = useAppState();
  return state.codes[id] ?? null;
}

export function useExcerptCountForCode(codeId: ID): number {
  const state = useAppState();
  return useMemo(
    () => Object.values(state.excerpts).filter(e => e.codeIds.includes(codeId)).length,
    [state.excerpts, codeId],
  );
}

export function useExcerptsForCode(codeId: ID): Excerpt[] {
  const state = useAppState();
  return useMemo(
    () =>
      Object.values(state.excerpts)
        .filter(e => e.codeIds.includes(codeId))
        .sort((a, b) => {
          const tA = state.transcripts[a.transcriptId]?.title ?? '';
          const tB = state.transcripts[b.transcriptId]?.title ?? '';
          if (tA !== tB) return tA.localeCompare(tB);
          return a.start - b.start;
        }),
    [state.excerpts, state.transcripts, codeId],
  );
}
