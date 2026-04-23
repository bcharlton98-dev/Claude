import type { AppState } from '../types';

interface ElectronAPI {
  saveProject: (data: { projectPath?: string; state: AppState }) => Promise<{ success: boolean; path?: string; error?: string }>;
  loadProject: (projectPath?: string) => Promise<{ success: boolean; state: AppState | null; error?: string }>;
  exportCsv: (data: { csv: string; defaultName: string }) => Promise<{ success: boolean; path?: string; error?: string }>;
  getDefaultPath: () => Promise<string>;
  onMenuNewProject: (callback: () => void) => () => void;
  onMenuSave: (callback: () => void) => () => void;
  onMenuExportCsv: (callback: () => void) => () => void;
  onProjectLoaded: (callback: (data: { state: AppState; path: string }) => void) => () => void;
  onProjectSaveAs: (callback: (path: string) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export function isElectron(): boolean {
  return !!window.electronAPI;
}

export function getElectronAPI(): ElectronAPI {
  return window.electronAPI!;
}
