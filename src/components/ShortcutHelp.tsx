// Keyboard shortcut cheatsheet — opened with "?" key
import { useEffect, useState } from 'react';

const SHORTCUTS = [
  { keys: ['J', 'K'], desc: 'Move up/down the pipeline' },
  { keys: ['A'], desc: 'Approve selected candidate' },
  { keys: ['R'], desc: 'Reject selected candidate' },
  { keys: ['X'], desc: 'Pick/unpick candidate for comparison' },
  { keys: ['C'], desc: 'Open side-by-side comparison' },
  { keys: ['?'], desc: 'Show this cheatsheet' },
];

export function ShortcutHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === '?') setOpen((v) => !v);
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 900,
      }}
      onClick={() => setOpen(false)}
    >
      <div
        className="card"
        style={{
          width: 360, maxWidth: '92vw', padding: 28,
          borderRadius: 16, boxShadow: 'var(--shadow-lg, 0 20px 60px rgba(0,0,0,0.2))',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="row-between" style={{ marginBottom: 20 }}>
          <div className="lbl-sm">Keyboard shortcuts</div>
          <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>✕</button>
        </div>
        <div className="stack stack-2">
          {SHORTCUTS.map((s) => (
            <div key={s.desc} className="row-between" style={{ padding: '6px 0', borderBottom: '1px solid var(--border-soft)' }}>
              <span className="small muted">{s.desc}</span>
              <span style={{ display: 'flex', gap: 4 }}>
                {s.keys.map((k) => (
                  <kbd key={k} style={{
                    padding: '2px 8px', borderRadius: 6,
                    background: 'var(--surface-2)', border: '1px solid var(--border-soft)',
                    fontFamily: 'var(--font-mono, monospace)', fontSize: 12, fontWeight: 600,
                  }}>{k}</kbd>
                ))}
              </span>
            </div>
          ))}
        </div>
        <div className="muted tiny t-center" style={{ marginTop: 16 }}>Press <kbd style={{ fontSize: 11, padding: '1px 5px', borderRadius: 4, border: '1px solid var(--border-soft)', background: 'var(--surface-2)' }}>?</kbd> or <kbd style={{ fontSize: 11, padding: '1px 5px', borderRadius: 4, border: '1px solid var(--border-soft)', background: 'var(--surface-2)' }}>Esc</kbd> to close</div>
      </div>
    </div>
  );
}
