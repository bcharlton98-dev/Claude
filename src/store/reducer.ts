import type { AppState, Code, ID } from '../types';
import type { Action } from './actions';
import { newId } from '../lib/ids';
import { seed } from '../lib/seed';

function wouldCreateCycle(codes: Record<ID, Code>, codeId: ID, newParentId: ID): boolean {
  let current: ID | null = newParentId;
  const visited = new Set<string>();
  while (current) {
    if (current === codeId) return true;
    if (visited.has(current)) return false;
    visited.add(current);
    current = codes[current]?.parentId ?? null;
  }
  return false;
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'transcript/create': {
      const id = newId();
      const now = Date.now();
      return {
        ...state,
        transcripts: {
          ...state.transcripts,
          [id]: {
            id,
            title: action.payload.title,
            text: action.payload.text,
            memo: '',
            tags: action.payload.tags ?? [],
            createdAt: now,
            updatedAt: now,
          },
        },
      };
    }

    case 'transcript/rename': {
      const t = state.transcripts[action.payload.id];
      if (!t) return state;
      return {
        ...state,
        transcripts: {
          ...state.transcripts,
          [t.id]: { ...t, title: action.payload.title, updatedAt: Date.now() },
        },
      };
    }

    case 'transcript/setMemo': {
      const t = state.transcripts[action.payload.id];
      if (!t) return state;
      return {
        ...state,
        transcripts: {
          ...state.transcripts,
          [t.id]: { ...t, memo: action.payload.memo, updatedAt: Date.now() },
        },
      };
    }

    case 'transcript/setTags': {
      const t = state.transcripts[action.payload.id];
      if (!t) return state;
      return {
        ...state,
        transcripts: {
          ...state.transcripts,
          [t.id]: { ...t, tags: action.payload.tags, updatedAt: Date.now() },
        },
      };
    }

    case 'transcript/delete': {
      const { [action.payload.id]: _, ...rest } = state.transcripts;
      const excerpts = { ...state.excerpts };
      for (const [eid, ex] of Object.entries(excerpts)) {
        if (ex.transcriptId === action.payload.id) {
          delete excerpts[eid];
        }
      }
      return { ...state, transcripts: rest, excerpts };
    }

    case 'code/create': {
      const id = newId();
      return {
        ...state,
        codes: {
          ...state.codes,
          [id]: {
            id,
            name: action.payload.name,
            color: action.payload.color,
            parentId: action.payload.parentId,
            memo: '',
            createdAt: Date.now(),
          },
        },
      };
    }

    case 'code/update': {
      const c = state.codes[action.payload.id];
      if (!c) return state;
      const patch = action.payload.patch;
      if (patch.parentId !== undefined) {
        if (patch.parentId === c.id) return state;
        if (patch.parentId && wouldCreateCycle(state.codes, c.id, patch.parentId)) return state;
      }
      return {
        ...state,
        codes: {
          ...state.codes,
          [c.id]: { ...c, ...patch },
        },
      };
    }

    case 'code/delete': {
      const codeId = action.payload.id;
      const deletedCode = state.codes[codeId];
      if (!deletedCode) return state;

      const { [codeId]: _, ...restCodes } = state.codes;

      for (const c of Object.values(restCodes)) {
        if (c.parentId === codeId) {
          restCodes[c.id] = { ...c, parentId: deletedCode.parentId };
        }
      }

      const excerpts = { ...state.excerpts };
      for (const [eid, ex] of Object.entries(excerpts)) {
        if (ex.codeIds.includes(codeId)) {
          const newCodeIds = ex.codeIds.filter(id => id !== codeId);
          if (newCodeIds.length === 0) {
            delete excerpts[eid];
          } else {
            excerpts[eid] = { ...ex, codeIds: newCodeIds };
          }
        }
      }

      return { ...state, codes: restCodes, excerpts };
    }

    case 'excerpt/create': {
      if (action.payload.start >= action.payload.end) return state;
      if (action.payload.codeIds.length === 0) return state;
      const id = newId();
      return {
        ...state,
        excerpts: {
          ...state.excerpts,
          [id]: {
            id,
            transcriptId: action.payload.transcriptId,
            start: action.payload.start,
            end: action.payload.end,
            codeIds: action.payload.codeIds,
            memo: '',
            createdAt: Date.now(),
          },
        },
      };
    }

    case 'excerpt/addCode': {
      const ex = state.excerpts[action.payload.id];
      if (!ex || ex.codeIds.includes(action.payload.codeId)) return state;
      return {
        ...state,
        excerpts: {
          ...state.excerpts,
          [ex.id]: { ...ex, codeIds: [...ex.codeIds, action.payload.codeId] },
        },
      };
    }

    case 'excerpt/removeCode': {
      const ex = state.excerpts[action.payload.id];
      if (!ex) return state;
      const newCodeIds = ex.codeIds.filter(id => id !== action.payload.codeId);
      if (newCodeIds.length === 0) {
        const { [ex.id]: _, ...rest } = state.excerpts;
        return { ...state, excerpts: rest };
      }
      return {
        ...state,
        excerpts: {
          ...state.excerpts,
          [ex.id]: { ...ex, codeIds: newCodeIds },
        },
      };
    }

    case 'excerpt/setMemo': {
      const ex = state.excerpts[action.payload.id];
      if (!ex) return state;
      return {
        ...state,
        excerpts: {
          ...state.excerpts,
          [ex.id]: { ...ex, memo: action.payload.memo },
        },
      };
    }

    case 'excerpt/delete': {
      const { [action.payload.id]: _, ...rest } = state.excerpts;
      return { ...state, excerpts: rest };
    }

    case 'state/hydrate': {
      const p = action.payload;
      return {
        transcripts: (typeof p.transcripts === 'object' && p.transcripts) ? p.transcripts : {},
        codes: (typeof p.codes === 'object' && p.codes) ? p.codes : {},
        excerpts: (typeof p.excerpts === 'object' && p.excerpts) ? p.excerpts : {},
        schemaVersion: 1,
      };
    }

    case 'state/resetToSeed':
      return seed();

    default:
      return state;
  }
}
