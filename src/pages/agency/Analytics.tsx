// ============================================================
// Analytics dashboard — hiring funnel, scores, credit spend
// ============================================================

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { listApplicationsByAgency } from '@/services/applications';
import { listJobsByAgency } from '@/services/jobs';
import { listCreditHistory } from '@/services/credits';
import type { Application, CreditTransaction, Job } from '@/lib/types';
import { REC_LABEL } from '@/lib/types';
import { scoreClass } from '@/lib/util';
import { cx } from '@/lib/util';

function Metric({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="card metric">
      <div className="metric-n">{value}</div>
      <div className="metric-l">{label}</div>
      {sub && <div className="muted tiny" style={{ marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div className="small muted" style={{ minWidth: 110, textAlign: 'right' }}>{label}</div>
      <div style={{ flex: 1, height: 10, borderRadius: 999, background: 'var(--border-soft)' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: color, transition: 'width 400ms ease' }} />
      </div>
      <div className="small mono" style={{ minWidth: 32, textAlign: 'right' }}>{value}</div>
    </div>
  );
}

export default function Analytics() {
  const { agency } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [txns, setTxns] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!agency) return;
    Promise.all([
      listApplicationsByAgency(agency.id),
      listJobsByAgency(agency.id),
      listCreditHistory(agency.id, 200),
    ]).then(([a, j, t]) => {
      setApps(a);
      setJobs(j);
      setTxns(t);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [agency]);

  const funnel = useMemo(() => {
    const total = apps.length;
    const interviewed = apps.filter((a) => ['interview_complete', 'under_review', 'approved', 'rejected'].includes(a.status)).length;
    const reviewed = apps.filter((a) => ['under_review', 'approved', 'rejected'].includes(a.status)).length;
    const approved = apps.filter((a) => a.status === 'approved').length;
    const rejected = apps.filter((a) => a.status === 'rejected').length;
    return { total, interviewed, reviewed, approved, rejected };
  }, [apps]);

  const recBreakdown = useMemo(() => {
    const counts: Record<string, number> = { strong_yes: 0, yes: 0, maybe: 0, no: 0 };
    for (const a of apps) {
      if (a.report?.recommendation) counts[a.report.recommendation] = (counts[a.report.recommendation] ?? 0) + 1;
    }
    return counts;
  }, [apps]);

  const avgScore = useMemo(() => {
    const scored = apps.filter((a) => a.report?.overallScore != null);
    if (!scored.length) return null;
    return Math.round(scored.reduce((s, a) => s + (a.report!.overallScore), 0) / scored.length);
  }, [apps]);

  const creditSpend = useMemo(() => {
    return Math.abs(txns.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0));
  }, [txns]);

  // Average score per job (top 5)
  const scoreByJob = useMemo(() => {
    const byJob: Record<string, { title: string; scores: number[] }> = {};
    for (const a of apps) {
      if (a.report?.overallScore == null) continue;
      if (!byJob[a.jobId]) byJob[a.jobId] = { title: a.jobTitle, scores: [] };
      byJob[a.jobId].scores.push(a.report.overallScore);
    }
    return Object.entries(byJob)
      .map(([id, { title, scores }]) => ({
        id,
        title,
        avg: Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
        count: scores.length,
      }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5);
  }, [apps]);

  const conversionRate = funnel.total > 0
    ? Math.round((funnel.approved / funnel.total) * 100)
    : 0;

  const REC_COLORS: Record<string, string> = {
    strong_yes: 'var(--success, #16a34a)',
    yes: 'var(--brand)',
    maybe: '#f59e0b',
    no: 'var(--danger, #dc2626)',
  };

  if (loading) return <div className="muted">Loading analytics…</div>;

  return (
    <div className="stack stack-5">
      <header>
        <h2>Analytics</h2>
        <div className="muted small">Across all jobs · {apps.length} total applicants</div>
      </header>

      {/* Top metrics */}
      <div className="grid-4">
        <Metric label="Total applicants" value={funnel.total} />
        <Metric label="Interviews completed" value={funnel.interviewed}
          sub={funnel.total ? `${Math.round((funnel.interviewed / funnel.total) * 100)}% show rate` : undefined} />
        <Metric label="Avg. score" value={avgScore ?? '—'} sub="across scored interviews" />
        <Metric label="Conversion rate" value={`${conversionRate}%`} sub={`${funnel.approved} approved`} />
      </div>

      {/* Hiring funnel */}
      <section className="card">
        <div className="lbl-sm" style={{ marginBottom: 14 }}>Hiring funnel</div>
        <div className="stack stack-3">
          <Bar label="Applied" value={funnel.total} max={funnel.total} color="var(--brand)" />
          <Bar label="Interviewed" value={funnel.interviewed} max={funnel.total} color="#60a5fa" />
          <Bar label="Under review" value={funnel.reviewed} max={funnel.total} color="#f59e0b" />
          <Bar label="Approved" value={funnel.approved} max={funnel.total} color="var(--success, #16a34a)" />
          <Bar label="Rejected" value={funnel.rejected} max={funnel.total} color="var(--danger, #dc2626)" />
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recommendation breakdown */}
        <section className="card">
          <div className="lbl-sm" style={{ marginBottom: 14 }}>AI recommendations</div>
          <div className="stack stack-3">
            {Object.entries(recBreakdown).map(([rec, count]) => (
              <Bar
                key={rec}
                label={REC_LABEL[rec as keyof typeof REC_LABEL] ?? rec}
                value={count}
                max={Math.max(1, ...Object.values(recBreakdown))}
                color={REC_COLORS[rec] ?? 'var(--brand)'}
              />
            ))}
          </div>
          {Object.values(recBreakdown).every((v) => v === 0) && (
            <div className="muted small t-center" style={{ padding: '12px 0' }}>No scored interviews yet</div>
          )}
        </section>

        {/* Credit spend */}
        <section className="card">
          <div className="lbl-sm">Credit overview</div>
          <div className="stack stack-2" style={{ marginTop: 14 }}>
            <div className="row-between">
              <span className="small muted">Balance</span>
              <span className="mono" style={{ fontWeight: 700, color: (agency?.credits ?? 0) < 15 ? 'var(--danger)' : 'inherit' }}>
                {agency?.credits ?? 0}
              </span>
            </div>
            <div className="row-between">
              <span className="small muted">Total spent (all time)</span>
              <span className="mono">{creditSpend}</span>
            </div>
            <div className="row-between">
              <span className="small muted">Job postings</span>
              <span className="mono">{jobs.length}</span>
            </div>
            <div className="row-between">
              <span className="small muted">Interviews run</span>
              <span className="mono">{funnel.interviewed}</span>
            </div>
            <div className="row-between">
              <span className="small muted">Approvals sent</span>
              <span className="mono">{funnel.approved}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Score by job */}
      {scoreByJob.length > 0 && (
        <section className="card">
          <div className="lbl-sm" style={{ marginBottom: 14 }}>Average score by job (top 5)</div>
          <div className="stack stack-2">
            {scoreByJob.map((j) => (
              <div key={j.id} className="row-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-soft)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{j.title}</div>
                  <div className="muted tiny">{j.count} scored interview{j.count !== 1 ? 's' : ''}</div>
                </div>
                <span className={cx('score', `score-${scoreClass(j.avg)}`)}>{j.avg}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {apps.length === 0 && (
        <div className="card t-center muted small" style={{ padding: 40 }}>
          No data yet — analytics will appear once candidates apply to your jobs.
        </div>
      )}
    </div>
  );
}
