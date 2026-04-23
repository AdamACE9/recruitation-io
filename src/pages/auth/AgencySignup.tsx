import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { signupAgency } from '@/services/agencies';
import { useToast } from '@/lib/toast';
import { isValidHexColor } from '@/lib/util';

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

  const update = (k: keyof typeof form, v: string | File | null) => setForm((f) => ({ ...f, [k]: v as never }));

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
      const msg = e instanceof Error ? e.message : 'Signup failed';
      setErr(msg);
    } finally { setLoading(false); }
  }

  return (
    <div className="hero-gradient" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card-hero" style={{ width: 'min(640px, 100%)' }}>
        <div className="row-between" style={{ marginBottom: 20 }}>
          <Logo />
          <div className="mono tiny muted">Step {step} of 2</div>
        </div>
        <h3 style={{ marginBottom: 4 }}>Create your agency account</h3>
        <div className="muted small" style={{ marginBottom: 20 }}>
          After you sign up, our team approves you within a few hours and tops up 20 starter credits.
        </div>

        {step === 1 ? (
          <div className="stack stack-4">
            <Field label="Agency name">
              <Input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Al-Hind Foreign Agency" />
            </Field>
            <div className="grid-2">
              <Field label="Work email">
                <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@agency.com" />
              </Field>
              <Field label="Password">
                <Input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} placeholder="8+ characters" />
              </Field>
            </div>
            <div className="grid-2">
              <Field label="Phone">
                <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+971..." />
              </Field>
              <Field label="Website (optional)">
                <Input value={form.website} onChange={(e) => update('website', e.target.value)} placeholder="https://agency.com" />
              </Field>
            </div>
            <Field label="What do you recruit for? (optional)">
              <Textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Healthcare, engineering..." />
            </Field>
            {err ? <div className="field-error">{err}</div> : null}
            <div className="row-between">
              <div className="muted tiny">Already on Recruitation? <a className="link" href="/login/agency">Sign in</a></div>
              <Button onClick={() => {
                if (!form.name || !form.email || !form.password) { setErr('Name, email, password required.'); return; }
                setErr(null); setStep(2);
              }}>Continue →</Button>
            </div>
          </div>
        ) : (
          <div className="stack stack-4">
            <Field label="Brand color" hint="Your candidates see this color on every page.">
              <div className="row-flex">
                <input type="color" value={form.brandColor} onChange={(e) => update('brandColor', e.target.value)} style={{ width: 56, height: 40, border: 'none', background: 'transparent' }} />
                <Input value={form.brandColor} onChange={(e) => update('brandColor', e.target.value)} />
              </div>
            </Field>
            <Field label="Logo" hint="PNG or SVG recommended">
              <Input type="file" accept="image/*" onChange={(e) => update('logoFile', e.target.files?.[0] ?? null)} />
            </Field>
            <div className="card" style={{ background: 'var(--surface-2)' }}>
              <div className="lbl-sm">Preview</div>
              <div className="row-flex" style={{ marginTop: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: form.brandColor }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{form.name || 'Your agency'}</div>
                  <div className="muted small">recruitation.io/{form.name ? form.name.toLowerCase().replace(/\s+/g, '-').slice(0, 24) : 'your-slug'}</div>
                </div>
              </div>
            </div>
            {err ? <div className="field-error">{err}</div> : null}
            <div className="row-between">
              <Button variant="ghost" onClick={() => setStep(1)}>← Back</Button>
              <Button onClick={submit} loading={loading}>Create account</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
