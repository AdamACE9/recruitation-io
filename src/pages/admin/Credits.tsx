// ============================================================
// Admin — credit top-ups. Admin manually adds credits to agencies.
// ============================================================

import { useEffect, useState } from 'react';
import { listActiveAgencies } from '@/services/agencies';
import { recordCredit } from '@/services/credits';
import { useAuth } from '@/contexts/AuthContext';
import type { Agency } from '@/lib/types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { useToast } from '@/lib/toast';

export default function AdminCredits() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => { listActiveAgencies().then(setAgencies); }, []);

  async function topUp(a: Agency) {
    const amount = parseInt(amounts[a.id] ?? '0', 10);
    if (!amount || amount <= 0) { toast('Enter a positive amount', 'danger'); return; }
    setBusy(a.id);
    try {
      await recordCredit(a.id, amount, 'topup', user?.uid, notes[a.id] || 'Manual top-up by admin');
      toast(`+${amount} credits → ${a.name}`, 'success');
      setAgencies(await listActiveAgencies());
      setAmounts((x) => ({ ...x, [a.id]: '' }));
      setNotes((x) => ({ ...x, [a.id]: '' }));
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Top-up failed', 'danger');
    } finally { setBusy(null); }
  }

  const visible = agencies.filter((a) => !filter || a.name.toLowerCase().includes(filter.toLowerCase()) || a.email.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="stack stack-5">
      <header>
        <h2>Credit top-ups</h2>
        <div className="muted small">Manually credit active agencies after off-platform invoicing.</div>
      </header>

      <div className="card">
        <Input placeholder="Search agency…" value={filter} onChange={(e) => setFilter(e.target.value)} />
      </div>

      <div className="card">
        {visible.length === 0 ? (
          <div className="t-center muted small" style={{ padding: 24 }}>No agencies match.</div>
        ) : visible.map((a) => (
          <div key={a.id} className="row" style={{ alignItems: 'center' }}>
            <Avatar name={a.name} photoUrl={a.logoUrl} />
            <div className="flex-1">
              <div style={{ fontWeight: 600 }}>{a.name}</div>
              <div className="muted tiny">{a.email}</div>
            </div>
            <div className="mono small" style={{ minWidth: 80, textAlign: 'right' }}>{a.credits} credits</div>
            <Input
              style={{ width: 100 }}
              type="number"
              placeholder="Amount"
              value={amounts[a.id] ?? ''}
              onChange={(e) => setAmounts((x) => ({ ...x, [a.id]: e.target.value }))}
            />
            <Input
              style={{ width: 160 }}
              placeholder="Note (invoice #)"
              value={notes[a.id] ?? ''}
              onChange={(e) => setNotes((x) => ({ ...x, [a.id]: e.target.value }))}
            />
            <Button size="sm" loading={busy === a.id} onClick={() => topUp(a)}>Top up</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
