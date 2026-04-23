// ============================================================
// RejectionModal — AI-drafted, editable, kind rejection composer
// ============================================================
import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { draftRejection } from '@/lib/features';
import type { Application } from '@/lib/types';

export function RejectionModal({ open, onClose, application, onSend }: {
  open: boolean;
  onClose: () => void;
  application: Application;
  onSend: (message: string) => Promise<void> | void;
}) {
  const [tone, setTone] = useState<'warm' | 'brief'>('warm');
  const [text, setText] = useState(() => draftRejection(application, 'warm'));
  const [sending, setSending] = useState(false);

  // regenerate when tone changes
  useEffect(() => { setText(draftRejection(application, tone)); }, [tone, application]);

  const strengths = useMemo(() => {
    const scores = application.report?.scores;
    if (!scores) return [] as string[];
    return Object.entries(scores)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 2)
      .map(([k]) => k);
  }, [application]);

  async function send() {
    setSending(true);
    try { await onSend(text); onClose(); } finally { setSending(false); }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Rejection message — ${application.candidateName}`}>
      <div className="stack stack-3">
        <div className="row-flex" style={{ gap: 8, alignItems: 'center' }}>
          <span className="lbl-sm" style={{ margin: 0 }}>Tone</span>
          {(['warm', 'brief'] as const).map((t) => (
            <button key={t}
              className={`btn btn-sm ${tone === t ? 'btn-primary' : 'btn-secondary'}`}
              type="button" onClick={() => setTone(t)}>{t === 'warm' ? 'Warm + constructive' : 'Brief + professional'}</button>
          ))}
          <div className="flex-1" />
          <Button size="sm" variant="ghost" type="button" onClick={() => setText(draftRejection(application, tone))}>Re-draft</Button>
        </div>

        {strengths.length > 0 && (
          <div className="muted small">
            AI will highlight their best axes ({strengths.map((s) => s).join(', ')}) and suggest a growth area, kindly.
          </div>
        )}

        <textarea
          className="input"
          rows={12}
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ fontFamily: 'var(--font-body)', lineHeight: 1.55 }}
        />

        <div className="row-between">
          <div className="muted tiny">{text.length} chars · editable before send</div>
          <div className="row-flex">
            <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
            <Button variant="danger" onClick={send} loading={sending} type="button">Send rejection</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
