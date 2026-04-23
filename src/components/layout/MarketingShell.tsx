import { Link, Outlet } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';

export function MarketingShell() {
  return (
    <div className="marketing">
      <div className="marketing-nav">
        <div className="marketing-nav-inner">
          <Link to="/"><Logo /></Link>
          <nav className="row-flex" style={{ gap: 4 }}>
            <Link to="/#how" className="btn btn-ghost btn-sm">How it works</Link>
            <Link to="/#pricing" className="btn btn-ghost btn-sm">Pricing</Link>
            <Link to="/login/agency" className="btn btn-secondary btn-sm">Agency sign in</Link>
            <Link to="/signup/agency" className="btn btn-primary btn-sm">Start free</Link>
          </nav>
        </div>
      </div>
      <Outlet />
      <footer style={{ padding: '48px 24px 60px', borderTop: '1px solid var(--border-soft)', marginTop: 80 }}>
        <div className="container row-between" style={{ flexWrap: 'wrap', gap: 16 }}>
          <Logo />
          <div className="muted small">© {new Date().getFullYear()} Recruitation.AI · All rights reserved</div>
          <div className="row-flex" style={{ gap: 14 }}>
            <Link to="/login/candidate" className="muted small">Candidate sign in</Link>
            <Link to="/login/admin" className="muted small">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
