import type { AppState } from '../types';
import { seed } from './seed';
import { isElectron, getElectronAPI } from './electronAPI';
import { getProjectStorageKey } from '../pages/Dashboard';

let currentProjectId: string | null = null;

export function setCurrentProjectId(id: string | null) {
  currentProjectId = id;
}

export function getCurrentProjectId() {
  return currentProjectId;
}

function getStorageKey(): string {
  if (currentProjectId) return getProjectStorageKey(currentProjectId);
  return 'plenior-v1';
}

export function loadState(): AppState {
  if (isElectron()) {
    return seed();
  }
  return browserLoad();
}

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
    updateProjectTimestamp();
  }, 300);
}

export function saveStateNow(state: AppState, projectPath?: string): Promise<{ success: boolean; path?: string }> {
  if (saveTimeout) { clearTimeout(saveTimeout); saveTimeout = null; }
  if (isElectron()) {
    return getElectronAPI().saveProject({ projectPath, state });
  }
  browserSave(state);
  updateProjectTimestamp();
  return Promise.resolve({ success: true });
}

function browserLoad(): AppState {
  try {
    const raw = localStorage.getItem(getStorageKey());
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
    localStorage.setItem(getStorageKey(), JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage:', e);
  }
}

function updateProjectTimestamp() {
  if (!currentProjectId) return;
  try {
    const raw = localStorage.getItem('plenior-projects-index');
    if (!raw) return;
    const projects = JSON.parse(raw);
    const updated = projects.map((p: { id: string; updatedAt: number }) =>
      p.id === currentProjectId ? { ...p, updatedAt: Date.now() } : p,
    );
    localStorage.setItem('plenior-projects-index', JSON.stringify(updated));
  } catch {}
}
