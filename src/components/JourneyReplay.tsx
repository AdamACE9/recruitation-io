// ============================================================
// JourneyReplay — scrubbable interview timeline
// ============================================================
import { useMemo, useState } from 'react';
import type { JourneyEvent, SentimentSample } from '@/lib/types';

export function JourneyReplay({ events, sentiment }: { events: JourneyEvent[]; sentiment?: SentimentSample[] }) {
  const duration = events.length ? events[events.length - 1].t : 60;
  const [t, setT] = useState(0);
  const current = useMemo(() =>
    events.filter((e) => e.t <= t).slice(-4),
  [events, t]);

  const sentimentAt = useMemo(() => {
    if (!sentiment?.length) return null;
    const near = sentiment.reduce((best, s) => Math.abs(s.t - t) < Math.abs(best.t - t) ? s : best, sentiment[0]);
    return near;
  }, [sentiment, t]);

  return (
    <div className="stack stack-3">
      <div className="row-between" style={{ alignItems: 'flex-end' }}>
        <div>
          <div className="lbl-sm">Replay</div>
          <div className="muted tiny">Scrub through the interview. Events, sentiment, and scores replay in sync.</div>
        </div>
        <div className="mono small">{fmt(t)} / {fmt(duration)}</div>
      </div>

      <input
        type="range"
        min={0}
        max={duration}
        step={1}
        value={t}
        onChange={(e) => setT(parseInt(e.target.value, 10))}
        style={{ width: '100%', accentColor: 'var(--brand)' }}
      />

      {/* marker strip */}
      <div style={{ position: 'relative', height: 26, background: 'var(--surface-2)', borderRadius: 8 }}>
        {events.map((e, i) => (
          <span
            key={i}
            title={`${fmt(e.t)} — ${e.label}`}
            style={{
              position: 'absolute',
              left: `${(e.t / Math.max(1, duration)) * 100}%`,
              top: 6,
              width: 10,
              height: 14,
              transform: 'translateX(-50%)',
              borderRadius: 3,
              background: markerColor(e.kind),
            }}
          />
        ))}
        <span
          style={{
            position: 'absolute',
            left: `${(t / Math.max(1, duration)) * 100}%`,
            top: 0, bottom: 0,
            width: 2,
            background: 'var(--brand)',
            transform: 'translateX(-50%)',
          }}
        />
      </div>

      <div className="row-flex small" style={{ gap: 12, flexWrap: 'wrap' }}>
        <MarkerLegend k="agent" />
        <MarkerLegend k="candidate" />
        <MarkerLegend k="flag" />
        <MarkerLegend k="test" />
        <MarkerLegend k="milestone" />
      </div>

      <div className="card" style={{ background: 'var(--surface-2)' }}>
        <div className="lbl-sm">At {fmt(t)}</div>
        <div className="stack stack-2" style={{ marginTop: 8 }}>
          {current.length === 0 && <div className="muted small">(before interview started)</div>}
          {current.map((e, i) => (
            <div key={i} className="row-flex" style={{ gap: 10, alignItems: 'flex-start' }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: markerColor(e.kind), marginTop: 6 }} />
              <div className="small">
                <div><span className="mono tiny muted">{fmt(e.t)}</span> · <strong>{e.label}</strong></div>
                {e.detail && <div className="muted tiny" style={{ marginTop: 2 }}>{e.detail}</div>}
              </div>
            </div>
          ))}
          {sentimentAt && (
            <div className="row-flex small" style={{ gap: 16, marginTop: 6, paddingTop: 10, borderTop: '1px solid var(--border-soft)' }}>
              <div><span className="muted tiny">Energy</span> <strong>{sentimentAt.energy}</strong></div>
              <div><span className="muted tiny">Confidence</span> <strong>{sentimentAt.confidence}</strong></div>
              <div><span className="muted tiny">Stress</span> <strong>{sentimentAt.stress}</strong></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function markerColor(k: JourneyEvent['kind']): string {
  return {
    agent: '#1a56a0',
    candidate: 'var(--brand)',
    flag: '#c83a3a',
    test: '#92500a',
    milestone: '#6b7c75',
  }[k];
}

function MarkerLegend({ k }: { k: JourneyEvent['kind'] }) {
  return (
    <span className="row-flex" style={{ gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: markerColor(k) }} />
      <span className="muted tiny" style={{ textTransform: 'capitalize' }}>{k}</span>
    </span>
  );
}

function fmt(t: number) {
  const m = Math.floor(t / 60);
  const s = Math.round(t % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
