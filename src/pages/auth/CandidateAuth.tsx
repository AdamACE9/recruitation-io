// Candidate unified login/signup — used in-flow when applying.
import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Field, Input, Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { signupCandidate, loginCandidate } from '@/services/candidates';
import { useAuth } from '@/contexts/AuthContext';
import { safeNextPath, friendlyAuthError, SUPPORTED_INTERVIEW_LANGUAGES } from '@/lib/util';

// Source of truth lives in src/lib/util.ts (kept in sync with the ElevenLabs
// agent's Security → Languages allowlist). Sending an unlisted language causes
// the agent to reject the override and close the WS immediately.
const LANGS = SUPPORTED_INTERVIEW_LANGUAGES;

const SIGNUP_PERKS = [
  { icon: '🎙', text: 'Interview anytime — AI adapts to your language' },
  { icon: '📋', text: 'Track all applications in one place' },
  { icon: '⚡', text: 'Get evaluated in minutes, not weeks' },
  { icon: '🌍', text: 'Apply to agencies worldwide from home' },
];

const LOGIN_PERKS = [
  { icon: '📊', text: 'See your Signal Score across all interviews' },
  { icon: '📋', text: 'Track application status in real time' },
  { icon: '🎙', text: 'Jump back into any scheduled interview' },
  { icon: '🔔', text: "Get notified the moment you're shortlisted" },
];

