// ============================================================
// Post-interview institution verification
// Candidate confirms/corrects institution names extracted by AI
// ============================================================

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { firebaseFunctions } from '@/lib/firebase';
import { getApplication, updateApplication, triggerAnalysis } from '@/services/applications';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/lib/toast';

interface Institution {
  name: string;
  confirmed: boolean | null;   // null = not answered, true = confirmed, false = wrong
  correction: string;
}

export default function Verify() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const app = await getApplication(id);
        if (!app) { nav(`/thanks/${id}`); return; }

        if (!app.transcriptOriginal?.trim()) {
          // No transcript — skip straight to thanks, trigger analysis
          await triggerAnalysis(id);
          nav(`/thanks/${id}`);
          return;
        }

        const call = httpsCallable<{ applicationId: string }, { institutions: string[] }>(
          firebaseFunctions(),
          'extractInstitutions',
        );
        const res = await call({ applicationId: id });
        const names = res.data.institutions ?? [];
        setInstitutions(names.map((name) => ({ name, confirmed: null, correction: '' })));
      } catch (e) {
        console.warn('[Verify] extraction failed:', e instanceof Error ? e.message : e);
        // On error, still proceed (skip verifications)
      }
      setLoading(false);
    })();
  }, [id]);

  function handleConfirm(i: number) {
    setInstitutions((prev) => prev.map((inst, idx) => idx === i ? { ...inst, confirmed: true } : inst));
    setEditingIdx(null);
  }

  function handleWrong(i: number) {
    setInstitutions((prev) => prev.map((inst, idx) => idx === i ? { ...inst, confirmed: false } : inst));
    setEditingIdx(i);
  }

  function handleCorrection(i: number, value: string) {
    setInstitutions((prev) => prev.map((inst, idx) => idx === i ? { ...inst, correction: value } : inst));
  }

  function handleSaveCorrection(i: number) {
    setInstitutions((prev) => prev.map((inst, idx) =>
      idx === i && inst.correction.trim() ? { ...inst, confirmed: false } : inst,
    ));
    setEditingIdx(null);
  }

  async function handleSubmit() {
    if (!id) return;
    setSaving(true);
    try {
      const verifications = institutions.map((inst) => ({
        name: inst.confirmed === false && inst.correction.trim() ? inst.correction.trim() : inst.name,
        originalName: inst.name,
        confirmed: inst.confirmed === true,
        corrected: inst.confirmed === false && inst.correction.trim() ? inst.correction.trim() : null,
      }));

      await updateApplication(id, { institutionVerifications: verifications } as any);
      await triggerAnalysis(id);
      nav(`/thanks/${id}`);
    } catch (e) {
      toast('Could not save verifications — proceeding anyway', 'warn');
      try { await triggerAnalysis(id); } catch { /* best-effort */ }
      nav(`/thanks/${id}`);
    } finally {
      setSaving(false);
    }
  }

  const allAnswered = institutions.length === 0 || institutions.every(
    (inst) => inst.confirmed === true || (inst.confirmed === false && inst.correction.trim()),
  );
  const btnLabel = loading
    ? 'Analysing…'
    : institutions.length === 0
    ? 'Continue'
    : allAnswered
    ? 'Submit & continue'
    : 'Skip & continue';

  return (
    <div className="container-narrow" style={{ padding: '60px 24px', minHeight: '80vh' }}>
      <div className="t-center" style={{ marginBottom: 32 }}>
        <h2>One last step</h2>
        <p className="muted" style={{ marginTop: 8, maxWidth: 480, margin: '8px auto 0' }}>
          We spotted these institutions in your interview. Please confirm or correct them so our
          AI can verify your background accurately.
        </p>
      </div>

      {loading && (
        <div className="card t-center" style={{ padding: 40 }}>
          <div className="pulse-dot" style={{ margin: '0 auto 12px' }} />
          <div className="muted small">Analysing your interview transcript…</div>
        </div>
      )}

      {!loading && institutions.length === 0 && (
        <div className="card t-center" style={{ padding: 32 }}>
          <div className="muted small">No institutions were identified in your interview.</div>
        </div>
      )}

      {!loading && institutions.map((inst, i) => (
        <div key={i} className="card" style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{inst.name}</div>

          {inst.confirmed === true ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--brand-50)', color: 'var(--brand)', borderRadius: 999, padding: '4px 12px', fontSize: 13, fontWeight: 600 }}>
              ✓ Confirmed
            </div>
          ) : inst.confirmed === false && editingIdx !== i && inst.correction.trim() ? (
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff7ed', color: '#b45309', borderRadius: 999, padding: '4px 12px', fontSize: 13, fontWeight: 600 }}>
                ✏ Corrected: {inst.correction}
              </div>
              <button className="btn btn-ghost btn-sm" style={{ marginLeft: 8 }} onClick={() => setEditingIdx(i)}>Edit</button>
            </div>
          ) : editingIdx === i ? (
            <div className="row-flex" style={{ gap: 8, flexWrap: 'wrap' }}>
              <input
                type="text"
                className="input"
                placeholder="Enter correct institution name…"
                value={inst.correction}
                onChange={(e) => handleCorrection(i, e.target.value)}
                style={{ flex: 1, minWidth: 200 }}
                autoFocus
              />
              <Button size="sm" onClick={() => handleSaveCorrection(i)} disabled={!inst.correction.trim()}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingIdx(null)}>Cancel</Button>
            </div>
          ) : (
            <div className="row-flex" style={{ gap: 8, flexWrap: 'wrap' }}>
              <Button size="sm" onClick={() => handleConfirm(i)}>✓ Yes, correct</Button>
              <Button size="sm" variant="danger" onClick={() => handleWrong(i)}>✗ This is wrong</Button>
            </div>
          )}
        </div>
      ))}

      <div style={{ marginTop: 24 }}>
        <Button size="lg" block loading={saving} onClick={handleSubmit}>
          {btnLabel}
        </Button>
        <div className="muted tiny t-center" style={{ marginTop: 10 }}>
          You can skip this — it won't affect your application
        </div>
      </div>
    </div>
  );
}
