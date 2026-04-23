// ============================================================
// SentimentChart — SVG time-series of energy / confidence / stress
// ============================================================
import type { SentimentSample } from '@/lib/types';

export function SentimentChart({ data, height = 160 }: { data: SentimentSample[]; height?: number }) {
  if (!data || data.length === 0) return <div className="muted small">No sentiment data captured.</div>;
  const w = 640;
  const h = height;
  const padL = 32, padR = 12, padT = 12, padB = 22;
  const maxT = data[data.length - 1].t || 1;
  const x = (t: number) => padL + ((w - padL - padR) * t) / maxT;
  const y = (v: number) => padT + (h - padT - padB) * (1 - v / 100);

  const line = (key: keyof Pick<SentimentSample, 'energy' | 'confidence' | 'stress'>) =>
    data.map((s, i) => `${i === 0 ? 'M' : 'L'}${x(s.t).toFixed(1)},${y(s[key]).toFixed(1)}`).join(' ');

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxWidth: '100%' }} preserveAspectRatio="none">
        {/* gridlines */}
        {[0, 25, 50, 75, 100].map((g) => (
          <line key={g} x1={padL} x2={w - padR} y1={y(g)} y2={y(g)} stroke="var(--border-soft)" />
        ))}
        {[0, 25, 50, 75, 100].map((g) => (
          <text key={g} x={padL - 6} y={y(g) + 4} fontSize="9" fill="var(--ink-subtle)" textAnchor="end">{g}</text>
        ))}
        {/* time ticks */}
        {Array.from({ length: 5 }).map((_, i) => {
          const t = (maxT / 4) * i;
          return <text key={i} x={x(t)} y={h - 6} fontSize="9" fill="var(--ink-subtle)" textAnchor="middle">{fmt(t)}</text>;
        })}
        <path d={line('energy')} stroke="#0b8db0" strokeWidth={2} fill="none" />
        <path d={line('confidence')} stroke="var(--brand)" strokeWidth={2} fill="none" />
        <path d={line('stress')} stroke="#c83a3a" strokeWidth={2} fill="none" />
      </svg>
      <div className="row-flex small" style={{ gap: 14, justifyContent: 'center', marginTop: 6 }}>
        <LegendDot c="#0b8db0" label="Energy" />
        <LegendDot c="var(--brand)" label="Confidence" />
        <LegendDot c="#c83a3a" label="Stress" />
      </div>
    </div>
  );
}

function LegendDot({ c, label }: { c: string; label: string }) {
  return (
    <span className="row-flex" style={{ gap: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: c, display: 'inline-block' }} />
      <span className="muted tiny">{label}</span>
    </span>
  );
}

function fmt(t: number) {
  const m = Math.floor(t / 60);
  const s = Math.round(t % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
