import type { ReactNode } from 'react';
import { useEffect } from 'react';

export function Modal({ open, onClose, children, title }: {
  open: boolean; onClose: () => void; title?: string; children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {title ? <h3 style={{ marginBottom: 16 }}>{title}</h3> : null}
        {children}
      </div>
    </div>
  );
}
