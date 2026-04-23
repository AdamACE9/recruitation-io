// ============================================================
// Tiny toast store + provider
// ============================================================

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type Kind = 'default' | 'success' | 'danger' | 'warn';
interface Toast { id: string; kind: Kind; text: string }

interface Ctx {
  toast: (text: string, kind?: Kind) => void;
}

const ToastCtx = createContext<Ctx>({ toast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((text: string, kind: Kind = 'default') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  useEffect(() => {
    // expose globally for non-component code (e.g. services) to call
    (window as unknown as { __toast?: typeof push }).__toast = push;
  }, [push]);

  return (
    <ToastCtx.Provider value={{ toast: push }}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              'toast' +
              (t.kind === 'success' ? ' toast-success' : t.kind === 'danger' ? ' toast-danger' : t.kind === 'warn' ? ' toast-warn' : '')
            }
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() { return useContext(ToastCtx); }

/** Call from non-react code */
export function toastAnywhere(text: string, kind: Kind = 'default') {
  const fn = (window as unknown as { __toast?: (t: string, k?: Kind) => void }).__toast;
  if (fn) fn(text, kind);
}
