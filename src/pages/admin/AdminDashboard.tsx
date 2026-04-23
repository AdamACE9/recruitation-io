// ============================================================
// Admin dashboard — platform overview
// ============================================================

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listActiveAgencies, listPendingAgencies } from '@/services/agencies';
import type { Agency } from '@/lib/types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatRelative } from '@/lib/util';

export default function AdminDashboard() {
  const [pending, setPending] = useState<Agency[]>([]);
  const [active, setActive] = useState<Agency[]>([]);

  useEffect(() => {
    Promise.all([listPendingAgencies(), listActiveAgencies()]).then(([p, a]) => {
      setPending(p); setActive(a);
    });
  }, []);

  const totalCredits = active.reduce((s, a) => s + (a.credits ?? 0), 0);

  return (
    <div className="stack stack-5">
      <header className="row-between">
        <div>
          <h2>Platform overview</h2>
          <div className="muted small">Recruitation.AI admin console</div>
        </div>
      </header>

      <div className="grid-4">
        <div className="card metric t-center">
          <div className="metric-n" style={{ color: 'var(--warn)' }}>{pending.length}</div>
          <div className="metric-l">Awaiting approval</div>
        </div>
        <div className="card metric t-center">
          <div className="metric-n" style={{ color: 'var(--brand)' }}>{active.length}</div>
          <div className="metric-l">Active agencies</div>
        </div>
        <div className="card metric t-center">
          <div className="metric-n">{totalCredits.toLocaleString()}</div>
          <div className="metric-l">Credits in circulation</div>
        </div>
        <div className="card metric t-center">
          <div className="metric-n">—</div>
          <div className="metric-l">MRR (coming)</div>
        </div>
      </div>

      <section>
        <div className="row-between" style={{ marginBottom: 12 }}>
          <div className="lbl-sm">Pending approvals</div>
          <Link to="/admin/agencies"><Button variant="secondary" size="sm">Manage agencies</Button></Link>
        </div>
        <div className="card">
          {pending.length === 0 ? (
            <div className="t-center muted small" style={{ padding: 24 }}>No pending requests. 🎉</div>
          ) : pending.slice(0, 5).map((a) => (
            <div key={a.id} className="row">
              <Avatar name={a.name} photoUrl={a.logoUrl} />
              <div className="flex-1">
                <div style={{ fontWeight: 600 }}>{a.name}</div>
                <div className="muted tiny">{a.email} · requested {formatRelative(typeof a.createdAt === 'number' ? a.createdAt : Date.now())}</div>
              </div>
              <Badge kind="warn">pending</Badge>
              <Link to={`/admin/agencies`}><Button size="sm">Review</Button></Link>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="lbl-sm" style={{ marginBottom: 12 }}>Active agencies</div>
        <div className="card">
          {active.length === 0 ? (
            <div className="t-center muted small" style={{ padding: 24 }}>No active agencies yet.</div>
          ) : active.slice(0, 10).map((a) => (
            <div key={a.id} className="row">
              <Avatar name={a.name} photoUrl={a.logoUrl} />
              <div className="flex-1">
                <div style={{ fontWeight: 600 }}>{a.name}</div>
                <div className="muted tiny">{a.email}</div>
              </div>
              <div className="muted small">{a.credits} credits</div>
              <Link to="/admin/credits"><Button variant="ghost" size="sm">Top up</Button></Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
