import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { signupAgency } from '@/services/agencies';
import { useToast } from '@/lib/toast';
import { isValidHexColor, friendlyAuthError } from '@/lib/util';

const PERKS = [
  { icon: '💳', text: '20 free starter credits on approval' },
  { icon: '🎨', text: 'White-label portal — your brand, your link' },
  { icon: '🎙', text: 'Voice AI interviews in 12+ languages' },
  { icon: '📊', text: 'Ranked candidates with full Signal Score™ reports' },
  { icon: '🛡', text: 'Voice authenticity & deepfake detection' },
  { icon: '🧠', text: 'Knowledge OS grows with every placement' },
];

const STEP_LABELS = ['Your details', 'Brand identity'];

export default function AgencySignup() {
  const nav = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', website: '', description: '',
    brandColor: '#1a7a3c', logoFile: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const update = (k: keyof typeof form, v: string | File | null) =>
    setForm((f) => ({ ...f, [k]: v as never }));

  async function submit() {
    setErr(null);
    if (!isValidHexColor(form.brandColor)) { setErr('Brand color must be a hex like #1a7a3c'); return; }
    if (form.password.length < 8) { setErr('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await signupAgency(form);
      toast('Account created — pending admin approval', 'success');
      nav('/pending', { replace: true });
    } catch (e) {
      setErr(friendlyAuthError(e, 'Signup failed'));
    } finally { setLoading(false); }
  }

  return (
    <>
      <style>{`
        @media (max-width: 900px) { .auth-left { display: none !important; } }
      `}</style>
      <div style={{ display: 'flex', minHeight: '100vh' }}>

        {/* ── Left branding panel ── */}
        <div className="auth-left" style={{
          flex: '0 0 460px', minHeight: '100vh', position: 'sticky', top: 0, height: '100vh',
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
                <span style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', letterSpacing: '0.07em' }}>JOIN 140+ AGENCIES</span>
              </div>

              <h1 style={{ color: '#f1f5f9', fontSize: 34, lineHeight: 1.12, letterSpacing: '-0.035em', marginBottom: 16 }}>
                Everything you need<br />
                <span style={{
                  background: 'linear-gradient(90deg, #4ade80 0%, #22c55e 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>to scale hiring.</span>
              </h1>
              <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.75, maxWidth: 320, marginBottom: 32 }}>
                Sign up free. Admin approves you within a few hours, then you're live.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {PERKS.map((p) => (
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
          <div style={{ width: 'min(520px, 100%)' }}>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <Logo size={24} />
              <div style={{ marginTop: 28, marginBottom: 8 }}>
                <h2 style={{ fontSize: 26, letterSpacing: '-0.025em', marginBottom: 6 }}>
                  Create your agency account
                </h2>
                <p style={{ color: 'var(--ink-muted)', fontSize: 14, lineHeight: 1.6 }}>
                  Approved within hours. 20 starter credits included.
                </p>
              </div>
            </div>

            {/* Step indicator */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
              {STEP_LABELS.map((label, i) => {
                const idx = i + 1;
                const done = idx < step;
                const active = idx === step;
                return (
                  <div key={label} style={{
                    flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                    borderRadius: 10, border: `1px solid ${active ? 'var(--brand)' : done ? 'rgba(26,122,60,0.3)' : 'var(--border)'}`,
                    background: active ? 'color-mix(in srgb, var(--brand) 8%, transparent)' : done ? 'color-mix(in srgb, var(--brand) 4%, transparent)' : 'var(--surface-2)',
                    transition: 'all 220ms ease',
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700,
                      background: active ? 'var(--brand)' : done ? 'var(--brand)' : 'var(--border)',
                      color: active || done ? '#fff' : 'var(--ink-muted)',
                    }}>
                      {done ? '✓' : idx}
                    </div>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: active ? 'var(--brand)' : done ? 'var(--ink-2)' : 'var(--ink-muted)' }}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Step 1 */}
            {step === 1 && (
              <div className="stack stack-4">
                <Field label="Agency name">
                  <Input value={form.name} onChange={(e) => update('name', e.target.value)}
                    placeholder="Al-Hind Foreign Agency" />
                </Field>
                <div className="grid-2">
                  <Field label="Work email">
                    <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
                      placeholder="you@agency.com" />
                  </Field>
                  <Field label="Password">
                    <Input type="password" value={form.password} onChange={(e) => update('password', e.target.value)}
                      placeholder="8+ characters" />
                  </Field>
                </div>
                <div className="grid-2">
                  <Field label="Phone">
                    <Input value={form.phone} onChange={(e) => update('phone', e.target.value)}
                      placeholder="+971..." />
                  </Field>
                  <Field label="Website (optional)">
                    <Input value={form.website} onChange={(e) => update('website', e.target.value)}
                      placeholder="https://agency.com" />
                  </Field>
                </div>
                <Field label="What do you recruit for? (optional)">
                  <Textarea value={form.description} onChange={(e) => update('description', e.target.value)}
                    placeholder="Healthcare, engineering, hospitality..." />
                </Field>
                {err && <div className="field-error">{err}</div>}
                <div className="row-between">
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
                    Already on Recruitation?{' '}
                    <a className="link" href="/login/agency">Sign in</a>
                  </div>
                  <Button onClick={() => {
                    if (!form.name || !form.email || !form.password) { setErr('Name, email and password are required.'); return; }
                    setErr(null); setStep(2);
                  }}>
                    Continue →
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="stack stack-4">
                <Field label="Brand color" hint="Your candidates see this color on every page.">
                  <div className="row-flex">
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <input
                        type="color"
                        value={form.brandColor}
                        onChange={(e) => update('brandColor', e.target.value)}
                        style={{ width: 44, height: 44, border: '2px solid var(--border)', borderRadius: 10, cursor: 'pointer', padding: 2, background: 'var(--surface)' }}
                      />
                    </div>
                    <Input value={form.brandColor} onChange={(e) => update('brandColor', e.target.value)}
                      placeholder="#1a7a3c" style={{ fontFamily: 'var(--font-mono)' }} />
                  </div>
                </Field>

                <Field label="Logo" hint="PNG or SVG recommended">
                  <Input type="file" accept="image/*" onChange={(e) => update('logoFile', e.target.files?.[0] ?? null)} />
                </Field>

                {/* Brand preview */}
                <div style={{
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '16px 18px',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
                    Preview
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12, background: form.brandColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 4px 16px ${form.brandColor}55`,
                    }}>
                      <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>
                        {form.name ? form.name[0].toUpperCase() : 'A'}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--ink)', marginBottom: 3 }}>
                        {form.name || 'Your Agency'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--ink-muted)', fontFamily: 'var(--font-mono)' }}>
                        recruitation.io/{form.name ? form.name.toLowerCase().replace(/\s+/g, '-').slice(0, 24) : 'your-slug'}
                      </div>
                    </div>
                  </div>
                </div>

                {err && <div className="field-error">{err}</div>}
                <div className="row-between">
                  <Button variant="ghost" onClick={() => setStep(1)}>← Back</Button>
                  <Button onClick={submit} loading={loading}>Create account</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