export default function CandidateAuth({ mode }: { mode: 'login' | 'signup' }) {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = safeNextPath(params.get('next'), '/me');
  const { refresh } = useAuth();
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    preferredLanguage: 'English',
    cv: null as File | null, linkedin: null as File | null, photo: null as File | null,
  });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setLoading(true);
    try {
      if (mode === 'login') {
        await loginCandidate(form.email, form.password);
      } else {
        if (!form.cv) throw new Error('Please upload your CV PDF.');
        if (!form.linkedin) throw new Error('Please upload your LinkedIn PDF export.');
        await signupCandidate({
          email: form.email, password: form.password,
          name: form.name, phone: form.phone,
          cvFile: form.cv, linkedinFile: form.linkedin, photoFile: form.photo,
          preferredLanguage: form.preferredLanguage,
        });
      }
      await refresh();
      nav(next, { replace: true });
    } catch (e) {
      setErr(friendlyAuthError(e, 'Something went wrong'));
    } finally { setLoading(false); }
  }

  const perks = mode === 'signup' ? SIGNUP_PERKS : LOGIN_PERKS;

  return (
    <>
      <style>{`
        @media (max-width: 900px) { .auth-left { display: none !important; } }
      `}</style>
      <div style={{ display: 'flex', minHeight: '100vh' }}>

        {/* ── Left panel ── */}
        <div className="auth-left" style={{
          flex: '0 0 440px', minHeight: '100vh', position: 'sticky', top: 0, height: '100vh',
          background: 'linear-gradient(150deg, #05080f 0%, #091a0e 60%, #050d08 100%)',
          padding: '44px 48px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(700px 500px at -5% -5%, rgba(26,122,60,0.22) 0%, transparent 65%), radial-gradient(500px 400px at 110% 110%, rgba(26,122,60,0.12) 0%, transparent 65%)',
          }} />
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.035,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }} />

          <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: '#f1f5f9' }}><Logo /></div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 24 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 13px',
                background: 'rgba(74,222,128,0.10)', border: '1px solid rgba(74,222,128,0.25)',
                borderRadius: 999, marginBottom: 24, width: 'fit-content',
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block',
                  boxShadow: '0 0 8px #4ade80',
                }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', letterSpacing: '0.07em' }}>FOR CANDIDATES</span>
              </div>

              <h1 style={{ color: '#f1f5f9', fontSize: 34, lineHeight: 1.12, letterSpacing: '-0.035em', marginBottom: 16 }}>
                {mode === 'signup' ? (
                  <>Your next role<br /><span style={{
                    background: 'linear-gradient(90deg, #4ade80 0%, #22c55e 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>starts here.</span></>
                ) : (
                  <>Good to have<br /><span style={{
                    background: 'linear-gradient(90deg, #4ade80 0%, #22c55e 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  }}>you back.</span></>
                )}
              </h1>
              <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.75, maxWidth: 300, marginBottom: 32 }}>
                {mode === 'signup'
                  ? 'Upload your CV once. Interview for any role, anywhere — no travel, no scheduling.'
                  : 'Check where you stand, track applications, and jump into new interviews.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {perks.map((p) => (
                  <div key={p.icon} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      fontSize: 13, flexShrink: 0, width: 30, height: 30, borderRadius: 8,
                      background: 'rgba(26,122,60,0.2)', border: '1px solid rgba(26,122,60,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{p.icon}</span>
                    <span style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>{p.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '48px 32px',
          background: 'radial-gradient(900px 700px at 80% 5%, rgba(26,122,60,0.05) 0%, transparent 65%), var(--bg)',
          overflowY: 'auto',
        }}>
          <form onSubmit={submit} style={{ width: 'min(480px, 100%)' }}>

            <div style={{ marginBottom: 28 }}>
              <Logo size={24} />
              <h2 style={{ marginTop: 28, marginBottom: 8, fontSize: 26, letterSpacing: '-0.025em' }}>
                {mode === 'login' ? 'Sign in to your account' : 'Create your candidate profile'}
              </h2>
              <p style={{ color: 'var(--ink-muted)', fontSize: 14, lineHeight: 1.6 }}>
                {mode === 'login'
                  ? 'Track your applications and interviews.'
                  : 'Required before you can start your first interview.'}
              </p>
            </div>

            <div className="stack stack-4" style={{ marginBottom: 20 }}>
              {mode === 'signup' && (
                <Field label="Full name">
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Smith" required />
                </Field>
              )}
              <Field label="Email">
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" required />
              </Field>
              <Field label="Password">
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required />
              </Field>

              {mode === 'signup' && (
                <>
                  <Field label="Phone">
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 000 0000" required />
                  </Field>
                  <Field label="Preferred interview language">
                    <Select value={form.preferredLanguage} onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })}>
                      {LANGS.map((l) => <option key={l}>{l}</option>)}
                    </Select>
                  </Field>

                  <div style={{
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '16px 18px',
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
                      Documents
                    </div>
                    <div className="stack stack-3">
                      <Field label="CV (PDF)" hint="Your resume in PDF format">
                        <Input type="file" accept="application/pdf" onChange={(e) => setForm({ ...form, cv: e.target.files?.[0] ?? null })} required />
                      </Field>
                      <Field label="LinkedIn PDF export" hint="Download from LinkedIn → More → Save to PDF">
                        <Input type="file" accept="application/pdf" onChange={(e) => setForm({ ...form, linkedin: e.target.files?.[0] ?? null })} required />
                      </Field>
                      <Field label="Profile photo (optional)">
                        <Input type="file" accept="image/*" onChange={(e) => setForm({ ...form, photo: e.target.files?.[0] ?? null })} />
                      </Field>
                    </div>
                  </div>
                </>
              )}

              {err && <div className="field-error">{err}</div>}
            </div>

            <Button type="submit" loading={loading} block size="lg">
              {mode === 'login' ? 'Sign in →' : 'Create account →'}
            </Button>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--ink-muted)' }}>
              {mode === 'login' ? (
                <>No account? <Link to={`/signup/candidate?next=${encodeURIComponent(next)}`} className="link">Sign up free</Link></>
              ) : (
                <>Already registered? <Link to={`/login/candidate?next=${encodeURIComponent(next)}`} className="link">Sign in</Link></>
              )}
            </p>

            <div style={{
              marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-soft)',
              textAlign: 'center', fontSize: 12, color: 'var(--ink-subtle)',
            }}>
              Hiring agency?{' '}
              <Link to="/login/agency" className="link" style={{ fontSize: 12 }}>Agency sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
