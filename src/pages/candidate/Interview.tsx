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
// Static import — DO NOT switch back to a dynamic `import('@elevenlabs/client' as string)`.
// The cast was hiding a TS error AND defeating Vite's static analysis, so the SDK was
// never actually bundled in production → import threw → silent .catch fallback ran the
// fake simulator. Documented in OVERNIGHT_QA_REPORT.md.
import { Conversation } from '@elevenlabs/client';
import { getApplication, finalizeInterview, updateApplication, enrichWithOfficialTranscript } from '@/services/applications';
import { getJob } from '@/services/jobs';
import { getAgency } from '@/services/agencies';
import { useAuth } from '@/contexts/AuthContext';
import type { Agency, Application, Job, TailoredQuestion } from '@/lib/types';
import { SignalMeter } from '@/components/SignalMeter';
import { LiveCoach } from '@/components/LiveCoach';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/lib/toast';
import { generateCandidateHints } from '@/lib/features';

type Msg = { role: 'agent' | 'candidate' | 'system'; text: string; ts: number };

const ELEVEN_AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID as string | undefined;

// Language is no longer passed as an override (which would require enabling
// `language` in the agent's Security tab). Instead we send the human-readable
// language name as a `dynamicVariable` ({{language}}), and the dashboard prompt
// instructs the LLM to respond in that language. ASR auto-detects from the
// languages enabled on the agent.

