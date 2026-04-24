import type { AppState, Code, CodeColorKey, DescriptorField, ID } from '../types';

export type Action =
  | { type: 'transcript/create'; payload: { title: string; text: string; tags?: string[]; descriptors?: DescriptorField[]; cohort?: string } }
  | { type: 'transcript/rename'; payload: { id: ID; title: string } }
  | { type: 'transcript/setMemo'; payload: { id: ID; memo: string } }
  | { type: 'transcript/setTags'; payload: { id: ID; tags: string[] } }
  | { type: 'transcript/setDescriptors'; payload: { id: ID; descriptors: DescriptorField[] } }
  | { type: 'transcript/setCohort'; payload: { id: ID; cohort: string } }
  | { type: 'transcript/delete'; payload: { id: ID } }
  | { type: 'code/create'; payload: { name: string; color: CodeColorKey; parentId: ID | null } }
  | { type: 'code/update'; payload: { id: ID; patch: Partial<Pick<Code, 'name' | 'color' | 'parentId' | 'memo'>> } }
  | { type: 'code/delete'; payload: { id: ID } }
  | { type: 'excerpt/create'; payload: { transcriptId: ID; start: number; end: number; codeIds: ID[] } }
  | { type: 'excerpt/addCode'; payload: { id: ID; codeId: ID } }
  | { type: 'excerpt/removeCode'; payload: { id: ID; codeId: ID } }
  | { type: 'excerpt/setMemo'; payload: { id: ID; memo: string } }
  | { type: 'excerpt/delete'; payload: { id: ID } }
  | { type: 'schema/addDescriptorKey'; payload: { key: string } }
  | { type: 'schema/removeDescriptorKey'; payload: { key: string } }
  | { type: 'template/save'; payload: { name: string } }
  | { type: 'template/apply'; payload: { templateId: ID } }
  | { type: 'template/delete'; payload: { id: ID } }
  | { type: 'state/hydrate'; payload: AppState }
  | { type: 'state/resetToSeed' };
