import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { Application, Job } from '@/lib/types';
import { REC_BADGE, REC_LABEL } from '@/lib/types';
import { listJobsByAgency } from '@/services/jobs';
import { listApplicationsByAgency } from '@/services/applications';
import { listCreditHistory } from '@/services/credits';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { formatRelative, scoreClass, cx } from '@/lib/util';

export default function AgencyDashboard() {
  const { agency } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [burn, setBurn] = useState<number>(0);

  useEffect(() => {
    if (!agency) return;
    listJobsByAgency(agency.id).then(setJobs).catch(() => setJobs([]));
    listApplicationsByAgency(agency.id).then(setApps).catch(() => setApps([]));
    listCreditHistory(agency.id, 200).then((tx) => {
      const since = Date.now() - 1000 * 60 * 60 * 24 * 30;
      const burn30 = tx
        .filter((t) => t.amount < 0 && (t.createdAt as unknown as number) >= since)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      setBurn(burn30);
    }).catch(() => setBurn(0));
  }, [agency]);

  const activeJobs = jobs.filter((j) => j.status === 'active').length;
  const totalApplicants = jobs.reduce((n, j) => n + (j.applicantCount || 0), 0) || apps.length;
  const runwayDays = burn > 0 && agency?.credits
    ? Math.round((agency.credits / (burn / 30)))
    : null;

  return (
    <div className="stack stack-5">
      <header className="row-between">
        <div>
          <h2>{agency?.name ?? 'Dashboard'}</h2>
          <div className="muted small">/{agency?.slug}</div>
        </div>
        <Link to="/jobs/new"><Button>+ New job</Button></Link>
      </header>

      <div className="grid-4">
        <div className="card metric">
          <div className="metric-n">{activeJobs}</div>
          <div className="metric-l">Active jobs</div>
        </div>
        <div className="card metric">
          <div className="metric-n">{totalApplicants}</div>
          <div className="metric-l">Total applicants</div>
        </div>
        <div className="card metric">
          <div className="metric-n">{agency?.credits ?? 0}</div>
          <div className="metric-l">Credits left</div>
        </div>
        <div className="card metric">
          <div className="metric-n">{runwayDays != null ? `${runwayDays}d` : '—'}</div>
          <div className="metric-l">Runway at current burn</div>
        </div>
      </div>

      <section className="card">
        <div className="row-between" style={{ marginBottom: 8 }}>
          <div className="lbl-sm">Active jobs</div>
          <Link to="/jobs" className="link small">View all →</Link>
        </div>
        {jobs.length === 0 ? (
          <EmptyState title="No jobs yet" cta={<Link to="/jobs/new"><Button>Create first job</Button></Link>} />
        ) : jobs.slice(0, 6).map((j) => (
          <Link to={`/jobs/${j.id}`} key={j.id} className="row row-hover">
            <div className="flex-1">
              <div style={{ fontWeight: 600 }}>{j.title}</div>
              <div className="muted tiny">
                {j.jobConfig?.location} · {j.applicantCount || 0} applicants · {j.interviewCount || 0} interviewed
              </div>
            </div>
            <Badge kind={j.status === 'active' ? 'success' : j.status === 'paused' ? 'warn' : 'neutral'}>{j.status}</Badge>
          </Link>
        ))}
      </section>

      <section className="card">
        <div className="row-between" style={{ marginBottom: 8 }}>
          <div className="lbl-sm">Recent candidates</div>
          <Link to="/pipeline" className="link small">View pipeline →</Link>
        </div>
        {apps.length === 0 ? (
          <EmptyState title="No candidates yet" hint="Share your branded job link to start collecting interviews." />
        ) : apps.slice(0, 8).map((a) => (
          <Link to={`/reports/${a.id}`} key={a.id} className="row row-hover">
            <Avatar name={a.candidateName} />
            <div className="flex-1">
              <div style={{ fontWeight: 600 }}>{a.candidateName}</div>
              <div className="muted tiny">{a.jobTitle} · {formatRelative(typeof a.createdAt === 'number' ? a.createdAt : Date.now())}</div>
            </div>
            {a.report?.overallScore != null ? (
              <>
                <span className={cx('score', `score-${scoreClass(a.report.overallScore)}`)}>{a.report.overallScore}</span>
                <Badge kind={REC_BADGE[a.report.recommendation]}>{REC_LABEL[a.report.recommendation]}</Badge>
              </>
            ) : (
              <Badge kind="neutral">Processing</Badge>
            )}
          </Link>
        ))}
      </section>
    </div>
  );
}

function EmptyState({ title, hint, cta }: { title: string; hint?: string; cta?: React.ReactNode }) {
  return (
    <div className="t-center stack stack-3" style={{ padding: '28px 16px' }}>
      <div style={{ fontWeight: 600 }}>{title}</div>
      {hint ? <div className="muted small">{hint}</div> : null}
      {cta}
    </div>
  );
}
