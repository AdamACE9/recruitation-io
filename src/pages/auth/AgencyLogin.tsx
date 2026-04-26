import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Field, Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { loginAgency } from '@/services/agencies';
import { useAuth } from '@/contexts/AuthContext';
import { friendlyAuthError } from '@/lib/util';

const STATS = [
  { n: '3,400+', l: 'Interviews completed' },
  { n: '85%', l: 'Faster time-to-hire' },
  { n: '140+', l: 'Active agencies' },
];

const FEATURES = [
  { icon: '🎙', text: 'Voice AI in 12+ languages — no scheduling' },
  { icon: '📊', text: 'Signal Score™ ranks candidates across 4 axes' },
  { icon: '🔗', text: 'White-label links live the moment you post' },
  { icon: '🛡', text: 'Voice deepfake & authenticity detection' },
];

export default function AgencyLogin() {
  const nav = useNavigate();
  const { refresh } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setLoading(true);
    try {
      await loginAgency(email, password);
      await refresh();
      nav('/dashboard', { replace: true });
    } catch (e) {
      setErr(friendlyAuthError(e, 'Invalid credentials'));
    } finally { setLoading(false); }
  }

  return (
    <>
      <style>{`
        @media (max-width: 860px) { .auth-left { display: none !important; } }
        .auth-input-dark::placeholder { color: #475569; }
      `}</style>
      <div style={{ display: 'flex', minHeight: '100vh' }}>

        {/* ── Left branding panel ── */}
        <div className="auth-left" style={{
          flex: '0 0 460px', minHeight: '100vh', position: 'sticky', top: 0, height: '100vh',
          background: 'linear-gradient(150deg, #05080f 0%, #091a0e 60%, #050d08 100%)',
          padding: '44px 48px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* glow blobs */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(700px 500px at -5% -5%, rgba(26,122,60,0.22) 0%, transparent 65%), radial-gradient(500px 400px at 110% 110%, rgba(26,122,60,0.12) 0%, transparent 65%)',
          }} />

          {/* subtle grid */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.035,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }} />

          <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Logo */}
            <div style={{ color: '#f1f5f9' }}><Logo /></div>

            {/* Hero text */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 24 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 13px',
                background: 'rgba(74,222,128,0.10)', border: '1px solid rgba(74,222,128,0.25)',
                borderRadius: 999, marginBottom: 24, width: 'fit-content',
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block',
                  boxShadow: '0 0 8px #4ade80',
                }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', letterSpacing: '0.07em' }}>AI INTERVIEWS LIVE</span>
              </div>

              <h1 style={{ color: '#f1f5f9', fontSize: 38, lineHeight: 1.1, letterSpacing: '-0.035em', marginBottom: 18 }}>
                Hire faster.<br />
                <span style={{
                  background: 'linear-gradient(90deg, #4ade80 0%, #22c55e 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>Screen smarter.</span>
              </h1>
              <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.75, maxWidth: 320 }}>
                Run voice-first AI interviews in any language. Get ranked candidates with full reports — no scheduling, no bias.
              </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 28 }}>
              {STATS.map((s) => (
                <div key={s.n} style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12, padding: '14px 12px',
                }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em' }}>{s.n}</div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 3, lineHeight: 1.45 }}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Feature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {FEATURES.map((f) => (
                <div key={f.icon} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{
                    fontSize: 14, flexShrink: 0, width: 30, height: 30, borderRadius: 8,
                    background: 'rgba(26,122,60,0.2)', border: '1px solid rgba(26,122,60,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{f.icon}</span>
                  <span style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.55, paddingTop: 6 }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '48px 32px',
          background: 'radial-gradient(900px 700px at 80% 5%, rgba(26,122,60,0.05) 0%, transparent 65%), var(--bg)',
        }}>
          <form onSubmit={submit} style={{ width: 'min(400px, 100%)' }}>

            {/* Mobile logo */}
            <div style={{ marginBottom: 32 }}>
              <Logo size={24} />
              <h2 style={{ marginTop: 28, marginBottom: 8, fontSize: 28, letterSpacing: '-0.025em' }}>Welcome back</h2>
              <p style={{ color: 'var(--ink-muted)', fontSize: 14, lineHeight: 1.6 }}>
                Sign in to your agency dashboard.
              </p>
            </div>

            <div className="stack stack-4" style={{ marginBottom: 24 }}>
              <Field label="Work email">
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@agency.com" required />
              </Field>
              <Field label="Password">
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required />
              </Field>
              {err && <div className="field-error">{err}</div>}
            </div>

            <Button type="submit" loading={loading} block size="lg">
              Sign in to dashboard →
            </Button>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--ink-muted)' }}>
              No account? <Link to="/signup/agency" className="link">Create a free agency account</Link>
            </p>

            <div style={{
              marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--border-soft)',
              textAlign: 'center', fontSize: 12, color: 'var(--ink-subtle)',
            }}>
              Candidate?{' '}
              <Link to="/login/candidate" className="link" style={{ fontSize: 12 }}>Sign in here instead</Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
