import type { AppState } from '../types';
import { seed } from './seed';

const STORAGE_KEY = 'qual-coding-v1';

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed();
    const parsed = JSON.parse(raw);
    if (parsed.schemaVersion !== 1) return seed();
    return parsed as AppState;
  } catch {
    return seed();
  }
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

export function saveState(state: AppState): void {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }, 300);
}
