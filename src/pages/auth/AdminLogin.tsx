import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import { Field, Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLogin() {
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
      await signInWithEmailAndPassword(firebaseAuth(), email, password);
      await refresh();
      nav('/admin', { replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Invalid credentials');
    } finally { setLoading(false); }
  }

  return (
    <div className="hero-gradient" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <form onSubmit={submit} className="card-hero" style={{ width: 'min(420px, 100%)' }}>
        <Logo />
        <h3 style={{ marginTop: 20, marginBottom: 4 }}>Super admin sign in</h3>
        <div className="muted small" style={{ marginBottom: 20 }}>Requires <code className="mono">admin: true</code> custom claim.</div>
        <div className="stack stack-3">
          <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
          <Field label="Password"><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></Field>
          {err ? <div className="field-error">{err}</div> : null}
          <Button type="submit" loading={loading} block>Sign in</Button>
        </div>
      </form>
    </div>
  );
}
