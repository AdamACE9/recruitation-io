// ============================================================
// Three-step job creation wizard
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/lib/toast';
import { createJob, addTestQuestion, extractJobFromPdf } from '@/services/jobs';
import { listApplicationsByAgency } from '@/services/applications';
import { readFileAsDataUrl, randomId } from '@/lib/util';
import type { JobConfig, TestQuestion, RubricAxis, Application } from '@/lib/types';
import { CREDIT_COSTS } from '@/lib/types';
import { RubricBuilder } from '@/components/RubricBuilder';
import { findSilverMedalists, type SilverMedalistMatch } from '@/lib/features';

const EMPTY_CFG: JobConfig = {
  description: '', qualifications: '', experience: '', salary: '', location: '',
  workType: 'onsite', industry: '', tone: 'professional', language: 'English',
  duration: 12, customQuestions: [], redFlags: [], topics: [],
};

export default function NewJob() {
  const nav = useNavigate();
  const { agency, user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [method, setMethod] = useState<'form' | 'pdf'>('form');
  const [cfg, setCfg] = useState<JobConfig>(EMPTY_CFG);
  const [tests, setTests] = useState<(Omit<TestQuestion, 'id'> & { _id: string; _file?: File | null })[]>([]);
  const [handbookFile, setHandbookFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [silverMatches, setSilverMatches] = useState<SilverMedalistMatch[] | null>(null);
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);

  const update = <K extends keyof JobConfig>(k: K, v: JobConfig[K]) => setCfg((c) => ({ ...c, [k]: v }));

  async function handlePdf(file: File) {
    setExtracting(true);
    try {
      const data = await readFileAsDataUrl(file);
      const extracted = await extractJobFromPdf(data);
      if (extracted.title && !title) setTitle(extracted.title);
      setCfg((c) => ({ ...c, ...extracted }));
      toast('PDF extracted — review the fields', 'success');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Extraction failed', 'danger');
    } finally { setExtracting(false); }
  }

  function addListItem(key: 'customQuestions' | 'redFlags' | 'topics', text: string) {
    if (!text.trim()) return;
    setCfg((c) => ({ ...c, [key]: [...c[key], text.trim()] }));
  }
  function removeListItem(key: 'customQuestions' | 'redFlags' | 'topics', i: number) {
    setCfg((c) => ({ ...c, [key]: c[key].filter((_, idx) => idx !== i) }));
  }

  async function createFinal() {
    if (!agency || !user) return;
    if (!title.trim()) { toast('Title required', 'danger'); return; }
    setLoading(true);
    try {
      const job = await createJob({
        agencyId: agency.id,
        title: title.trim(),
        method,
        config: cfg,
        handbookFile,
        actorUid: user.uid,
      });
      for (const t of tests) {
        await addTestQuestion(job.id, { question: t.question, correctAnswer: t.correctAnswer, imageUrl: null, weight: t.weight }, t._file ?? null);
      }
      toast('Job created — link is live', 'success');
      // Hunt for silver medalists from past rejected applications
      try {
        const pastApps: Application[] = await listApplicationsByAgency(agency.id, 200);
        const matches = findSilverMedalists(job, pastApps);
        if (matches.length > 0) {
          setSilverMatches(matches);
          setCreatedJobId(job.id);
          return;
        }
      } catch {
        // non-fatal — skip silver-medalist panel
      }
      nav(`/jobs/${job.id}`);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to create job', 'danger');
    } finally { setLoading(false); }
  }

  return (
    <div className="stack stack-5">
      <header className="row-between">
        <div>
          <h2>Create job</h2>
          <div className="muted small">Step {step} of 3 · –{CREDIT_COSTS.jobCreate} credits on creation</div>
        </div>
        <Button variant="ghost" onClick={() => nav(-1)}>Cancel</Button>
      </header>

      {step === 1 && (
        <section className="card">
          <div className="lbl-sm">Basics</div>
          <div className="stack stack-4" style={{ marginTop: 14 }}>
            <Field label="Job title"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Radiologist" /></Field>
            <div>
              <div className="lbl-sm" style={{ marginBottom: 8 }}>Method</div>
              <div className="grid-2">
                <button type="button" className={'card ' + (method === 'form' ? '' : '')} onClick={() => setMethod('form')}
                  style={{ textAlign: 'left', borderColor: method === 'form' ? 'var(--brand)' : undefined, boxShadow: method === 'form' ? 'var(--shadow-focus)' : undefined, cursor: 'pointer' }}>
                  <div style={{ fontWeight: 600 }}>Fill out the form</div>
                  <div className="muted small">Craft each field manually for full control.</div>
                </button>
                <label className={'card'} style={{ textAlign: 'left', borderColor: method === 'pdf' ? 'var(--brand)' : undefined, boxShadow: method === 'pdf' ? 'var(--shadow-focus)' : undefined, cursor: 'pointer', display: 'block' }}>
                  <div style={{ fontWeight: 600 }}>Upload job-spec PDF</div>
                  <div className="muted small">Gemini extracts every field automatically.</div>
                  <input type="file" accept="application/pdf" style={{ marginTop: 10 }}
                    onChange={(e) => { setMethod('pdf'); const f = e.target.files?.[0]; if (f) handlePdf(f); }} />
                  {extracting && <div className="tiny mono muted" style={{ marginTop: 8 }}>Extracting…</div>}
                </label>
              </div>
            </div>
          </div>
          <div className="row-between" style={{ marginTop: 24 }}>
            <div />
            <Button onClick={() => setStep(2)} disabled={!title.trim()}>Continue →</Button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="card">
          <div className="lbl-sm">Configuration</div>
          <div className="stack stack-4" style={{ marginTop: 14 }}>
            <Field label="Description"><Textarea value={cfg.description} onChange={(e) => update('description', e.target.value)} /></Field>
            <div className="grid-2">
              <Field label="Qualifications"><Textarea value={cfg.qualifications} onChange={(e) => update('qualifications', e.target.value)} /></Field>
              <Field label="Experience required"><Textarea value={cfg.experience} onChange={(e) => update('experience', e.target.value)} /></Field>
            </div>
            <div className="grid-3">
              <Field label="Location"><Input value={cfg.location} onChange={(e) => update('location', e.target.value)} /></Field>
              <Field label="Salary"><Input value={cfg.salary} onChange={(e) => update('salary', e.target.value)} /></Field>
              <Field label="Industry"><Input value={cfg.industry} onChange={(e) => update('industry', e.target.value)} /></Field>
            </div>
            <div className="grid-4">
              <Field label="Work type">
                <Select value={cfg.workType} onChange={(e) => update('workType', e.target.value as JobConfig['workType'])}>
                  <option value="onsite">On-site</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option>
                </Select>
              </Field>
              <Field label="Interview tone">
                <Select value={cfg.tone} onChange={(e) => update('tone', e.target.value as JobConfig['tone'])}>
                  <option value="professional">Professional</option><option value="warm">Warm</option><option value="rigorous">Rigorous</option><option value="casual">Casual</option>
                </Select>
              </Field>
              <Field label="Language">
                <Select value={cfg.language} onChange={(e) => update('language', e.target.value)}>
                  {['English', 'Arabic', 'Hindi', 'Urdu', 'Tagalog', 'French', 'Spanish'].map((l) => <option key={l}>{l}</option>)}
                </Select>
              </Field>
              <Field label="Duration (min)"><Input type="number" value={cfg.duration} onChange={(e) => update('duration', Number(e.target.value) || 0)} /></Field>
            </div>
            <ChipList label="Custom questions" items={cfg.customQuestions} onAdd={(t) => addListItem('customQuestions', t)} onRemove={(i) => removeListItem('customQuestions', i)} placeholder="Ask about MRI vs CT experience ratio" />
            <ChipList label="Red flags to probe" items={cfg.redFlags} onAdd={(t) => addListItem('redFlags', t)} onRemove={(i) => removeListItem('redFlags', i)} placeholder="Probe the 2019–2021 employment gap" />
            <hr className="divider" />
            <RubricBuilder
              value={cfg.rubric}
              onChange={(rubric: RubricAxis[]) => update('rubric', rubric)}
            />
          </div>
          <div className="row-between" style={{ marginTop: 24 }}>
            <Button variant="ghost" onClick={() => setStep(1)}>← Back</Button>
            <Button onClick={() => setStep(3)}>Continue →</Button>
          </div>
        </section>
      )}

      {silverMatches && createdJobId && (
        <div className="modal-backdrop" onClick={() => { setSilverMatches(null); nav(`/jobs/${createdJobId}`); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="stack stack-3">
              <div>
                <h3 style={{ margin: 0 }}>🥈 Silver medalists found</h3>
                <div className="muted small" style={{ marginTop: 4 }}>
                  Strong candidates you previously rejected — their profile looks aligned with this new role.
                </div>
              </div>
              <div className="stack stack-2">
                {silverMatches.map((m) => (
                  <div key={m.app.id} className="card" style={{ padding: 12 }}>
                    <div className="row-between">
                      <div className="flex-1">
                        <div style={{ fontWeight: 600 }}>{m.app.candidateName}</div>
                        <div className="muted tiny">{m.reason}</div>
                      </div>
                      <div className="score score-ok">{m.score}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="row-flex" style={{ justifyContent: 'flex-end' }}>
                <Button variant="secondary" onClick={() => { setSilverMatches(null); nav(`/jobs/${createdJobId}`); }}>
                  Go to job
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <section className="card">
          <div className="lbl-sm">Example questions & handbook</div>
          <div className="muted small" style={{ marginTop: 6, marginBottom: 14 }}>
            Add 0–5 <strong>example</strong> technical questions. These are <em>hints</em> — Groq uses them
            as templates to generate fresh, CV-tailored questions for each candidate. An uploaded image
            is reused when relevant; otherwise Google pulls one from trusted sources (radiopaedia, NIH,
            Khan Academy, .edu).
          </div>
          <div className="stack stack-3">
            {tests.map((t, i) => (
              <div key={t._id} className="card-tight card">
                <div className="row-between" style={{ marginBottom: 8 }}>
                  <div className="mono tiny muted">Example {i + 1}</div>
                  <button className="link small" onClick={() => setTests((x) => x.filter((y) => y._id !== t._id))}>Remove</button>
                </div>
                <div className="stack stack-2">
                  <Field label="Example question"><Input value={t.question} onChange={(e) => setTests((x) => x.map((y) => y._id === t._id ? { ...y, question: e.target.value } : y))} /></Field>
                  <Field label="Expected answer (optional — guides Groq's reference answer)">
                    <Input value={t.correctAnswer} onChange={(e) => setTests((x) => x.map((y) => y._id === t._id ? { ...y, correctAnswer: e.target.value } : y))} />
                  </Field>
                  <Field label="Reference image (optional)">
                    <Input type="file" accept="image/*" onChange={(e) => setTests((x) => x.map((y) => y._id === t._id ? { ...y, _file: e.target.files?.[0] ?? null } : y))} />
                  </Field>
                </div>
              </div>
            ))}
            <Button variant="secondary" onClick={() => setTests((x) => [...x, { _id: randomId(6), question: '', correctAnswer: '', weight: 1 }])}>+ Add example question</Button>
          </div>
          <hr className="divider" />
          <div className="lbl-sm" style={{ marginBottom: 6 }}>Employee handbook (optional)</div>
          <div className="muted small" style={{ marginBottom: 10 }}>
            Shared with candidates after approval. Also gives the interview AI extra context.
          </div>
          <Field label="Handbook PDF">
            <Input
              type="file"
              accept="application/pdf"
              onChange={(e) => setHandbookFile(e.target.files?.[0] ?? null)}
            />
          </Field>
          {handbookFile && (
            <div className="mono tiny muted" style={{ marginTop: 6 }}>
              Selected: {handbookFile.name} ({Math.round(handbookFile.size / 1024)} KB)
            </div>
          )}
          <hr className="divider" />
          <div className="row-between">
            <div className="muted small">
              Cost: <Badge kind="warn">–{CREDIT_COSTS.jobCreate} credits</Badge> on creation ·{' '}
              <Badge kind="warn">–{CREDIT_COSTS.interview} credits</Badge> per completed interview ·{' '}
              <Badge kind="warn">–{CREDIT_COSTS.approval} credits</Badge> per approval
            </div>
            <div className="row-flex">
              <Button variant="ghost" onClick={() => setStep(2)}>← Back</Button>
              <Button onClick={createFinal} loading={loading}>Publish job</Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function ChipList({ label, items, onAdd, onRemove, placeholder }: {
  label: string; items: string[]; onAdd: (t: string) => void; onRemove: (i: number) => void; placeholder?: string;
}) {
  const [v, setV] = useState('');
  return (
    <Field label={label}>
      <div className="stack stack-2">
        <div className="row-flex" style={{ flexWrap: 'wrap', gap: 6 }}>
          {items.map((it, i) => (
            <span key={i} className="chip">
              {it}
              <button className="link tiny" onClick={() => onRemove(i)} style={{ marginLeft: 4 }}>×</button>
            </span>
          ))}
        </div>
        <div className="row-flex">
          <Input value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder}
                 onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAdd(v); setV(''); } }} />
          <Button variant="secondary" onClick={() => { onAdd(v); setV(''); }}>Add</Button>
        </div>
      </div>
    </Field>
  );
}
