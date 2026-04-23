// ============================================================
// AI report detail view
// Includes: Bias Shield · Sentiment timeline · Journey replay
// · Smart rejection composer · Custom rubric scores
// ============================================================

import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  getApplication, approveApplication, rejectApplication,
} from '@/services/applications';
import { getJob } from '@/services/jobs';
import type { Application, Job } from '@/lib/types';
import { REC_BADGE, REC_LABEL, CREDIT_COSTS } from '@/lib/types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cx, scoreClass } from '@/lib/util';
import { useToast } from '@/lib/toast';
import { SignalMeter } from '@/components/SignalMeter';
import { SentimentChart } from '@/components/SentimentChart';
import { JourneyReplay } from '@/components/JourneyReplay';
import { RejectionModal } from '@/components/RejectionModal';
import { redactForBlindReview, synthSentiment, synthJourneyEvents } from '@/lib/features';

export default function Report() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const nav = useNavigate();
  const [app, setApp] = useState<Application | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [blind, setBlind] = useState(false);
  const [showRejection, setShowRejection] = useState(false);
  const [biasRevealed, setBiasRevealed] = useState(false);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const a = await getApplication(id);
        if (!a) { setLoadErr('Application not found.'); return; }
        setApp(a);
        const j = await getJob(a.jobId).catch(() => null);
        if (j) setJob(j);
      } catch (e) {
        setLoadErr(e instanceof Error ? e.message : 'Failed to load report');
      }
    })();
  }, [id]);

  // derived: redacted view when blind mode is on
  const view = useMemo(() => (app && blind ? redactForBlindReview(app) : app), [app, blind]);

  // derived: sentiment + journey (from stored report or synth'd if missing)
  const duration = (job?.jobConfig.duration ?? 10) * 60;
  const sentiment = useMemo(() => {
    if (!app) return [];
    return app.report?.sentimentTimeline
      ?? synthSentiment(app.id, app.transcriptEnglish ?? app.transcriptOriginal ?? '', duration);
  }, [app, duration]);
  const journey = useMemo(() => {
    if (!app) return [];
    return app.report?.journeyEvents
      ?? synthJourneyEvents(app, app.transcriptEnglish ?? app.transcriptOriginal ?? '', duration);
  }, [app, duration]);

  if (loadErr) return <div className="muted" style={{ padding: 40, color: 'var(--danger)' }}>Error: {loadErr}</div>;
  if (!app || !view) return <div className="muted">Loading…</div>;
  const r = app.report;
  const score = r?.overallScore ?? 0;

  async function onApprove() {
    if (!app || !user) return;
    try {
      await approveApplication(app.id, user.uid);
      toast(`Approved — candidate notified · –${CREDIT_COSTS.approval} credits`, 'success');
      setApp({ ...app, status: 'approved', approvedAt: Date.now() });
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Approval failed', 'danger');
    }
  }
  async function onRejectConfirmed(message: string) {
    if (!app) return;
    await rejectApplication(app.id, message);
    toast('Rejection sent', 'warn');
    setApp({ ...app, status: 'rejected', rejectionMessage: message });
  }

  return (
    <div className="stack stack-5">
      <header className="row-between">
        <button className="link small" onClick={() => nav(-1)}>← Back</button>
        <div className="row-flex">
          <label className="row-flex small" style={{
            gap: 8, padding: '6px 10px', borderRadius: 999,
            background: blind ? 'var(--warn-bg)' : 'var(--surface-2)',
            border: `1px solid ${blind ? '#fbe4be' : 'var(--border-soft)'}`,
            cursor: 'pointer', userSelect: 'none',
          }}>
            <input
              type="checkbox"
              checked={blind}
              onChange={(e) => { setBlind(e.target.checked); if (!e.target.checked) setBiasRevealed(false); }}
              style={{ accentColor: 'var(--brand)' }}
            />
            <span>🎭 Bias Shield {blind ? 'ON' : 'OFF'}</span>
          </label>
          <Button variant="secondary" onClick={() => window.print()}>Export PDF</Button>
          {app.status !== 'approved' && app.status !== 'rejected' && r && (
            <>
              <Button variant="danger" onClick={() => setShowRejection(true)}>Reject…</Button>
              <Button onClick={onApprove}>Approve → notify · –{CREDIT_COSTS.approval} credits</Button>
            </>
          )}
          {app.status === 'approved' && <Badge kind="success">Approved · email sent</Badge>}
          {app.status === 'rejected' && <Badge kind="danger">Rejected</Badge>}
        </div>
      </header>

      {blind && (
        <div className="card" style={{ borderColor: '#fbe4be', background: 'var(--warn-bg)' }}>
          <div className="row-between">
            <div className="small">
              <strong>Blind review mode.</strong> Name, photo, audio, and institution cues are hidden.
              Make your call on the scores first — then reveal identity to verify your decision wasn't biased.
            </div>
            {!biasRevealed && (
              <Button size="sm" variant="secondary" onClick={() => setBiasRevealed(true)}>Reveal identity</Button>
            )}
          </div>
          {biasRevealed && (
            <div className="small" style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #fbe4be' }}>
              Revealed: <strong>{app.candidateName}</strong> · {app.candidateEmail ?? ''}
              <div className="muted tiny" style={{ marginTop: 4 }}>If your recommendation changes now, consider why that is.</div>
            </div>
          )}
        </div>
      )}

      <section className="card-hero card">
        <div className="row-flex" style={{ gap: 16 }}>
          <Avatar name={view.candidateName} photoUrl={blind ? undefined : view.candidatePhotoUrl} size="lg" />
          <div className="flex-1">
            <h3 style={{ marginBottom: 4 }}>{view.candidateName}</h3>
            <div className="muted small">{view.jobTitle} · {view.interviewLanguage ?? 'English'} interview</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className={cx('score', `score-${scoreClass(score)}`)} style={{ fontSize: 42 }}>{score}</div>
            {r && <Badge kind={REC_BADGE[r.recommendation]}>{REC_LABEL[r.recommendation]}</Badge>}
          </div>
        </div>
        {r?.signalScore != null && (
          <div className="row-between" style={{ marginTop: 18 }}>
            <div>
              <div className="lbl-sm">Signal Score™ — live confidence</div>
              <div className="muted tiny">Proprietary real-time confidence meter</div>
            </div>
            <SignalMeter score={r.signalScore} />
          </div>
        )}
      </section>

      {app.status === 'approved' && (
        <section className="card" style={{ background: 'var(--brand-50)', borderColor: 'var(--brand)' }}>
          <div className="row-between">
            <div>
              <div className="lbl-sm" style={{ color: 'var(--brand)' }}>✓ Contact details unlocked</div>
              <div className="muted tiny" style={{ marginTop: 2 }}>
                Candidate notified · {app.approvedAt ? new Date(app.approvedAt).toLocaleString() : ''}
              </div>
            </div>
            <Badge kind="success">Approved</Badge>
          </div>
          <div className="stack stack-2" style={{ marginTop: 14 }}>
            <div className="row-flex" style={{ gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div className="mono tiny muted">Name</div>
                <div style={{ fontWeight: 600 }}>{app.candidateName}</div>
              </div>
              {app.candidateEmail && (
                <div>
                  <div className="mono tiny muted">Email</div>
                  <a href={`mailto:${app.candidateEmail}`} className="link" style={{ fontWeight: 600 }}>
                    {app.candidateEmail}
                  </a>
                </div>
              )}
              {app.candidatePhone && (
                <div>
                  <div className="mono tiny muted">Phone</div>
                  <a href={`tel:${app.candidatePhone}`} className="link" style={{ fontWeight: 600 }}>
                    {app.candidatePhone}
                  </a>
                </div>
              )}
            </div>
            {job?.handbookUrl && (
              <div style={{ marginTop: 6 }}>
                <a
                  href={job.handbookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  📎 Handbook sent to candidate ({job.handbookFileName ?? 'handbook.pdf'})
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {!r ? (
        <section className="card">
          <div className="muted">Report is still being generated. Refresh in ~60 seconds.</div>
        </section>
      ) : (
        <>
          {/* Custom rubric if defined, else default 4 */}
          {r.rubricScores && r.rubricScores.length > 0 ? (
            <section className={`grid-${Math.min(4, r.rubricScores.length)}`}>
              {r.rubricScores.map((rs) => (
                <div key={rs.axisId} className="card metric t-center">
                  <div className={cx('metric-n', `score-${scoreClass(rs.score)}`)}>{rs.score}</div>
                  <div className="metric-l">{rs.label}</div>
                </div>
              ))}
            </section>
          ) : (
            <section className="grid-4">
              {([
                ['Qualification', r.scores.qualification],
                ['Communication', r.scores.communication],
                ['Confidence', r.scores.confidence],
                ['Role fit', r.scores.roleFit],
              ] as const).map(([l, v]) => (
                <div key={l} className="card metric t-center">
                  <div className={cx('metric-n', `score-${scoreClass(v)}`)}>{v}</div>
                  <div className="metric-l">{l}</div>
                </div>
              ))}
            </section>
          )}

          <section className="card">
            <div className="lbl-sm">Summary</div>
            <p style={{ marginTop: 8, lineHeight: 1.6 }}>{r.summary}</p>
          </section>

          <section className="card">
            <div className="lbl-sm">Voice sentiment — energy / confidence / stress</div>
            <div className="muted tiny" style={{ marginBottom: 8 }}>
              Inferred prosody across the conversation. Watch for stress spikes aligned with red-flag probes.
            </div>
            <SentimentChart data={sentiment} />
          </section>

          <section className="card">
            <JourneyReplay events={journey} sentiment={sentiment} />
          </section>

          {r.redFlags.length > 0 && (
            <section className="card">
              <div className="lbl-sm">Red flags</div>
              <div className="stack stack-2" style={{ marginTop: 8 }}>
                {r.redFlags.map((f, i) => <div key={i} className="qbox qbox-flag">{f}</div>)}
              </div>
            </section>
          )}

          {r.inconsistencies.length > 0 && (
            <section className="card">
              <div className="lbl-sm">LinkedIn / CV inconsistencies</div>
              <div className="stack stack-2" style={{ marginTop: 8 }}>
                {r.inconsistencies.map((inc, i) => (
                  <div key={i} className="qbox qbox-flag">
                    <div style={{ fontWeight: 600 }}>{inc.claim}</div>
                    <div className="tiny muted">Spoken: "{inc.spoken}" · source: {inc.source} · severity: {inc.severity}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {r.testResults.length > 0 && (
            <section className="card">
              <div className="lbl-sm">Technical tests</div>
              <div className="stack stack-2" style={{ marginTop: 8 }}>
                {r.testResults.map((t, i) => (
                  <div key={i} className={'qbox ' + (t.correct ? 'qbox-ok' : 'qbox-flag')}>
                    <div style={{ fontWeight: 600 }}>Q: {t.question}</div>
                    <div className="tiny muted">Expected: {t.correctAnswer} · Said: {t.candidateAnswer}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {!blind && r.institutionVerifications.length > 0 && (
            <section className="card">
              <div className="lbl-sm">Institution verification</div>
              <div className="row-flex" style={{ flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {r.institutionVerifications.map((v, i) => (
                  <Badge key={i} kind={v.verified ? 'success' : 'danger'}>
                    {v.name} {v.verified ? '✓' : '✗'}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {app.extractedProfile && Object.values(app.extractedProfile).some(Boolean) && (
            <section className="card">
              <div className="lbl-sm">Extracted profile</div>
              <div className="stack stack-2" style={{ marginTop: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                  {([
                    ['Current role', app.extractedProfile.currentRole],
                    ['Desired role', app.extractedProfile.desiredRole],
                    ['Experience', app.extractedProfile.yearsOfExperience],
                    ['Current salary', app.extractedProfile.currentSalary],
                    ['Salary expectation', app.extractedProfile.salaryExpectation],
                    ['Country', app.extractedProfile.currentCountry],
                  ] as const).map(([label, val]) => val ? (
                    <div key={label}>
                      <div className="lbl-sm" style={{ fontSize: 10 }}>{label}</div>
                      <div className="small" style={{ marginTop: 2 }}>{val}</div>
                    </div>
                  ) : null)}
                </div>
                {app.extractedProfile.skills && app.extractedProfile.skills.length > 0 && (
                  <div>
                    <div className="lbl-sm" style={{ fontSize: 10 }}>Skills</div>
                    <div className="row-flex" style={{ flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                      {app.extractedProfile.skills.map((s, i) => (
                        <span key={i} style={{ padding: '2px 8px', borderRadius: 999, background: 'var(--surface-2)', border: '1px solid var(--border-soft)', fontSize: 12 }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {r.voiceAuthenticity != null && (
            <section className="card">
              <div className="row-between">
                <div>
                  <div className="lbl-sm">Voice authenticity check</div>
                  <div className="muted small" style={{ marginTop: 4 }}>
                    Deepfake / voice-cloning heuristic. Lower = more suspicious.
                  </div>
                </div>
                <div className={cx('score', `score-${scoreClass(r.voiceAuthenticity)}`)}>{r.voiceAuthenticity}</div>
              </div>
            </section>
          )}

          {(view.transcriptEnglish || app.transcriptOfficial) && (
            <section className="card">
              <div className="lbl-sm">
                Transcript{app.transcriptOfficial ? ' (official · from ElevenLabs)' : ' (English)'}
              </div>
              <pre style={{ whiteSpace: 'pre-wrap', marginTop: 8, fontSize: 13, lineHeight: 1.65 }}>
                {app.transcriptOfficial ?? view.transcriptEnglish}
              </pre>
            </section>
          )}

          {!blind && app.audioUrl && (
            <section className="card">
              <div className="lbl-sm" style={{ marginBottom: 8 }}>Interview audio</div>
              <audio src={app.audioUrl} controls style={{ width: '100%' }} />
            </section>
          )}

          {app.rejectionMessage && (
            <section className="card" style={{ background: 'var(--danger-bg)', borderColor: '#f4c9c9' }}>
              <div className="lbl-sm">Rejection sent</div>
              <pre className="small" style={{ whiteSpace: 'pre-wrap', marginTop: 8, lineHeight: 1.6 }}>{app.rejectionMessage}</pre>
            </section>
          )}
        </>
      )}

      <RejectionModal
        open={showRejection}
        onClose={() => setShowRejection(false)}
        application={app}
        onSend={onRejectConfirmed}
      />
    </div>
  );
}
