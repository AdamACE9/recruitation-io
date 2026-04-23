import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJob, listTestQuestions, setJobStatus } from '@/services/jobs';
import { listApplicationsByJob } from '@/services/applications';
import type { Application, Job, TestQuestion } from '@/lib/types';
import { REC_BADGE, REC_LABEL } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { cx, formatRelative, scoreClass } from '@/lib/util';
import { useToast } from '@/lib/toast';
import { ShareModal } from '@/components/ShareModal';

export default function JobDetail() {
  const { id } = useParams();
  const { agency } = useAuth();
  const { toast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [apps, setApps] = useState<Application[]>([]);
  const [tests, setTests] = useState<TestQuestion[]>([]);
  const [shareOpen, setShareOpen] = useState(false);
  const link = job && agency ? `${location.origin}/${agency.slug}/${job.slug}` : '';

  useEffect(() => {
    if (!id) return;
    getJob(id).then(setJob);
    listApplicationsByJob(id).then(setApps);
    listTestQuestions(id).then(setTests);
  }, [id]);

  if (!job) return <div className="muted">Loading…</div>;

  async function toggleStatus() {
    if (!job) return;
    const next = job.status === 'active' ? 'paused' : 'active';
    await setJobStatus(job.id, next);
    setJob({ ...job, status: next });
    toast(next === 'paused' ? 'Paused' : 'Resumed', 'success');
  }

  async function copyLink() {
    await navigator.clipboard.writeText(link);
    toast('Link copied', 'success');
  }

  return (
    <div className="stack stack-5">
      <header className="row-between" style={{ alignItems: 'flex-start' }}>
        <div>
          <h2>{job.title}</h2>
          <div className="muted small">
            {job.jobConfig.location} · {job.jobConfig.industry} · {job.jobConfig.language}
          </div>
        </div>
        <div className="row-flex">
          <Badge kind={job.status === 'active' ? 'success' : job.status === 'paused' ? 'warn' : 'neutral'}>{job.status}</Badge>
          <Button variant="secondary" onClick={toggleStatus}>{job.status === 'active' ? 'Pause' : 'Resume'}</Button>
        </div>
      </header>

      <div className="card" style={{ background: 'var(--surface-2)' }}>
        <div className="row-between">
          <div>
            <div className="lbl-sm">Branded application link</div>
            <div className="mono" style={{ marginTop: 6, color: 'var(--brand)' }}>{link}</div>
          </div>
          <div className="row-flex">
            <Button variant="secondary" onClick={() => setShareOpen(true)}>Share</Button>
            <Button onClick={copyLink}>Copy link</Button>
          </div>
        </div>
      </div>

      {job && (
        <ShareModal
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          jobTitle={job.title}
          publicUrl={link}
          shortCode={job.shortCode}
        />
      )}

      <div className="grid-3">
        <div className="card metric"><div className="metric-n">{apps.length}</div><div className="metric-l">Applicants</div></div>
        <div className="card metric"><div className="metric-n">{apps.filter((a) => a.status === 'interview_complete' || a.report).length}</div><div className="metric-l">Interviews done</div></div>
        <div className="card metric"><div className="metric-n">{apps.filter((a) => a.status === 'approved').length}</div><div className="metric-l">Approved</div></div>
      </div>

      <section className="card">
        <div className="lbl-sm" style={{ marginBottom: 8 }}>Candidates</div>
        {apps.length === 0 ? (
          <div className="muted small" style={{ padding: 24, textAlign: 'center' }}>No applicants yet.</div>
        ) : [...apps].sort((a, b) => (b.report?.overallScore ?? -1) - (a.report?.overallScore ?? -1)).map((a) => (
          <Link key={a.id} to={`/reports/${a.id}`} className="row row-hover">
            <Avatar name={a.candidateName} />
            <div className="flex-1">
              <div style={{ fontWeight: 600 }}>{a.candidateName}</div>
              <div className="muted tiny">{formatRelative(typeof a.createdAt === 'number' ? a.createdAt : Date.now())}</div>
            </div>
            {a.report?.overallScore != null ? (
              <>
                <span className={cx('score', `score-${scoreClass(a.report.overallScore)}`)}>{a.report.overallScore}</span>
                <Badge kind={REC_BADGE[a.report.recommendation]}>{REC_LABEL[a.report.recommendation]}</Badge>
              </>
            ) : <Badge kind="neutral">{a.status.replace(/_/g, ' ')}</Badge>}
          </Link>
        ))}
      </section>

      <section className="card">
        <div className="lbl-sm">Example questions ({tests.length})</div>
        <div className="muted tiny" style={{ marginTop: 4 }}>
          Used as hints when the AI tailors questions to each candidate's CV.
        </div>
        <div className="stack stack-2" style={{ marginTop: 10 }}>
          {tests.map((t, i) => (
            <div key={t.id} className="qbox qbox-ok">
              <div style={{ fontWeight: 600, fontSize: 13 }}>Example {i + 1}: {t.question}</div>
              <div className="muted tiny">Ideal answer: {t.correctAnswer} {t.imageUrl ? '· with reference image' : ''}</div>
            </div>
          ))}
          {tests.length === 0 && <div className="muted small">No example questions provided.</div>}
        </div>
      </section>

      {job.handbookUrl && (
        <section className="card">
          <div className="lbl-sm">Handbook</div>
          <div className="muted tiny" style={{ marginTop: 4 }}>
            Sent to approved candidates automatically.
          </div>
          <div style={{ marginTop: 10 }}>
            <a
              href={job.handbookUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm"
            >
              📎 {job.handbookFileName ?? 'handbook.pdf'}
            </a>
          </div>
        </section>
      )}

      <section className="card">
        <div className="lbl-sm">Prompts</div>
        <div className="stack stack-3" style={{ marginTop: 10 }}>
          {job.jobConfig.customQuestions.length > 0 && (
            <div>
              <div className="tiny muted mono">Custom questions</div>
              {job.jobConfig.customQuestions.map((q, i) => <div key={i} className="qbox">{q}</div>)}
            </div>
          )}
          {job.jobConfig.redFlags.length > 0 && (
            <div>
              <div className="tiny muted mono">Red flag probes</div>
              {job.jobConfig.redFlags.map((q, i) => <div key={i} className="qbox qbox-flag">{q}</div>)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
