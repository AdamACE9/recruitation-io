import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';

export default function PendingAgency() {
  const { agency, signOut } = useAuth();
  return (
    <div className="hero-gradient" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="card-hero" style={{ width: 'min(560px, 100%)' }}>
        <Logo />
        <div className="row-flex" style={{ marginTop: 18 }}>
          <Badge kind="warn">Awaiting approval</Badge>
          <span className="muted small mono">Usually &lt; 4 hours</span>
        </div>
        <h3 style={{ marginTop: 12, marginBottom: 10 }}>Thanks — we'll be in touch shortly.</h3>
        <div className="muted">
          Your agency <strong style={{ color: 'var(--ink)' }}>{agency?.name}</strong> is in our review queue.
          Once approved, you'll receive 20 starter credits and access to your white-label portal at
          {' '}<code className="mono">/{agency?.slug ?? 'your-slug'}</code>.
        </div>
        <div className="card" style={{ marginTop: 20, background: 'var(--surface-2)' }}>
          <div className="lbl-sm">While you wait</div>
          <ul className="small muted" style={{ paddingLeft: 18, marginTop: 8, lineHeight: 1.7 }}>
            <li>Prepare the first job spec you want to post — PDF is fine, we extract every field</li>
            <li>Gather the list of red flags you want our agent to probe</li>
            <li>Collect your first three technical test questions (+ images if relevant)</li>
          </ul>
        </div>
        <div style={{ marginTop: 20 }}>
          <Button variant="ghost" onClick={signOut}>Sign out</Button>
        </div>
      </div>
    </div>
  );
}
