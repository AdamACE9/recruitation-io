// ============================================================
// Candidate profile — view/edit name, photo, CV, LinkedIn, skills
// ============================================================

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateCandidate } from '@/services/candidates';
import { firebaseStorage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { useToast } from '@/lib/toast';

export default function Profile() {
  const { candidate } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(candidate?.name ?? '');
  const [phone, setPhone] = useState(candidate?.phone ?? '');
  const [language, setLanguage] = useState(candidate?.preferredLanguage ?? 'en');
  const [skills, setSkills] = useState((candidate?.skills ?? []).join(', '));
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!candidate) return;
    setSaving(true);
    try {
      await updateCandidate(candidate.uid, {
        name, phone, preferredLanguage: language,
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      toast('Profile saved', 'success');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Save failed', 'danger');
    } finally { setSaving(false); }
  }

  async function uploadDoc(kind: 'cvUrl' | 'linkedinUrl' | 'photoUrl', file: File) {
    if (!candidate) return;
    const storage = firebaseStorage();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '_');
    const r = ref(storage, `candidates/${candidate.uid}/${kind}-${Date.now()}-${safeName}`);
    const ct = file.type && file.type !== 'application/octet-stream'
      ? file.type
      : kind === 'photoUrl' ? 'image/jpeg' : 'application/pdf';
    await uploadBytes(r, file, { contentType: ct });
    const url = await getDownloadURL(r);
    await updateCandidate(candidate.uid, { [kind]: url } as never);
    toast(`${kind.replace('Url', '')} uploaded`, 'success');
  }

  if (!candidate) return <div className="muted">Loading…</div>;

  return (
    <div className="stack stack-5">
      <header><h2>My profile</h2></header>

      <div className="card">
        <div className="row-flex">
          <Avatar name={candidate.name} size="lg" photoUrl={candidate.photoUrl} />
          <div className="flex-1">
            <div style={{ fontWeight: 600, fontSize: 17 }}>{candidate.name}</div>
            <div className="muted small">{candidate.email}</div>
          </div>
          <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
            <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && uploadDoc('photoUrl', e.target.files[0])} />
            Change photo
          </label>
        </div>
      </div>

      <div className="grid-2">
        <Field label="Full name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Phone"><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
        <Field label="Preferred language">
          <Input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="e.g. English" />
        </Field>
        <Field label="Skills (comma-separated)">
          <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, SQL, leadership" />
        </Field>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="lbl-sm">CV</div>
          {candidate.cvUrl ? (
            <div className="row-between" style={{ marginTop: 8 }}>
              <a href={candidate.cvUrl} target="_blank" rel="noreferrer" className="link small">View current CV</a>
              <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
                <input type="file" accept=".pdf,application/pdf" hidden onChange={(e) => e.target.files?.[0] && uploadDoc('cvUrl', e.target.files[0])} />
                Replace
              </label>
            </div>
          ) : (
            <label className="btn btn-secondary btn-sm" style={{ marginTop: 8, cursor: 'pointer', display: 'inline-block' }}>
              <input type="file" accept=".pdf,application/pdf" hidden onChange={(e) => e.target.files?.[0] && uploadDoc('cvUrl', e.target.files[0])} />
              Upload CV
            </label>
          )}
        </div>

        <div className="card">
          <div className="lbl-sm">LinkedIn PDF export</div>
          {candidate.linkedinUrl ? (
            <div className="row-between" style={{ marginTop: 8 }}>
              <a href={candidate.linkedinUrl} target="_blank" rel="noreferrer" className="link small">View current export</a>
              <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
                <input type="file" accept=".pdf,application/pdf" hidden onChange={(e) => e.target.files?.[0] && uploadDoc('linkedinUrl', e.target.files[0])} />
                Replace
              </label>
            </div>
          ) : (
            <label className="btn btn-secondary btn-sm" style={{ marginTop: 8, cursor: 'pointer', display: 'inline-block' }}>
              <input type="file" accept=".pdf,application/pdf" hidden onChange={(e) => e.target.files?.[0] && uploadDoc('linkedinUrl', e.target.files[0])} />
              Upload LinkedIn PDF
            </label>
          )}
          <div className="muted tiny" style={{ marginTop: 8 }}>
            In LinkedIn → Profile → More → Save to PDF.
          </div>
        </div>
      </div>

      {(candidate.cvText || candidate.linkedinText) && (
        <div className="card">
          <div className="lbl-sm">AI-extracted summary</div>
          {candidate.cvText && <Textarea rows={5} value={candidate.cvText} readOnly style={{ marginTop: 8 }} />}
        </div>
      )}

      <div className="row-flex" style={{ justifyContent: 'flex-end' }}>
        <Button onClick={save} loading={saving}>Save changes</Button>
      </div>
    </div>
  );
}
