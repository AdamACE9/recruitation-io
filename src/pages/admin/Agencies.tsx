// ============================================================
// Admin — review + approve/reject/suspend agencies
// ============================================================

import { useEffect, useState } from 'react';
import { listActiveAgencies, listPendingAgencies, setAgencyStatus } from '@/services/agencies';
import type { Agency } from '@/lib/types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/lib/toast';
import { formatRelative } from '@/lib/util';

export default function AdminAgencies() {
  const { toast } = useToast();
  const [tab, setTab] = useState<'pending' | 'active'>('pending');
  const [pending, setPending] = useState<Agency[]>([]);
  const [active, setActive] = useState<Agency[]>([]);

  async function refresh() {
    const [p, a] = await Promise.all([listPendingAgencies(), listActiveAgencies()]);
    setPending(p); setActive(a);
  }
  useEffect(() => { refresh(); }, []);

  async function decide(a: Agency, status: 'active' | 'suspended') {
    await setAgencyStatus(a.id, status);
    toast(`${a.name} → ${status}`, status === 'active' ? 'success' : 'warn');
    refresh();
  }

  const list = tab === 'pending' ? pending : active;

  return (
    <div className="stack stack-5">
      <header className="row-between">
        <div>
          <h2>Agencies</h2>
          <div className="muted small">Approve, suspend, or reinstate recruiting firms.</div>
        </div>
        <div className="row-flex">
          <Button variant={tab === 'pending' ? 'primary' : 'ghost'} size="sm" onClick={() => setTab('pending')}>
            Pending ({pending.length})
          </Button>
          <Button variant={tab === 'active' ? 'primary' : 'ghost'} size="sm" onClick={() => setTab('active')}>
            Active ({active.length})
          </Button>
        </div>
      </header>

      <div className="card">
        {list.length === 0 ? (
          <div className="t-center muted small" style={{ padding: 32 }}>
            {tab === 'pending' ? 'No pending requests.' : 'No active agencies.'}
          </div>
        ) : list.map((a) => (
          <div key={a.id} className="row" style={{ gap: 16 }}>
            <Avatar name={a.name} photoUrl={a.logoUrl} size="md" />
            <div className="flex-1">
              <div style={{ fontWeight: 600 }}>{a.name}</div>
              <div className="muted tiny">{a.email} · /{a.slug} · requested {formatRelative(typeof a.createdAt === 'number' ? a.createdAt : Date.now())}</div>
              {a.description && <div className="small" style={{ marginTop: 6 }}>{a.description}</div>}
            </div>
            <Badge kind={a.status === 'active' ? 'success' : a.status === 'pending' ? 'warn' : 'danger'}>{a.status}</Badge>
            {tab === 'pending' ? (
              <>
                <Button variant="danger" size="sm" onClick={() => decide(a, 'suspended')}>Reject</Button>
                <Button size="sm" onClick={() => decide(a, 'active')}>Approve</Button>
              </>
            ) : (
              <Button variant="danger" size="sm" onClick={() => decide(a, 'suspended')}>Suspend</Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
