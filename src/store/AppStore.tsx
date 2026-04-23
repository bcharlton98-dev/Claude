import { createContext, useContext, useEffect, useReducer, useRef, useState, type Dispatch, type ReactNode } from 'react';
import type { AppState } from '../types';
import type { Action } from './actions';
import { reducer } from './reducer';
import { loadState, loadStateAsync, saveState, saveStateNow } from '../lib/storage';
import { isElectron, getElectronAPI } from '../lib/electronAPI';
import { exportExcerptsAsCsv } from '../lib/export';
import { seed } from '../lib/seed';

const StateCtx = createContext<AppState>(null!);
const DispatchCtx = createContext<Dispatch<Action>>(null!);

export function useAppState() {
  return useContext(StateCtx);
}

export function useDispatch() {
  return useContext(DispatchCtx);
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, loadState);
  const [ready, setReady] = useState(!isElectron());
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (isElectron()) {
      loadStateAsync().then(loaded => {
        dispatch({ type: 'state/hydrate', payload: loaded });
        setReady(true);
      });
    }
  }, []);

  useEffect(() => {
    if (ready) {
      saveState(state);
    }
  }, [state, ready]);

  // Register Electron menu listeners once, using stateRef to avoid stale closures
  useEffect(() => {
    if (!isElectron()) return;
    const api = getElectronAPI();

    const cleanups = [
      api.onMenuNewProject(() => {
        dispatch({ type: 'state/hydrate', payload: seed() });
      }),
      api.onMenuSave(() => {
        saveStateNow(stateRef.current);
      }),
      api.onMenuExportCsv(() => {
        const csv = exportExcerptsAsCsv(stateRef.current);
        const date = new Date().toISOString().slice(0, 10);
        api.exportCsv({ csv, defaultName: `qualcode-export-${date}.csv` });
      }),
      api.onProjectLoaded((data) => {
        dispatch({ type: 'state/hydrate', payload: data.state });
      }),
      api.onProjectSaveAs((projectPath) => {
        saveStateNow(stateRef.current, projectPath);
      }),
    ];

    return () => cleanups.forEach(fn => fn());
  }, []);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cream-50">
        <p className="text-warm-500 text-sm">Loading project...</p>
      </div>
    );
  }

  return (
    <StateCtx value={state}>
      <DispatchCtx value={dispatch}>
        {children}
      </DispatchCtx>
    </StateCtx>
  );
}
