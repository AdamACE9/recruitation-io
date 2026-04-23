// ============================================================
// Authenticated app shell — sidebar + main area
// ============================================================

import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { cx } from '@/lib/util';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { CreditAlert } from '@/components/CreditAlert';
import { ShortcutHelp } from '@/components/ShortcutHelp';
import { OnboardingWizard } from '@/components/OnboardingWizard';

interface NavItem { to: string; label: string; section?: string }

function SidebarLink({ to, label }: NavItem) {
  return (
    <NavLink to={to} end className={({ isActive }) => cx('nav-link', isActive && 'on')}>
      {label}
    </NavLink>
  );
}

export function AppShell({ kind }: { kind: 'agency' | 'candidate' | 'admin' }) {
  const { agency, candidate, isAdmin, signOut, user } = useAuth();
  const nav = useNavigate();
  // Show onboarding wizard for brand-new agencies that haven't completed it
  const [wizardDismissed, setWizardDismissed] = useState(false);
  const showWizard = kind === 'agency' && !agency?.onboardingComplete && !wizardDismissed;

  const links: NavItem[] = kind === 'agency' ? [
    { to: '/dashboard', label: 'Dashboard', section: 'work' },
    { to: '/jobs', label: 'Jobs' },
    { to: '/jobs/new', label: 'New Job' },
    { to: '/pipeline', label: 'Pipeline', section: 'results' },
    { to: '/compare', label: 'Compare' },
    { to: '/skills', label: 'Skills Heatmap' },
    { to: '/analytics', label: 'Analytics' },
    { to: '/credits', label: 'Credits', section: 'account' },
    { to: '/settings', label: 'Settings' },
  ] : kind === 'candidate' ? [
    { to: '/me', label: 'My Applications' },
    { to: '/jobs-open', label: 'Browse Jobs' },
    { to: '/profile', label: 'Profile' },
  ] : [
    { to: '/admin', label: 'Overview' },
    { to: '/admin/agencies', label: 'Agencies' },
    { to: '/admin/interviews', label: 'Interviews' },
    { to: '/admin/credits', label: 'Credits' },
    { to: '/admin/activity', label: 'Activity' },
  ];

  const displayName = kind === 'agency' ? agency?.name : kind === 'candidate' ? candidate?.name : 'Recruitation Admin';
  const displayPhoto = kind === 'candidate' ? candidate?.photoUrl : kind === 'agency' ? agency?.logoUrl : undefined;
  const logoLabel = kind === 'agency' && agency?.name ? agency.name : 'Recruitation.AI';

  return (
    <>
    {showWizard && <OnboardingWizard onClose={() => setWizardDismissed(true)} />}
    <ShortcutHelp />
    {kind === 'agency' && <CreditAlert credits={agency?.credits ?? 999} />}
    <div className="app-shell">
      <aside className="app-sidebar">
        <div style={{ padding: '4px 10px 18px' }}>
          <Logo label={logoLabel} />
        </div>
        {links.map((l, i) => (
          <div key={l.to}>
            {l.section && i !== 0 ? <div className="nav-section">{l.section}</div> : null}
            <SidebarLink {...l} />
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div className="row-flex" style={{ padding: '10px', gap: 10, borderTop: '1px solid var(--border-soft)' }}>
          <Avatar name={displayName ?? user?.email ?? '?'} photoUrl={displayPhoto} size="sm" />
          <div className="flex-1 small ellipsis" title={user?.email ?? undefined}>
            <div className="ellipsis" style={{ fontWeight: 600 }}>{displayName ?? 'Account'}</div>
            <div className="muted ellipsis tiny">{isAdmin ? 'Super admin' : kind}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={async () => { await signOut(); nav('/'); }}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
    </>
  );
}
