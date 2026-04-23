// ============================================================
// Branded apply page — /[agencySlug]/[jobSlug]
//
// Flow:
//   1. Candidate clicks "Start interview" → we createApplication()
//      + fire prepareInterview() on Cloud Functions (Gemini → Groq → Google CSE)
//   2. We render a live status panel that listens to
//      applications/{id}.interviewPrep.status
//   3. When status === 'ready' → "Start interview" button unlocks and routes to /interview/:id
//   4. If status === 'failed' → offer retry
// ============================================================

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getAgencyBySlug } from '@/services/agencies';
import { listActiveJobsByAgency } from '@/services/jobs';
import {
  createApplication,
  prepareInterview,
  listenApplication,
} from '@/services/applications';
import { useAuth } from '@/contexts/AuthContext';
import { applyBrand } from '@/lib/theme';
import type { Agency, Application, InterviewPrepStatus, Job } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/lib/toast';

const STAGE_LABEL: Record<InterviewPrepStatus, string> = {
  pending: 'Queuing up…',
  extracting_cv: 'Reading your CV…',
  generating_questions: 'Drafting questions tailored to you…',
  finding_images: 'Finding reference images…',
  ready: 'Ready — your interview is set.',
  failed: 'Something went wrong while preparing your interview.',
};

const STAGE_PROGRESS: Record<InterviewPrepStatus, number> = {
  pending: 10,
  extracting_cv: 30,
  generating_questions: 60,
  finding_images: 85,
  ready: 100,
  failed: 100,
};

