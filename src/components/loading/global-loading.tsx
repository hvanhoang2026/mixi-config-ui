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
import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { FadeLoader } from 'react-spinners';

interface GlobalLoadingContextValue {
  show: () => () => void;
}

const GlobalLoadingContext = createContext<GlobalLoadingContextValue | null>(null);
const SPINNER_DELAY_MS = 150;

export function GlobalLoadingProvider({ children }: { children: ReactNode }) {
  const fetchingCount = useIsFetching();
  const mutatingCount = useIsMutating();
  const [manualCount, setManualCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const loading = fetchingCount + mutatingCount + manualCount > 0;

  useEffect(() => {
    if (!loading) {
      setVisible(false);
      return;
    }

    const timer = window.setTimeout(() => setVisible(true), SPINNER_DELAY_MS);
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
        <div className="global-loading" role="status" aria-live="polite" aria-label="Loading">
          <div className="global-loading__panel">
            <div className="global-loading__loader" aria-hidden="true">
              <FadeLoader
                color="#2563eb"
                height={10}
                width={4}
                radius={3}
                margin={-3}
                speedMultiplier={1.05}
              />
            </div>
            <span>Loading...</span>
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
