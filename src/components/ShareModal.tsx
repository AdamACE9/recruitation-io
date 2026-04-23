// ============================================================
// ShareModal — one-click share (short URL, QR, socials)
// ============================================================
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/lib/toast';

export function ShareModal({
  open, onClose, jobTitle, publicUrl, shortCode,
}: {
  open: boolean;
  onClose: () => void;
  jobTitle: string;
  publicUrl: string;
  shortCode?: string;
}) {
  const { toast } = useToast();
  const [tab, setTab] = useState<'link' | 'qr' | 'message'>('link');
  const base = typeof window === 'undefined' ? '' : window.location.origin;
  const shortUrl = shortCode ? `${base}/s/${shortCode}` : publicUrl;

  const shareMsg = `We're hiring for ${jobTitle}. First interview takes ~10 minutes, fully online — and you can do it whenever suits you. Apply here: ${shortUrl}`;

  function copy(text: string, label: string) {
    navigator.clipboard?.writeText(text).then(() => toast(`${label} copied`, 'success'));
  }

  return (
    <Modal open={open} onClose={onClose} title="Share this job">
      <div className="row-flex" style={{ gap: 6, marginBottom: 14 }}>
        {(['link', 'qr', 'message'] as const).map((t) => (
          <button
            key={t}
            className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab(t)}
            type="button"
          >{t === 'link' ? 'Short link' : t === 'qr' ? 'QR code' : 'Message'}</button>
        ))}
      </div>

      {tab === 'link' && (
        <div className="stack stack-3">
          <div>
            <div className="lbl-sm">Short link</div>
            <div className="row-flex" style={{ gap: 8, marginTop: 6 }}>
              <input className="input flex-1 mono" readOnly value={shortUrl} onFocus={(e) => e.currentTarget.select()} />
              <Button size="sm" onClick={() => copy(shortUrl, 'Short link')}>Copy</Button>
            </div>
          </div>
          <div>
            <div className="lbl-sm">Full public URL</div>
            <div className="row-flex" style={{ gap: 8, marginTop: 6 }}>
              <input className="input flex-1 mono small" readOnly value={publicUrl} onFocus={(e) => e.currentTarget.select()} />
              <Button size="sm" variant="secondary" onClick={() => copy(publicUrl, 'URL')}>Copy</Button>
            </div>
          </div>
          <div className="row-flex" style={{ gap: 8, flexWrap: 'wrap' }}>
            <a className="btn btn-secondary btn-sm" target="_blank" rel="noreferrer"
               href={`https://wa.me/?text=${encodeURIComponent(shareMsg)}`}>WhatsApp</a>
            <a className="btn btn-secondary btn-sm" target="_blank" rel="noreferrer"
               href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shortUrl)}`}>LinkedIn</a>
            <a className="btn btn-secondary btn-sm"
               href={`mailto:?subject=${encodeURIComponent(`Job opening: ${jobTitle}`)}&body=${encodeURIComponent(shareMsg)}`}>Email</a>
            <a className="btn btn-secondary btn-sm" target="_blank" rel="noreferrer"
               href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMsg)}`}>X / Twitter</a>
          </div>
        </div>
      )}

      {tab === 'qr' && (
        <div className="stack stack-3 t-center">
          <RealQR text={shortUrl} />
          <div className="muted small">Scan to open the application page directly.</div>
          <div className="mono tiny muted">{shortUrl}</div>
          <Button size="sm" variant="secondary" onClick={() => copy(shortUrl, 'Short link')}>Copy link</Button>
        </div>
      )}

      {tab === 'message' && (
        <div className="stack stack-3">
          <div className="lbl-sm">Ready-to-send message</div>
          <textarea className="input" rows={6} readOnly value={shareMsg} onFocus={(e) => e.currentTarget.select()} />
          <div className="row-flex">
            <Button size="sm" onClick={() => copy(shareMsg, 'Message')}>Copy message</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function RealQR({ text }: { text: string }) {
  const [svg, setSvg] = useState<string>('');
  useEffect(() => {
    let cancelled = false;
    QRCode.toString(text, {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 2,
      color: { dark: '#0f4a24', light: '#ffffff' },
      width: 240,
    }).then((s) => { if (!cancelled) setSvg(s); }).catch(() => {});
    return () => { cancelled = true; };
  }, [text]);
  if (!svg) return <div className="muted small" style={{ padding: 60 }}>Generating QR…</div>;
  return (
    <div
      style={{ width: 240, height: 240, margin: '0 auto', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
