// ============================================================
// Live ElevenLabs voice interview
// ============================================================
//
// This page:
//  1. Loads the application + job.
//  2. If `application.interviewPrep.status === 'ready'`, uses the
//     server-side assembled questions + elevenLabsPrompt (Gemini → Groq
//     → Google CSE pipeline, see functions/src/index.ts `prepareInterview`).
//     Otherwise falls back to a locally-composed prompt (legacy apps).
//  3. Requests microphone.
//  4. Establishes the ElevenLabs Conversational-AI session.
//  5. Displays reference images when the agent signals them.
//  6. On completion → calls finalizeInterview().
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getApplication, finalizeInterview, updateApplication, enrichWithOfficialTranscript } from '@/services/applications';
import { getJob } from '@/services/jobs';
import { useAuth } from '@/contexts/AuthContext';
import type { Application, Job, TailoredQuestion } from '@/lib/types';
import { SignalMeter } from '@/components/SignalMeter';
import { LiveCoach } from '@/components/LiveCoach';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/lib/toast';
import { generateCandidateHints } from '@/lib/features';

type Msg = { role: 'agent' | 'candidate' | 'system'; text: string; ts: number };

const ELEVEN_AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID as string | undefined;

export default function Interview() {
  const { id } = useParams();
  const nav = useNavigate();
  const { toast } = useToast();
  const { candidate } = useAuth();

  const [app, setApp] = useState<Application | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [questions, setQuestions] = useState<TailoredQuestion[]>([]);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'live' | 'ending' | 'done' | 'error'>('idle');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [signal, setSignal] = useState(50);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const convRef = useRef<any>(null);
  const tickerRef = useRef<number | null>(null);
  const endedRef = useRef(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const a = await getApplication(id);
      if (!a) { setStatus('error'); return; }
      setApp(a);
      const j = await getJob(a.jobId);
      setJob(j);
      // Prefer server-prepared questions
      if (a.interviewPrep?.status === 'ready' && a.interviewPrep.questions.length > 0) {
        setQuestions(a.interviewPrep.questions);
      }
    })();
  }, [id]);

  async function startInterview() {
    if (!job || !app || !candidate) return;
    setStatus('connecting');

    // Prefer the server-assembled ElevenLabs prompt (from prepareInterview).
    // Fall back to a locally-composed one for legacy apps.
    const systemPrompt =
      app.interviewPrep?.status === 'ready' && app.interviewPrep.elevenLabsPrompt
        ? app.interviewPrep.elevenLabsPrompt
        : buildFallbackPrompt(job, candidate, questions);

    try {
      if (!ELEVEN_AGENT_ID) {
        // Simulated interview fallback — shows full UI without creds.
        simulateInterview();
        return;
      }
      // Dynamic import so non-installed env doesn't break build.
      const mod = await import('@elevenlabs/client' as string).catch(() => null);
      if (!mod) { simulateInterview(); return; }
      const { Conversation } = mod as { Conversation: any };
      const conv = await Conversation.startSession({
        agentId: ELEVEN_AGENT_ID,
        overrides: {
          agent: { prompt: { prompt: systemPrompt }, language: job.jobConfig.language },
        },
        onConnect: () => {
          setStatus('live');
          updateApplication(app.id, { status: 'interview_live' });
        },
        onDisconnect: () => handleEnd(),
        onMessage: (m: any) => {
          if (!m?.message) return;
          setMessages((x) => [...x, { role: m.source === 'ai' ? 'agent' : 'candidate', text: m.message, ts: Date.now() }]);
          // Show the matching image when the agent utters the question text
          if (m.source === 'ai') {
            const q = questions.find((q) => m.message.toLowerCase().includes(q.question.slice(0, 40).toLowerCase()));
            if (q?.imageUrl) setCurrentImage(q.imageUrl);
          }
          // simple heuristic signal score from reply length + variance
          setSignal((s) => Math.max(15, Math.min(95, s + (m.message.length > 40 ? 2 : -1))));
        },
      });
      convRef.current = conv;
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Interview failed to start', 'danger');
      setStatus('error');
    }
  }

  function simulateInterview() {
    setStatus('live');
    updateApplication(app!.id, { status: 'interview_live' });
    const steps: { role: Msg['role']; text: string; image?: string }[] = [
      { role: 'agent', text: `Hello ${candidate?.name?.split(' ')[0]}, thanks for joining. Tell me about your current role.` },
      { role: 'candidate', text: `Sure — I work primarily in ${job?.jobConfig.industry ?? 'the industry'}, mainly ${job?.title} responsibilities.` },
      ...questions.slice(0, 2).map((q) => ({
        role: 'agent' as const,
        text: q.question,
        image: q.imageUrl,
      })),
      { role: 'candidate', text: 'Let me think… my assessment is X.' },
      { role: 'agent', text: 'Thank you. That concludes our interview — we will be in touch via the portal.' },
    ];
    let i = 0;
    const next = () => {
      if (i >= steps.length) { handleEnd(); return; }
      const s = steps[i++];
      if (s.image) setCurrentImage(s.image);
      setMessages((m) => [...m, { role: s.role, text: s.text, ts: Date.now() }]);
      setSignal((v) => Math.max(15, Math.min(95, v + (s.role === 'candidate' ? 8 : -2) + Math.random() * 4)));
      setTimeout(next, 1800);
    };
    setTimeout(next, 800);
  }

  async function handleEnd() {
    // Use a ref-based guard to prevent double-calls from both the ElevenLabs
    // onDisconnect callback and the "End interview" button firing simultaneously.
    if (endedRef.current) return;
    endedRef.current = true;
    setStatus('ending');

    // Capture the ElevenLabs conversationId before ending the session.
    // The `getId()` method is available on the @elevenlabs/client Conversation object.
    const conversationId: string | undefined = convRef.current?.getId?.() as string | undefined;

    if (convRef.current?.endSession) {
      try { await convRef.current.endSession(); } catch (e) {
        console.warn('[Interview] endSession error:', e instanceof Error ? e.message : e);
      }
    }

    const transcript = messages.map((m) => `${m.role === 'agent' ? 'Agent' : 'Candidate'}: ${m.text}`).join('\n');
    try {
      if (app) await finalizeInterview(app.id, transcript, conversationId);
      setStatus('done');

      // Best-effort: fetch official transcript + audio URL from ElevenLabs after a short
      // delay (ElevenLabs needs ~3s to finalise the recording server-side). Fire & forget.
      if (app && conversationId) {
        setTimeout(() => {
          enrichWithOfficialTranscript(app.id, conversationId).catch(() => {/* swallowed */});
        }, 3000);
      }

      setTimeout(() => nav(`/thanks/${app?.id ?? ''}`), 900);
    } catch (e) {
      // CRITICAL: don't silently swallow — the interview was not saved
      console.error('[Interview] finalizeInterview failed:', e instanceof Error ? e.message : e);
      toast('Interview could not be saved. Please contact support if this persists.', 'danger');
      setStatus('error');
      endedRef.current = false; // allow retry
    }
  }

  useEffect(() => {
    if (status !== 'live') return;
    tickerRef.current = window.setInterval(() => setElapsed((t) => t + 1), 1000);
    return () => { if (tickerRef.current) clearInterval(tickerRef.current); };
  }, [status]);

  if (!app || !job) return <div className="muted" style={{ padding: 40 }}>Loading…</div>;

  // Guard: block entry until prep is ready (defensive — Apply.tsx already gates on this)
  if (app.interviewPrep && app.interviewPrep.status !== 'ready') {
    return (
      <div className="container-narrow" style={{ padding: '60px 24px' }}>
        <div className="card t-center">
          <h3>Your interview is still being prepared</h3>
          <div className="muted small" style={{ marginTop: 8 }}>
            Status: <strong>{app.interviewPrep.status}</strong>. Head back to your application page.
          </div>
          <div style={{ marginTop: 18 }}>
            <Button variant="secondary" onClick={() => nav('/me')}>Go to my applications</Button>
          </div>
        </div>
      </div>
    );
  }

  const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const seconds = (elapsed % 60).toString().padStart(2, '0');
  const coachHints = status === 'live' ? generateCandidateHints(messages) : [];

  return (
    <div className="container-wide" style={{ padding: '40px 24px', minHeight: '100vh' }}>
      <div className="row-between" style={{ marginBottom: 20 }}>
        <div className="row-flex">
          <div className={'pulse-dot'} style={{ opacity: status === 'live' ? 1 : 0.3 }} />
          <h3>Live interview · {job.title}</h3>
        </div>
        <div className="row-flex">
          <div className="mono small muted">{minutes}:{seconds} / {job.jobConfig.duration}:00</div>
          <Badge kind={status === 'live' ? 'success' : status === 'connecting' ? 'info' : 'neutral'}>{status}</Badge>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20 }}>
        <section className="card" style={{ minHeight: 460, display: 'flex', flexDirection: 'column' }}>
          {currentImage ? (
            <div className="t-center stack stack-3">
              <img src={currentImage} alt="test" style={{ maxWidth: '100%', maxHeight: 320, borderRadius: 12, boxShadow: 'var(--shadow-md)', objectFit: 'contain', margin: '0 auto' }} />
              <div className="muted tiny">Reference image displayed by interviewer</div>
            </div>
          ) : (
            <div className="stack stack-3 flex-1" style={{ overflowY: 'auto', paddingRight: 8 }}>
              {messages.map((m, i) => (
                <div key={i} style={{
                  padding: '10px 14px', borderRadius: 12,
                  background: m.role === 'agent' ? 'var(--brand-50)' : 'var(--surface-2)',
                  alignSelf: m.role === 'agent' ? 'flex-start' : 'flex-end',
                  maxWidth: '80%', fontSize: 14, lineHeight: 1.5,
                }}>
                  <div className="tiny mono muted" style={{ marginBottom: 4 }}>{m.role === 'agent' ? 'Agent' : 'You'}</div>
                  {m.text}
                </div>
              ))}
              {messages.length === 0 && (
                <div className="t-center muted" style={{ margin: 'auto' }}>
                  When you're ready, click <strong>Start interview</strong>. Your mic will be requested.
                </div>
              )}
            </div>
          )}
          <div className="row-between" style={{ marginTop: 14 }}>
            {status === 'idle' ? (
              <Button size="lg" onClick={startInterview}>Start interview</Button>
            ) : status === 'live' ? (
              <Button variant="danger" onClick={handleEnd}>End interview</Button>
            ) : <div />}
            <div className="row-flex">
              <div className="lbl-sm" style={{ margin: 0 }}>Signal</div>
              <SignalMeter score={signal} live={status === 'live'} />
            </div>
          </div>
        </section>

        <aside className="stack stack-4">
          <div className="card">
            <div className="lbl-sm">About this interview</div>
            <div className="stack stack-2 small" style={{ marginTop: 8 }}>
              <div className="row-between"><span className="muted">Language</span><span>{job.jobConfig.language}</span></div>
              <div className="row-between"><span className="muted">Tone</span><span>{job.jobConfig.tone}</span></div>
              <div className="row-between"><span className="muted">Duration</span><span>{job.jobConfig.duration} min</span></div>
              <div className="row-between"><span className="muted">Tailored questions</span><span>{questions.length}</span></div>
            </div>
          </div>
          <div className="card">
            <div className="lbl-sm">Candidate</div>
            <div className="small" style={{ marginTop: 8 }}>{candidate?.name}</div>
            <div className="muted tiny">{candidate?.email}</div>
          </div>
          {status === 'live' && coachHints.length > 0 && <LiveCoach hints={coachHints} />}
          <div className="card">
            <div className="lbl-sm">Tips</div>
            <ul className="small muted" style={{ paddingLeft: 16, marginTop: 8, lineHeight: 1.7 }}>
              <li>Quiet room, headphones if possible</li>
              <li>Speak naturally — the agent will pause</li>
              <li>You can ask for clarification</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