export default function Interview() {
  const { id } = useParams();
  const nav = useNavigate();
  const { toast } = useToast();
  const { candidate } = useAuth();

  const [app, setApp] = useState<Application | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [questions, setQuestions] = useState<TailoredQuestion[]>([]);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'live' | 'ending' | 'done' | 'error'>('idle');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [signal, setSignal] = useState(50);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(-1);
  const convRef = useRef<any>(null);
  const tickerRef = useRef<number | null>(null);
  const endedRef = useRef(false);
  // Mirror `questions` and the running index in refs so the ElevenLabs onMessage
  // closure (captured once when the session starts) always reads fresh state.
  const questionsRef = useRef<TailoredQuestion[]>([]);
  const questionIdxRef = useRef<number>(-1);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const a = await getApplication(id);
      if (!a) { setStatus('error'); return; }
      setApp(a);
      const j = await getJob(a.jobId);
      setJob(j);
      if (a.agencyId) {
        const ag = await getAgency(a.agencyId).catch(() => null);
        setAgency(ag);
      }
      // Prefer server-prepared questions
      if (a.interviewPrep?.status === 'ready' && a.interviewPrep.questions.length > 0) {
        setQuestions(a.interviewPrep.questions);
        questionsRef.current = a.interviewPrep.questions;
      }
    })();
  }, [id]);

  // Returns the index of the question best matched by the agent's spoken text,
  // preferring (1) topic keywords, (2) leading words of the question itself, then
  // (3) "question N" / ordinal cues. Falls back to advancing one step on unknown utterances.
  function pickQuestionIndex(spoken: string): number {
    const text = spoken.toLowerCase();
    const qs = questionsRef.current;
    if (qs.length === 0) return -1;

    // 1) Topic keyword match — strongest signal
    for (let i = 0; i < qs.length; i++) {
      const topic = (qs[i].topic ?? '').toLowerCase();
      if (!topic) continue;
      const words = topic.split(/\s+/).filter((w) => w.length > 3);
      if (words.length && words.some((w) => text.includes(w))) return i;
    }

    // 2) Question-text prefix match (first 30 chars)
    for (let i = 0; i < qs.length; i++) {
      const head = qs[i].question.slice(0, 30).toLowerCase();
      if (head && text.includes(head)) return i;
    }

    // 3) Ordinal cue: "first question", "next question", "question two", "question 3"
    const ord = /\b(?:question\s+(\d+|one|two|three|four|five)|(first|next|second|third|fourth|fifth)\s+question)\b/.exec(text);
    if (ord) {
      const map: Record<string, number> = {
        one: 0, first: 0, two: 1, second: 1, three: 2, third: 2,
        four: 3, fourth: 3, five: 4, fifth: 4,
      };
      const raw = (ord[1] ?? ord[2] ?? '').toLowerCase();
      if (/^\d+$/.test(raw)) return Math.max(0, parseInt(raw, 10) - 1);
      if (raw === 'next') return Math.min(qs.length - 1, questionIdxRef.current + 1);
      if (map[raw] !== undefined) return map[raw];
    }

    return -1;
  }

  async function startInterview() {
    if (!job || !app || !candidate) return;
    setStatus('connecting');

    if (!ELEVEN_AGENT_ID) {
      console.warn('[Interview] VITE_ELEVENLABS_AGENT_ID is not set — running simulated interview.');
      simulateInterview();
      return;
    }
    // Request mic permission BEFORE the SDK call so the failure mode is clear.
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (micErr) {
      console.error('[Interview] mic permission denied:', micErr instanceof Error ? micErr.message : micErr);
      toast('Microphone access is required for the interview. Please enable it and retry.', 'danger');
      setStatus('error');
      return;
    }
    try {
      // === DYNAMIC VARIABLES (NOT overrides) ===========================
      // ElevenLabs rejects `overrides.agent.prompt` because override security
      // is disabled by default ("Override for field 'prompt' is not allowed by config").
      // Instead, the agent's *dashboard* system prompt contains {{variable}}
      // placeholders that we fill at runtime via `dynamicVariables`. This needs
      // ZERO security-tab toggles — it's the supported, low-friction pattern.
      //
      // The dashboard prompt expects these names exactly. Keep this list synced
      // with the agent's "System prompt" in the ElevenLabs dashboard.
      const cfg = job.jobConfig;
      const langName = job.jobConfig.language || 'English';

      // Format the assembled questions block — same shape the dashboard prompt
      // refers to as {{questions_block}}.
      const questionsBlock = questions.length === 0
        ? '(No tailored questions — improvise from the candidate CV.)'
        : questions.map((q, i) => {
            const lines: string[] = [`Question ${i + 1}: ${q.question}`];
            if (q.topic) lines.push(`  Topic keywords: ${q.topic}`);
            if (q.imageUrl) lines.push(`  Image: an educational image about "${q.topic ?? q.question.slice(0, 40)}" is on the candidate's screen — say "have a look at the image on your screen" before asking.`);
            if (q.referenceAnswer) lines.push(`  [Private reference — for your judgment only:] ${q.referenceAnswer}`);
            return lines.join('\n');
          }).join('\n\n');

      const redFlagsList = (cfg.redFlags ?? []).filter(Boolean);
      const skills = (candidate.skills ?? []).filter(Boolean);

      // dynamicVariables values must be string | number | boolean.
      // We coerce everything explicitly and provide safe fallbacks so a
      // missing field never lands as `undefined` (which the SDK would drop).
      const dynamicVariables: Record<string, string | number | boolean> = {
        agency_name: agency?.name || 'the agency',
        candidate_name: candidate.name || 'the candidate',
        job_title: app.jobTitle || job.title || 'the role',
        language: langName,
        tone: cfg.tone || 'professional',
        duration: typeof cfg.duration === 'number' ? cfg.duration : 10,
        job_description: cfg.description || '(no description provided)',
        job_qualifications: cfg.qualifications || '(none specified)',
        job_experience: cfg.experience || '(none specified)',
        job_industry: cfg.industry || '(unspecified)',
        job_location: cfg.location || '(unspecified)',
        job_work_type: cfg.workType || 'unspecified',
        candidate_cv: (candidate.cvText || '').slice(0, 4000) || '(CV not available)',
        candidate_linkedin: (candidate.linkedinText || '').slice(0, 2000) || '(LinkedIn export not provided)',
        candidate_skills: skills.length ? skills.join(', ') : '(none extracted)',
        red_flags: redFlagsList.length ? '- ' + redFlagsList.join('\n- ') : '(none specified)',
        questions_block: questionsBlock,
      };

      console.info('[Interview] starting session with dynamicVariables:',
        Object.fromEntries(Object.entries(dynamicVariables).map(([k, v]) => [
          k,
          typeof v === 'string' && v.length > 80 ? v.slice(0, 80) + '…' : v,
        ])));

      const conv = await Conversation.startSession({
        agentId: ELEVEN_AGENT_ID,
        // Use WebSocket transport. WebRTC requires the agent to be configured
        // with a LiveKit endpoint (https://livekit.rtc.elevenlabs.io/rtc/v1/validate
        // returned 404 in production E2E test — meaning our agent is not enrolled
        // in WebRTC). WebSocket works on every agent out of the box; the latency
        // difference (~150ms vs ~250ms) is imperceptible for an interview.
        connectionType: 'websocket',
        // NO overrides — the dashboard prompt + dynamicVariables handle everything.
        // (If you ever want to override, enable each field in Agent → Security.)
        dynamicVariables,
        onConnect: ({ conversationId }) => {
          console.info('[Interview] connected, conversationId =', conversationId);
          setStatus('live');
          updateApplication(app.id, { status: 'interview_live' });
          // Show the first question's reference image as soon as the call starts.
          // Even if the matcher misses on the agent's first utterance, the candidate
          // sees something contextual immediately.
          if (questionsRef.current.length > 0) {
            questionIdxRef.current = 0;
            setCurrentQuestionIdx(0);
          }
        },
        onDisconnect: (details) => {
          // CRITICAL diagnostic: log close code + reason so we can tell whether
          // ElevenLabs rejected our session config (override security, etc.) vs
          // a normal user-initiated end.
          console.warn('[Interview] disconnected:', JSON.stringify({
            reason: details?.reason,
            closeCode: 'closeCode' in details ? details.closeCode : undefined,
            closeReason: 'closeReason' in details ? details.closeReason : undefined,
            message: 'message' in details ? details.message : undefined,
          }));
          handleEnd();
        },
        onError: (message, context) => {
          console.error('[Interview] SDK error:', message, context);
          toast(`Interview error: ${message}`, 'danger');
        },
        onMessage: ({ message, source }) => {
          if (!message) return;
          setMessages((x) => [...x, { role: source === 'ai' ? 'agent' : 'candidate', text: message, ts: Date.now() }]);
          if (source === 'ai') {
            const idx = pickQuestionIndex(message);
            if (idx >= 0 && idx !== questionIdxRef.current) {
              questionIdxRef.current = idx;
              setCurrentQuestionIdx(idx);
            } else if (idx < 0 && /\?\s*$/.test(message.trim()) && questionsRef.current.length > 0) {
              // The agent asked a question we couldn't match by topic / prefix.
              // Heuristic fallback: advance to the next question so an image still
              // appears. Caps at the last question; never goes back to 0.
              const next = Math.min(questionIdxRef.current + 1, questionsRef.current.length - 1);
              if (next !== questionIdxRef.current) {
                questionIdxRef.current = next;
                setCurrentQuestionIdx(next);
              }
            }
          }
          setSignal((s) => Math.max(15, Math.min(95, s + (message.length > 40 ? 2 : -1))));
        },
      });
      convRef.current = conv;
    } catch (e) {
      // Real start-session failure — surface verbatim so we can debug it.
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[Interview] Conversation.startSession threw:', msg, e);
      toast(`Could not start interview: ${msg}`, 'danger');
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
      if (s.role === 'agent') {
        const idx = pickQuestionIndex(s.text);
        if (idx >= 0 && idx !== questionIdxRef.current) {
          questionIdxRef.current = idx;
          setCurrentQuestionIdx(idx);
        }
      }
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

      setTimeout(() => nav(`/verify/${app?.id ?? ''}`), 900);
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
          {(() => {
            const activeQ = currentQuestionIdx >= 0 ? questions[currentQuestionIdx] : null;
            const activeImage = activeQ?.imageUrl ?? null;
            return (
              <>
                {activeImage && (
                  <div className="stack stack-2" style={{ marginBottom: 14 }}>
                    <div className="row-between" style={{ alignItems: 'center' }}>
                      <Badge kind="info">Question {currentQuestionIdx + 1} of {questions.length}</Badge>
                      <div className="row-flex" style={{ gap: 6 }}>
                        {activeQ?.topic && <span className="muted tiny" style={{ marginRight: 6 }}>{activeQ.topic}</span>}
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '2px 10px' }}
                          disabled={currentQuestionIdx <= 0}
                          onClick={() => {
                            const prev = Math.max(0, currentQuestionIdx - 1);
                            questionIdxRef.current = prev;
                            setCurrentQuestionIdx(prev);
                          }}
                          aria-label="Previous question image"
                        >‹</button>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '2px 10px' }}
                          disabled={currentQuestionIdx >= questions.length - 1}
                          onClick={() => {
                            const next = Math.min(questions.length - 1, currentQuestionIdx + 1);
                            questionIdxRef.current = next;
                            setCurrentQuestionIdx(next);
                          }}
                          aria-label="Next question image"
                        >›</button>
                      </div>
                    </div>
                    <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: 10, textAlign: 'center' }}>
                      <img
                        src={activeImage}
                        alt={activeQ?.topic ?? 'reference image'}
                        style={{ maxWidth: '100%', maxHeight: 280, borderRadius: 8, objectFit: 'contain', margin: '0 auto', display: 'block' }}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                      <div className="muted tiny" style={{ marginTop: 6 }}>Reference image — discuss with the interviewer</div>
                    </div>
                  </div>
                )}
                <div className="stack stack-3 flex-1" style={{ overflowY: 'auto', paddingRight: 8, minHeight: 0 }}>
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
              </>
            );
          })()}
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
          {questions.length > 0 && (
            <div className="card">
              <div className="lbl-sm">Question progress</div>
              <div className="stack stack-2" style={{ marginTop: 10 }}>
                {questions.map((q, i) => {
                  const active = i === currentQuestionIdx;
                  const passed = currentQuestionIdx >= 0 && i < currentQuestionIdx;
                  return (
                    <div key={q.id} className="row-flex" style={{
                      gap: 10, alignItems: 'center',
                      opacity: passed ? 0.55 : 1,
                      padding: '6px 8px', borderRadius: 8,
                      background: active ? 'var(--brand-50)' : 'transparent',
                      border: active ? '1px solid var(--brand)' : '1px solid transparent',
                    }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%',
                        background: active ? 'var(--brand)' : passed ? 'var(--success, #16a34a)' : 'var(--surface-2)',
                        color: active || passed ? '#fff' : 'var(--muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 600, flexShrink: 0,
                      }}>{passed ? '✓' : i + 1}</div>
                      <div className="tiny" style={{ flex: 1, lineHeight: 1.35 }}>
                        {q.topic ?? q.question.slice(0, 60) + (q.question.length > 60 ? '…' : '')}
                        {q.imageUrl && <span className="muted" style={{ marginLeft: 6 }}>📷</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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

// Fallback prompt assembly removed — we now rely entirely on the dashboard
// system prompt + dynamicVariables. The Cloud Function still assembles
// `interviewPrep.elevenLabsPrompt` for audit purposes (and so the agency report
// page can render the prompt that was used), but the SDK no longer passes it.