export default function Apply() {
  const { agencySlug, jobSlug } = useParams();
  const nav = useNavigate();
  const { candidate, role, user } = useAuth();
  const { toast } = useToast();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);

  // Application lifecycle state
  const [appId, setAppId] = useState<string | null>(null);
  const [prep, setPrep] = useState<Application['interviewPrep'] | null>(null);

  useEffect(() => {
    if (!agencySlug) return;
    getAgencyBySlug(agencySlug).then(async (a) => {
      if (!a) return;
      setAgency(a);
      applyBrand(a.brandColor);
      const jobs = await listActiveJobsByAgency(a.id);
      setJob(jobs.find((j) => j.slug === jobSlug) ?? null);
    });
  }, [agencySlug, jobSlug]);

  // Live-subscribe to the application doc once we have one — so prep.status updates in real time
  useEffect(() => {
    if (!appId) return;
    const unsub = listenApplication(appId, (a) => {
      if (a?.interviewPrep) setPrep(a.interviewPrep);
    });
    return unsub;
  }, [appId]);

  if (!agency) {
    return <div style={{ padding: 48 }} className="t-center muted">Agency not found.</div>;
  }
  if (!job) {
    return <div style={{ padding: 48 }} className="t-center muted">Role is no longer open.</div>;
  }

  async function startInterview() {
    if (!job) return;
    if (!user || role !== 'candidate' || !candidate) {
      nav(`/signup/candidate?next=${encodeURIComponent(location.pathname)}`);
      return;
    }
    setLoading(true);
    try {
      const app = await createApplication({
        agencyId: job.agencyId,
        jobId: job.id,
        jobTitle: job.title,
        candidateUid: candidate.uid,
        candidateName: candidate.name,
        candidateEmail: candidate.email,
        candidatePhone: candidate.phone,
        candidatePhotoUrl: candidate.photoUrl,
      });
      setAppId(app.id);
      setPrep({ status: 'pending', questions: [], updatedAt: Date.now() });
      // Fire-and-forget; status streams back via the listener above.
      // If the Cloud Function call itself errors before touching Firestore,
      // set local state to 'failed' so the UI doesn't stay stuck in "preparing".
      prepareInterview(app.id).catch((e) => {
        const msg = e instanceof Error ? e.message : 'Prep failed';
        toast(msg, 'danger');
        setPrep((prev) => prev ? { ...prev, status: 'failed', error: msg } : null);
      });
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Could not start', 'danger');
    } finally {
      setLoading(false);
    }
  }

  async function retryPrep() {
    if (!appId) return;
    setPrep({ status: 'pending', questions: [], updatedAt: Date.now() });
    try {
      await prepareInterview(appId);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Retry failed', 'danger');
    }
  }

  const status = prep?.status;
  const showPrep = !!appId;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="marketing-nav">
        <div className="marketing-nav-inner">
          <div className="row-flex">
            {agency.logoUrl && <img src={agency.logoUrl} alt={agency.name} style={{ height: 28, borderRadius: 6 }} />}
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{agency.name}</span>
          </div>
          {candidate ? (
            <Link to="/me" className="btn btn-secondary btn-sm">My applications</Link>
          ) : (
            <Link to={`/login/candidate?next=${encodeURIComponent(location.pathname)}`} className="btn btn-ghost btn-sm">
              Sign in
            </Link>
          )}
        </div>
      </div>

      <div className="container-narrow" style={{ paddingTop: 60, paddingBottom: 80 }}>
        <Badge kind="success">Now hiring</Badge>
        <h1 style={{ marginTop: 14, lineHeight: 1.1 }}>{job.title}</h1>
        <div className="muted" style={{ marginTop: 8, fontSize: 16 }}>
          {job.jobConfig.location} · {job.jobConfig.industry} · {job.jobConfig.workType}
        </div>

        <div className="card" style={{ marginTop: 28 }}>
          <p style={{ lineHeight: 1.7 }}>{job.jobConfig.description || 'Full description on request.'}</p>
          {job.jobConfig.qualifications && (
            <>
              <hr className="divider" />
              <div className="lbl-sm">Qualifications</div>
              <p style={{ marginTop: 6, lineHeight: 1.7 }}>{job.jobConfig.qualifications}</p>
            </>
          )}
          {job.jobConfig.experience && (
            <>
              <hr className="divider" />
              <div className="lbl-sm">Experience</div>
              <p style={{ marginTop: 6, lineHeight: 1.7 }}>{job.jobConfig.experience}</p>
            </>
          )}
          {job.jobConfig.salary && (
            <>
              <hr className="divider" />
              <div className="lbl-sm">Compensation</div>
              <p style={{ marginTop: 6 }}>{job.jobConfig.salary}</p>
            </>
          )}
        </div>

        {!showPrep && (
          <>
            <div className="card" style={{ marginTop: 20, background: 'var(--brand-50)', borderColor: 'transparent' }}>
              <div className="lbl-sm" style={{ color: 'var(--brand)' }}>What happens next</div>
              <ol style={{ marginTop: 10, paddingLeft: 20, lineHeight: 1.8 }}>
                <li>{candidate ? 'You already have an account' : 'Create a free candidate account (2 min)'}</li>
                <li>Upload your CV + LinkedIn PDF export</li>
                <li>We'll tailor your interview questions to your CV (~30 seconds)</li>
                <li>Voice interview in {job.jobConfig.language} — {job.jobConfig.duration} minutes</li>
              </ol>
            </div>

            <div style={{ marginTop: 30 }}>
              <Button size="lg" block loading={loading} onClick={startInterview}>
                {candidate ? 'Apply & prepare my interview' : 'Create account & prepare my interview'}
              </Button>
              <div className="muted tiny t-center" style={{ marginTop: 10 }}>
                By applying you consent to an AI-conducted voice interview. Transcripts are stored securely.
              </div>
            </div>
          </>
        )}

        {showPrep && (
          <div
            className="card"
            style={{
              marginTop: 28,
              background: status === 'ready' ? 'var(--success-bg, var(--brand-50))' : undefined,
              borderColor: status === 'ready' ? 'var(--brand)' : undefined,
            }}
          >
            <div className="row-between" style={{ alignItems: 'center' }}>
              <div className="lbl-sm">
                {status === 'ready'
                  ? '✅ Interview ready'
                  : status === 'failed'
                  ? '⚠️ Preparation failed'
                  : '🔧 Preparing your AI interview…'}
              </div>
              {status && status !== 'ready' && status !== 'failed' && (
                <Badge kind="info">{STAGE_PROGRESS[status]}%</Badge>
              )}
            </div>
            <div className="muted small" style={{ marginTop: 8 }}>
              {STAGE_LABEL[status ?? 'pending']}
            </div>
            <div
              style={{
                marginTop: 14,
                height: 6,
                borderRadius: 999,
                background: 'var(--border-soft, #e5e7eb)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${STAGE_PROGRESS[status ?? 'pending']}%`,
                  height: '100%',
                  background: status === 'failed' ? 'var(--danger, #dc2626)' : 'var(--brand)',
                  transition: 'width 300ms ease',
                }}
              />
            </div>
            {prep?.error && status === 'failed' && (
              <div className="mono tiny" style={{ marginTop: 10, color: 'var(--danger, #dc2626)' }}>
                {prep.error}
              </div>
            )}
            <div style={{ marginTop: 20 }}>
              {status === 'ready' ? (
                <Button size="lg" block onClick={() => appId && nav(`/interview/${appId}`)}>
                  Start interview →
                </Button>
              ) : status === 'failed' ? (
                <Button size="lg" block variant="secondary" onClick={retryPrep}>
                  Retry preparation
                </Button>
              ) : (
                <Button size="lg" block disabled>
                  Please wait — preparing…
                </Button>
              )}
            </div>
            <div className="muted tiny t-center" style={{ marginTop: 10 }}>
              You can safely leave this page — progress is saved in your portal.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
