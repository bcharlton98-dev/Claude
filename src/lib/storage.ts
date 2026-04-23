import type { AppState } from '../types';
import { seed } from './seed';
import { isElectron, getElectronAPI } from './electronAPI';

const STORAGE_KEY = 'qual-coding-v1';

// Synchronous initial load — returns seed in Electron (real data loaded async)
export function loadState(): AppState {
  if (isElectron()) {
    return seed();
  }
  return browserLoad();
}

// Async load — used by Electron to read from disk
export async function loadStateAsync(): Promise<AppState> {
  if (isElectron()) {
    const result = await getElectronAPI().loadProject();
    if (result.success && result.state && result.state.schemaVersion === 1) {
      return result.state;
    }
    return seed();
  }
  return browserLoad();
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

export function saveState(state: AppState): void {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    if (isElectron()) {
      getElectronAPI()
        .saveProject({ state })
        .catch(e => console.error('Failed to save project:', e));
    } else {
      browserSave(state);
    }
  }, 300);
}

export function saveStateNow(state: AppState, projectPath?: string): Promise<{ success: boolean; path?: string }> {
  if (saveTimeout) { clearTimeout(saveTimeout); saveTimeout = null; }
  if (isElectron()) {
    return getElectronAPI().saveProject({ projectPath, state });
  }
  browserSave(state);
  return Promise.resolve({ success: true });
}

function browserLoad(): AppState {
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

function browserSave(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage:', e);
  }
}
