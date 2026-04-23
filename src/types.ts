export type ID = string;

export interface Transcript {
  id: ID;
  title: string;
  text: string;
  memo: string;
  createdAt: number;
  updatedAt: number;
}

export interface Code {
  id: ID;
  name: string;
  color: CodeColorKey;
  parentId: ID | null;
  memo: string;
  createdAt: number;
}

export interface Excerpt {
  id: ID;
  transcriptId: ID;
  start: number;
  end: number;
  codeIds: ID[];
  memo: string;
  createdAt: number;
}

export interface AppState {
  transcripts: Record<ID, Transcript>;
  codes: Record<ID, Code>;
  excerpts: Record<ID, Excerpt>;
  schemaVersion: 1;
}

export const CODE_COLORS = [
  'forest', 'olive', 'ember', 'gold',
  'sky', 'rose', 'lavender', 'peach',
] as const;

export type CodeColorKey = typeof CODE_COLORS[number];
