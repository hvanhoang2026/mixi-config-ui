'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useIsMutating } from '@tanstack/react-query';

interface GlobalLoadingContextValue {
  show: () => () => void;
}

const GlobalLoadingContext = createContext<GlobalLoadingContextValue | null>(null);
const LOADING_DELAY_MS = 150;

export function GlobalLoadingProvider({ children }: { children: ReactNode }) {
  const mutatingCount = useIsMutating();
  const [manualCount, setManualCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const loading = mutatingCount + manualCount > 0;

  useEffect(() => {
    if (!loading) {
      setVisible(false);
      return;
    }

    const timer = window.setTimeout(() => setVisible(true), LOADING_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [loading]);

  const show = useCallback(() => {
    let released = false;
    setManualCount((count) => count + 1);

    return () => {
      if (released) return;
      released = true;
      setManualCount((count) => Math.max(0, count - 1));
    };
  }, []);

  const value = useMemo<GlobalLoadingContextValue>(() => ({ show }), [show]);

  return (
    <GlobalLoadingContext.Provider value={value}>
      {children}
      {visible ? (
        <div data-testid="auto-global-loading-1-div" className="global-loading" role="status" aria-live="polite" aria-label="Loading">
          <div data-testid="auto-global-loading-2-div" className="global-loading__panel">
            <div data-testid="auto-global-loading-3-div" className="global-loading__loader" aria-hidden="true">
              <i className="pi pi-hourglass" />
            </div>
            <span data-testid="auto-global-loading-4-span">Loading...</span>
          </div>
        </div>
      ) : null}
    </GlobalLoadingContext.Provider>
  );
}

export function useGlobalLoading() {
  const context = useContext(GlobalLoadingContext);
  if (!context) {
    throw new Error('useGlobalLoading must be used within GlobalLoadingProvider');
  }
  return context;
}
