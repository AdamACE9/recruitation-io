// ============================================================
// Post-interview thank-you page — shows while AI report generates
// ============================================================

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { listenApplication } from '@/services/applications';
import type { Application } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function ThankYou() {
  const { id } = useParams();
  const [app, setApp] = useState<Application | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!id) return;
    const off = listenApplication(id, setApp);
    const tick = setInterval(() => setElapsed((t) => t + 1), 1000);
    return () => { off(); clearInterval(tick); };
  }, [id]);

  const analysed = !!app?.report;
  const finalised = app?.status === 'approved' || app?.status === 'rejected';

  return (
    <div className="container-narrow" style={{ padding: '80px 24px', minHeight: '80vh' }}>
      <div className="t-center">
        <div style={{
          width: 80, height: 80, borderRadius: '50%', background: 'var(--brand-50)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, marginBottom: 24,
        }}>✓</div>
        <h1 style={{ marginBottom: 12 }}>Interview complete</h1>
        <p className="muted" style={{ fontSize: 17, lineHeight: 1.6, maxWidth: 520, margin: '0 auto' }}>
          Thank you for taking the time. Our AI is now reviewing your interview, cross-checking
          institutions, and scoring your fit. You'll be notified through your candidate portal.
        </p>
      </div>

      <div className="card" style={{ marginTop: 48 }}>
        <div className="stack stack-3">
          <StatusRow label="Interview recorded" done />
          <StatusRow label="Transcript generated" done={elapsed > 2} />
          <StatusRow label="Cross-referencing CV & LinkedIn" done={elapsed > 6} />
          <StatusRow label="Institution verification" done={elapsed > 10} />
          <StatusRow label="Final scoring & recommendation" done={analysed} pulse={!analysed && elapsed > 10} />
          <StatusRow label="Reviewer decision" done={finalised} pulse={analysed && !finalised} />
        </div>
      </div>

      <div className="row-flex" style={{ marginTop: 32, justifyContent: 'center' }}>
        <Link to="/me"><Button variant="secondary">View my applications</Button></Link>
        <Link to="/jobs-open"><Button>Browse more roles</Button></Link>
      </div>

      {finalised && (
        <div className="card" style={{ marginTop: 30, background: app?.status === 'approved' ? 'var(--success-bg)' : 'var(--danger-bg)' }}>
          <div className="row-between">
            <div>
              <div className="lbl-sm">Decision</div>
              <div style={{ marginTop: 6, fontWeight: 600 }}>
                {app?.status === 'approved' ? 'You have been selected to move forward!' : 'Not a match this time — keep going.'}
              </div>
            </div>
            <Badge kind={app?.status === 'approved' ? 'success' : 'danger'}>{app?.status}</Badge>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusRow({ label, done, pulse }: { label: string; done?: boolean; pulse?: boolean }) {
  return (
    <div className="row-flex">
      <div style={{
        width: 22, height: 22, borderRadius: '50%',
        background: done ? 'var(--brand)' : 'var(--surface-2)',
        color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, flexShrink: 0,
        boxShadow: pulse ? '0 0 0 0 var(--brand-200)' : undefined,
        animation: pulse ? 'pulse 1.5s infinite' : undefined,
      }}>{done ? '✓' : pulse ? '…' : ''}</div>
      <div style={{ opacity: done ? 1 : pulse ? 1 : 0.5 }}>{label}</div>
    </div>
  );
}
