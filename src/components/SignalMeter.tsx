// ============================================================
// Signal Score™ — live confidence meter during interview
// Streams simple heuristic from transcript length + claude hints.
// ============================================================

import { useEffect, useMemo, useState } from 'react';

export function SignalMeter({ score = 0, live = false }: { score?: number; live?: boolean }) {
  // Animate slight jitter to feel alive.
  const [v, setV] = useState(score);
  useEffect(() => {
    setV(score);
  }, [score]);

  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => {
      setV((prev) => Math.max(10, Math.min(100, prev + (Math.random() - 0.5) * 6)));
    }, 900);
    return () => clearInterval(t);
  }, [live]);

  const bars = useMemo(() => Array.from({ length: 16 }, (_, i) => i), []);
  const active = Math.round((v / 100) * bars.length);

  return (
    <div className="row-flex" style={{ gap: 10 }}>
      <div className="signal" aria-label={`Signal score ${Math.round(v)}`}>
        {bars.map((i) => (
          <span
            key={i}
            style={{
              height: `${4 + (i / bars.length) * 14}px`,
              background: i < active ? 'var(--brand)' : 'var(--border)',
            }}
          />
        ))}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 12, color: 'var(--ink-muted)' }}>
        {Math.round(v)}<span style={{ opacity: 0.55 }}>/100</span>
      </div>
    </div>
  );
}