/**
 * Fallback prompt used when `application.interviewPrep` is missing (legacy apps).
 * The primary path uses the server-assembled prompt from the prepareInterview Cloud Function.
 */
function buildFallbackPrompt(
  job: Job,
  candidate: NonNullable<ReturnType<typeof useAuth>['candidate']>,
  questions: TailoredQuestion[],
): string {
  const lines: string[] = [];
  lines.push(`You are a voice recruiter conducting an ${job.jobConfig.duration}-minute first-round screening interview in ${job.jobConfig.language} for: ${job.title} (${job.jobConfig.location}).`);
  lines.push(`Tone: ${job.jobConfig.tone}.`);
  lines.push(`Job description: ${job.jobConfig.description}`);
  if (job.jobConfig.qualifications) lines.push(`Required qualifications: ${job.jobConfig.qualifications}`);
  if (job.jobConfig.experience) lines.push(`Experience required: ${job.jobConfig.experience}`);
  if (job.jobConfig.customQuestions.length) lines.push(`Custom questions to ask:\n- ${job.jobConfig.customQuestions.join('\n- ')}`);
  if (job.jobConfig.redFlags.length) lines.push(`Red flags to probe (without tipping the candidate off):\n- ${job.jobConfig.redFlags.join('\n- ')}`);
  if (questions.length) {
    lines.push(`Tailored questions (ask one at a time, do not reveal reference answers):`);
    questions.forEach((q, i) => lines.push(`${i + 1}. ${q.question}${q.imageUrl ? ' [show image]' : ''}`));
  }
  lines.push(`Candidate: ${candidate.name}, preferred language ${candidate.preferredLanguage}.`);
  if (candidate.cvText) lines.push(`CV summary:\n${candidate.cvText.slice(0, 2000)}`);
  if (candidate.linkedinText) lines.push(`LinkedIn summary:\n${candidate.linkedinText.slice(0, 2000)}`);
  lines.push(`Finish with a polite goodbye and do NOT reveal any scoring. Keep exchanges natural and short.`);
  return lines.join('\n\n');
}
