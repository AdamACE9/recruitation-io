import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Field, Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { loginAgency } from '@/services/agencies';
import { useAuth } from '@/contexts/AuthContext';

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
      setErr(e instanceof Error ? e.message : 'Invalid credentials');
    } finally { setLoading(false); }
  }

  return (
    <div className="hero-gradient" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <form onSubmit={submit} className="card-hero" style={{ width: 'min(440px, 100%)' }}>
        <Logo />
        <h3 style={{ marginTop: 20, marginBottom: 4 }}>Agency sign in</h3>
        <div className="muted small" style={{ marginBottom: 20 }}>Access your dashboard and results.</div>
        <div className="stack stack-3">
          <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
          <Field label="Password"><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></Field>
          {err ? <div className="field-error">{err}</div> : null}
          <Button type="submit" loading={loading} block>Sign in</Button>
          <div className="small muted t-center">
            New here? <Link to="/signup/agency" className="link">Create an agency account</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
