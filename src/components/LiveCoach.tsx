// ============================================================
// LiveCoach — AI co-pilot sidebar during live interviews
// ============================================================
import type { CoachHint } from '@/lib/features';
import { Badge } from '@/components/ui/Badge';

export function LiveCoach({ hints }: { hints: CoachHint[] }) {
  return (
    <div className="card" style={{ background: 'linear-gradient(180deg, var(--brand-50), var(--surface))' }}>
      <div className="row-between">
        <div>
          <div className="lbl-sm" style={{ margin: 0 }}>AI Coach</div>
          <div className="muted tiny" style={{ marginTop: 2 }}>Live suggestions · updates every turn</div>
        </div>
        <Badge kind="info">BETA</Badge>
      </div>
      <div className="stack stack-2" style={{ marginTop: 12 }}>
        {hints.length === 0 && (
          <div className="muted small">Listening… I'll nudge you with follow-ups and flag patterns as the conversation develops.</div>
        )}
        {hints.map((h, i) => (
          <div key={i} className="row-flex" style={{
            gap: 8, padding: '8px 10px', borderRadius: 8,
            background: kindBg(h.kind),
            border: `1px solid ${kindBorder(h.kind)}`,
            alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 14 }}>{kindIcon(h.kind)}</span>
            <div className="small" style={{ lineHeight: 1.45 }}>{h.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function kindIcon(k: CoachHint['kind']) {
  return { 'follow-up': '💬', strength: '✨', concern: '⚠️', topic: '📌' }[k];
}
function kindBg(k: CoachHint['kind']) {
  return {
    'follow-up': 'var(--info-bg)',
    strength: 'var(--success-bg)',
    concern: 'var(--warn-bg)',
    topic: 'var(--surface-2)',
  }[k];
}
function kindBorder(k: CoachHint['kind']) {
  return {
    'follow-up': '#cfe0f5',
    strength: '#c7e6d1',
    concern: '#fbe4be',
    topic: 'var(--border-soft)',
  }[k];
}
