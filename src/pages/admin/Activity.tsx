// ============================================================
// Admin — platform-wide activity feed
// ============================================================

import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query, limit as qlim } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import type { CreditTransaction } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { formatRelative } from '@/lib/util';

export default function AdminActivity() {
  const [events, setEvents] = useState<CreditTransaction[]>([]);

  useEffect(() => {
    const q = query(collection(firebaseDb(), 'creditTransactions'), orderBy('createdAt', 'desc'), qlim(200));
    const off = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CreditTransaction, 'id'>) })));
    });
    return off;
  }, []);

  return (
    <div className="stack stack-5">
      <header>
        <h2>Activity</h2>
        <div className="muted small">Live ledger — every credit event on the platform.</div>
      </header>

      <div className="card">
        {events.length === 0 ? (
          <div className="t-center muted small" style={{ padding: 32 }}>No activity yet.</div>
        ) : events.map((e) => (
          <div key={e.id} className="row">
            <div className="pulse-dot" style={{ opacity: 0.3 }} />
            <div className="flex-1">
              <div style={{ fontWeight: 600 }}>{label(e.type)}</div>
              <div className="muted tiny">Agency {e.agencyId.slice(0, 8)}… · {formatRelative(typeof e.createdAt === 'number' ? e.createdAt : Date.now())}</div>
            </div>
            <Badge kind={e.amount > 0 ? 'success' : 'neutral'}>{e.amount > 0 ? '+' : ''}{e.amount}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function label(t: CreditTransaction['type']) {
  return {
    topup: 'Top-up',
    job_create: 'Job created',
    interview: 'Interview completed',
    approval: 'Candidate approved',
    refund: 'Refund',
  }[t];
}
