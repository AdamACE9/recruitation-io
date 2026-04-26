import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import { Input } from '@/components/ui/Field';
import { useAuth } from '@/contexts/AuthContext';
import { friendlyAuthError } from '@/lib/util';

function LockIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

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
      setErr(friendlyAuthError(e, 'Invalid credentials'));
    } finally { setLoading(false); }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      background: 'radial-gradient(900px 700px at 50% 0%, rgba(26,122,60,0.08) 0%, transparent 60%), #05080f',
    }}>
      {/* subtle grid */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', opacity: 0.04,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      <form onSubmit={submit} style={{
        width: 'min(400px, 100%)', position: 'relative',
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 20, padding: '40px 36px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}>

        {/* Logo mark */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16,
            background: 'linear-gradient(135deg, #1a7a3c 0%, #0f4a24 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(26,122,60,0.4)',
            color: '#fff',
          }}>
            <LockIcon />
          </div>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px',
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 999, marginBottom: 16,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', letterSpacing: '0.07em' }}>RESTRICTED ACCESS</span>
          </div>
          <h2 style={{ color: '#f1f5f9', fontSize: 22, letterSpacing: '-0.025em', marginBottom: 6 }}>
            Super Admin
          </h2>
          <p style={{ color: '#64748b', fontSize: 13 }}>
            Requires{' '}
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#94a3b8', background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: 4 }}>
              admin: true
            </code>{' '}
            custom claim.
          </p>
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.01em' }}>Email</label>
            <Input
              type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@recruitation.io"
              required
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#f1f5f9' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.01em' }}>Password</label>
            <Input
              type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#f1f5f9' }}
            />
          </div>
          {err && (
            <div style={{
              fontSize: 12, color: '#fca5a5', background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '8px 12px',
            }}>
              {err}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: '12px 20px', borderRadius: 10,
            background: 'linear-gradient(135deg, #1a7a3c 0%, #156430 100%)',
            color: '#fff', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(26,122,60,0.35)',
            opacity: loading ? 0.7 : 1, transition: 'opacity 140ms ease, transform 140ms ease',
          }}
        >
          {loading ? '…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
