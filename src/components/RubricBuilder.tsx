// ============================================================
// RubricBuilder — let agencies define custom scoring axes
// ============================================================
import { useMemo } from 'react';
import type { RubricAxis } from '@/lib/types';
import { randomId } from '@/lib/util';
import { Button } from '@/components/ui/Button';

const DEFAULT: RubricAxis[] = [
  { id: 'qualification', label: 'Qualification', description: 'Degrees, certifications, relevant coursework', weight: 25 },
  { id: 'communication', label: 'Communication', description: 'Clarity, active listening, articulation', weight: 25 },
  { id: 'confidence', label: 'Confidence',     description: 'Composure, decisiveness under pressure', weight: 25 },
  { id: 'roleFit',       label: 'Role fit',     description: 'Alignment with the role description', weight: 25 },
];

export function RubricBuilder({ value, onChange }: {
  value: RubricAxis[] | undefined;
  onChange: (axes: RubricAxis[]) => void;
}) {
  const axes = value && value.length > 0 ? value : DEFAULT;
  const total = useMemo(() => axes.reduce((s, a) => s + (a.weight || 0), 0), [axes]);

  function update(i: number, patch: Partial<RubricAxis>) {
    const next = axes.map((a, idx) => idx === i ? { ...a, ...patch } : a);
    onChange(next);
  }
  function add() {
    onChange([...axes, { id: randomId(), label: 'New axis', description: '', weight: 0 }]);
  }
  function remove(i: number) {
    onChange(axes.filter((_, idx) => idx !== i));
  }
  function resetDefault() {
    onChange(DEFAULT);
  }
  function normalise() {
    if (total === 0) return onChange(DEFAULT);
    const factor = 100 / total;
    onChange(axes.map((a) => ({ ...a, weight: Math.round(a.weight * factor) })));
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= axes.length) return;
    const next = [...axes];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div className="stack stack-3">
      <div className="row-between">
        <div>
          <div className="lbl-sm">Custom rubric</div>
          <div className="muted tiny">Define how the AI scores this role. Weights must sum to 100.</div>
        </div>
        <div className="row-flex">
          <div className={total === 100 ? 'score score-ok' : 'score score-warn'} style={{ fontSize: 16 }}>{total}</div>
          <Button variant="ghost" size="sm" onClick={normalise} type="button">Normalise</Button>
          <Button variant="ghost" size="sm" onClick={resetDefault} type="button">Reset</Button>
        </div>
      </div>

      <div className="stack stack-2">
        {axes.map((a, i) => (
          <div key={a.id} className="card" style={{ padding: 12 }}>
            <div className="row-flex" style={{ gap: 10, alignItems: 'flex-start' }}>
              <div className="stack" style={{ gap: 2 }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => move(i, -1)} style={{ padding: '2px 6px' }}>▲</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => move(i, 1)} style={{ padding: '2px 6px' }}>▼</button>
              </div>
              <div className="flex-1 stack stack-2">
                <input
                  className="input"
                  value={a.label}
                  onChange={(e) => update(i, { label: e.target.value })}
                  placeholder="Axis label"
                />
                <input
                  className="input"
                  value={a.description ?? ''}
                  onChange={(e) => update(i, { description: e.target.value })}
                  placeholder="What does a high score on this axis look like?"
                />
                <div className="row-flex" style={{ gap: 10 }}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={a.weight}
                    onChange={(e) => update(i, { weight: parseInt(e.target.value, 10) })}
                    style={{ flex: 1, accentColor: 'var(--brand)' }}
                  />
                  <div className="mono small" style={{ width: 40, textAlign: 'right' }}>{a.weight}%</div>
                </div>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => remove(i)} title="Remove">✕</button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <Button variant="secondary" size="sm" type="button" onClick={add}>+ Add axis</Button>
      </div>
    </div>
  );
}
