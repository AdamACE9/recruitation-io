// Candidate unified login/signup — used in-flow when applying.
import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Field, Input, Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { signupCandidate, loginCandidate } from '@/services/candidates';
import { useAuth } from '@/contexts/AuthContext';

const LANGS = ['English', 'Arabic', 'Hindi', 'Urdu', 'Tagalog', 'French', 'Spanish', 'Mandarin', 'Russian', 'Bengali', 'Malayalam', 'Tamil'];

export default function CandidateAuth({ mode }: { mode: 'login' | 'signup' }) {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') ?? '/me';
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
      setErr(e instanceof Error ? e.message : 'Something went wrong');
    } finally { setLoading(false); }
  }

  return (
    <div className="hero-gradient" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <form onSubmit={submit} className="card-hero" style={{ width: 'min(560px, 100%)' }}>
        <Logo />
        <h3 style={{ marginTop: 20, marginBottom: 4 }}>
          {mode === 'login' ? 'Sign in to your account' : 'Create candidate account'}
        </h3>
        <div className="muted small" style={{ marginBottom: 20 }}>
          {mode === 'login' ? 'Track your applications and interviews.' : 'Required before you can interview.'}
        </div>
        <div className="stack stack-3">
          {mode === 'signup' && (
            <Field label="Full name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></Field>
          )}
          <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></Field>
          <Field label="Password"><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></Field>
          {mode === 'signup' && (
            <>
              <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></Field>
              <Field label="Preferred interview language">
                <Select value={form.preferredLanguage} onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })}>
                  {LANGS.map((l) => <option key={l}>{l}</option>)}
                </Select>
              </Field>
              <div className="grid-2">
                <Field label="CV (PDF)"><Input type="file" accept="application/pdf" onChange={(e) => setForm({ ...form, cv: e.target.files?.[0] ?? null })} required /></Field>
                <Field label="LinkedIn (PDF export)"><Input type="file" accept="application/pdf" onChange={(e) => setForm({ ...form, linkedin: e.target.files?.[0] ?? null })} required /></Field>
              </div>
              <Field label="Profile photo (optional)">
                <Input type="file" accept="image/*" onChange={(e) => setForm({ ...form, photo: e.target.files?.[0] ?? null })} />
              </Field>
            </>
          )}
          {err ? <div className="field-error">{err}</div> : null}
          <Button type="submit" loading={loading} block>
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </Button>
          <div className="small muted t-center">
            {mode === 'login' ? (
              <>No account? <Link to={`/signup/candidate?next=${encodeURIComponent(next)}`} className="link">Sign up</Link></>
            ) : (
              <>Already registered? <Link to={`/login/candidate?next=${encodeURIComponent(next)}`} className="link">Sign in</Link></>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
