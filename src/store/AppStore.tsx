import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react';
import type { AppState } from '../types';
import type { Action } from './actions';
import { reducer } from './reducer';
import { loadState, saveState } from '../lib/storage';

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

  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <StateCtx value={state}>
      <DispatchCtx value={dispatch}>
        {children}
      </DispatchCtx>
    </StateCtx>
  );
}
