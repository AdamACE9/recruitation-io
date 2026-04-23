// ============================================================
// Compare — side-by-side candidate matrix (up to 4 at once)
// ============================================================

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { listApplicationsByAgency } from '@/services/applications';
import type { Application } from '@/lib/types';
import { REC_BADGE, REC_LABEL } from '@/lib/types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cx, scoreClass } from '@/lib/util';

export default function Compare() {
  const { agency } = useAuth();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [apps, setApps] = useState<Application[]>([]);

  useEffect(() => {
    if (!agency) return;
    listApplicationsByAgency(agency.id).then(setApps);
  }, [agency]);

  const ids = useMemo(() => (params.get('ids') ?? '').split(',').filter(Boolean), [params]);
  const selected = useMemo(() => ids.map((i) => apps.find((a) => a.id === i)).filter(Boolean) as Application[], [ids, apps]);

  if (selected.length === 0) {
    return (
      <div className="stack stack-4">
        <h2>Compare candidates</h2>
        <div className="muted small">No candidates selected. Go to Pipeline, tick up to 4 candidates, and click "Compare".</div>
        <Link to="/pipeline" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Open Pipeline</Link>
      </div>
    );
  }

  const rowMetric = (label: string, getter: (a: Application) => number | string | null, fmt?: (v: any) => React.ReactNode) => (
    <tr>
      <td className="muted small" style={{ width: 170 }}>{label}</td>
      {selected.map((a) => {
        const v = getter(a);
        return (
          <td key={a.id} className="small" style={{ padding: 10 }}>
            {fmt ? fmt(v) : v ?? <span className="muted">—</span>}
          </td>
        );
      })}
    </tr>
  );

  // winner highlight — max of a numeric row
  const highlightRow = (label: string, getter: (a: Application) => number) => {
    const vals = selected.map(getter);
    const max = Math.max(...vals);
    return (
      <tr>
        <td className="muted small">{label}</td>
        {selected.map((a, i) => {
          const v = vals[i];
          const isWinner = v === max && max > 0;
          return (
            <td key={a.id} style={{ padding: 10 }}>
              <span className={cx('score', `score-${scoreClass(v)}`)} style={{ fontWeight: isWinner ? 800 : 500 }}>
                {v}
                {isWinner && <span className="muted tiny" style={{ marginLeft: 6 }}>👑</span>}
              </span>
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <div className="stack stack-5">
      <div className="row-between">
        <div>
          <h2>Compare candidates</h2>
          <div className="muted small">{selected.length} candidate{selected.length > 1 ? 's' : ''} · side-by-side</div>
        </div>
        <Button variant="secondary" onClick={() => nav('/pipeline')}>← Back to pipeline</Button>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
          <thead>
            <tr style={{ background: 'var(--surface-2)' }}>
              <th style={{ padding: 14, textAlign: 'left', width: 170 }}></th>
              {selected.map((a) => (
                <th key={a.id} style={{ padding: 14, textAlign: 'left', verticalAlign: 'top' }}>
                  <div className="row-flex" style={{ gap: 10, alignItems: 'flex-start' }}>
                    <Avatar name={a.candidateName} />
                    <div className="flex-1">
                      <Link to={`/reports/${a.id}`} style={{ fontWeight: 700, color: 'var(--ink)', textDecoration: 'none' }}>
                        {a.candidateName}
                      </Link>
                      <div className="muted tiny">{a.jobTitle}</div>
                      {a.report && (
                        <div className="row-flex" style={{ gap: 6, marginTop: 6 }}>
                          <Badge kind={REC_BADGE[a.report.recommendation]}>{REC_LABEL[a.report.recommendation]}</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {highlightRow('Overall score', (a) => a.report?.overallScore ?? 0)}
            {highlightRow('Qualification', (a) => a.report?.scores.qualification ?? 0)}
            {highlightRow('Communication', (a) => a.report?.scores.communication ?? 0)}
            {highlightRow('Confidence', (a) => a.report?.scores.confidence ?? 0)}
            {highlightRow('Role fit', (a) => a.report?.scores.roleFit ?? 0)}
            {rowMetric('Signal Score™', (a) => a.report?.signalScore ?? null, (v) => v != null ? <span className={`score score-${scoreClass(v)}`}>{v}</span> : <span className="muted">—</span>)}
            {rowMetric('Voice authenticity', (a) => a.report?.voiceAuthenticity ?? null, (v) => v != null ? <span className={`score score-${scoreClass(v)}`}>{v}</span> : <span className="muted">—</span>)}
            {rowMetric('Red flags', (a) => a.report?.redFlags.length ?? 0, (v) => v === 0 ? <span className="success small">None</span> : <span className="warn small">{v}</span>)}
            {rowMetric('Inconsistencies', (a) => a.report?.inconsistencies.length ?? 0, (v) => v === 0 ? <span className="success small">None</span> : <span className="danger small">{v}</span>)}
            {rowMetric('Tests passed', (a) => {
              const t = a.report?.testResults ?? [];
              if (t.length === 0) return '—';
              const pass = t.filter((x) => x.correct).length;
              return `${pass} / ${t.length}`;
            })}
            {rowMetric('Status', (a) => a.status, (v) => <Badge kind="neutral">{String(v).replace(/_/g, ' ')}</Badge>)}
            <tr>
              <td className="muted small" style={{ verticalAlign: 'top', padding: 14 }}>Summary</td>
              {selected.map((a) => (
                <td key={a.id} className="small" style={{ padding: 14, lineHeight: 1.55 }}>
                  {a.report?.summary ?? <span className="muted">No summary yet</span>}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="lbl-sm">Recommended action</div>
        <div className="small" style={{ marginTop: 8 }}>
          {recommendation(selected)}
        </div>
      </div>
    </div>
  );
}

function recommendation(apps: Application[]): string {
  if (apps.length < 2) return 'Pick at least 2 candidates to see a comparison.';
  const withReports = apps.filter((a) => a.report);
  if (withReports.length === 0) return 'Reports are still generating for these candidates.';
  const winner = [...withReports].sort((a, b) => (b.report!.overallScore - a.report!.overallScore))[0];
  const runnerUp = [...withReports].sort((a, b) => (b.report!.overallScore - a.report!.overallScore))[1];
  const delta = runnerUp ? winner.report!.overallScore - runnerUp.report!.overallScore : 100;
  if (delta >= 10) return `${winner.candidateName} is a clear leader (${delta}-point gap). Move forward with them.`;
  if (delta >= 4) return `${winner.candidateName} is ahead, but ${runnerUp?.candidateName} is close. Consider a second conversation with both.`;
  return `Very close race between ${withReports.map((a) => a.candidateName).join(', ')}. Bring your top 2 to a human round.`;
}
