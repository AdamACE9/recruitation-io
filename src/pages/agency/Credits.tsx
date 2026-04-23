// ============================================================
// Agency credits — view balance, history, request top-up
// Top-up is manual via admin; here we surface a clean ledger.
// ============================================================

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { listCreditHistory } from '@/services/credits';
import type { CreditTransaction } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatRelative } from '@/lib/util';

const PACKS = [
  { credits: 50, price: 49, note: '~10 jobs or 40 interviews' },
  { credits: 200, price: 169, bestFor: 'boutique agencies', note: 'Saves 14%' },
  { credits: 500, price: 379, bestFor: 'growing desks', note: 'Saves 23%' },
  { credits: 1500, price: 999, bestFor: 'enterprise', note: 'Saves 33%' },
];

export default function Credits() {
  const { agency } = useAuth();
  const [history, setHistory] = useState<CreditTransaction[]>([]);

  useEffect(() => {
    if (!agency) return;
    listCreditHistory(agency.id, 100).then(setHistory);
  }, [agency]);

  if (!agency) return null;

  const burn30 = history
    .filter((t) => t.amount < 0 && Date.now() - (typeof t.createdAt === 'number' ? t.createdAt : Date.now()) < 30 * 86400_000)
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  const runwayDays = burn30 > 0 ? Math.floor(agency.credits / (burn30 / 30)) : Infinity;

  return (
    <div className="stack stack-5">
      <header className="row-between">
        <div>
          <h2>Credits</h2>
          <div className="muted small">1 interview = 5 credits · 1 job creation = 10 credits · 1 approval = 2 credits</div>
        </div>
      </header>

      <div className="grid-3">
        <div className="card metric t-center">
          <div className="metric-n" style={{ color: 'var(--brand)' }}>{agency.credits}</div>
          <div className="metric-l">Credits available</div>
        </div>
        <div className="card metric t-center">
          <div className="metric-n">{burn30}</div>
          <div className="metric-l">Burn · last 30 days</div>
        </div>
        <div className="card metric t-center">
          <div className="metric-n">{Number.isFinite(runwayDays) ? `${runwayDays}d` : '∞'}</div>
          <div className="metric-l">Runway at current burn</div>
        </div>
      </div>

      <section>
        <div className="lbl-sm" style={{ marginBottom: 12 }}>Top-up packs</div>
        <div className="grid-4">
          {PACKS.map((p) => (
            <div key={p.credits} className="card t-center" style={{ position: 'relative' }}>
              {p.bestFor && (
                <div className="chip" style={{ position: 'absolute', top: 12, right: 12, fontSize: 10 }}>
                  {p.bestFor}
                </div>
              )}
              <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--brand)' }}>{p.credits}</div>
              <div className="muted small">credits</div>
              <div style={{ marginTop: 14, fontSize: 22, fontWeight: 600 }}>${p.price}</div>
              <div className="muted tiny" style={{ marginTop: 4 }}>{p.note}</div>
              <Button block style={{ marginTop: 14 }} onClick={() => alert('Contact your Recruitation partner to activate.')}>
                Top up
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="lbl-sm" style={{ marginBottom: 12 }}>Transaction history</div>
        <div className="card">
          {history.length === 0 ? (
            <div className="t-center muted small" style={{ padding: 24 }}>No transactions yet.</div>
          ) : history.map((t) => (
            <div key={t.id} className="row">
              <div className="flex-1">
                <div style={{ fontWeight: 600 }}>{label(t.type)}</div>
                {t.note && <div className="muted tiny">{t.note}</div>}
              </div>
              <div className="muted tiny">{formatRelative(typeof t.createdAt === 'number' ? t.createdAt : Date.now())}</div>
              <Badge kind={t.amount > 0 ? 'success' : 'neutral'}>
                {t.amount > 0 ? '+' : ''}{t.amount}
              </Badge>
            </div>
          ))}
        </div>
      </section>
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
