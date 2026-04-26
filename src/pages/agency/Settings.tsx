// ============================================================
// Agency settings — brand, contact info, public URL
// ============================================================

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateAgency } from '@/services/agencies';
import { firebaseStorage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { applyBrand } from '@/lib/theme';
import { isValidHexColor } from '@/lib/util';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { useToast } from '@/lib/toast';

export default function Settings() {
  const { agency } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(agency?.name ?? '');
  const [phone, setPhone] = useState(agency?.phone ?? '');
  const [website, setWebsite] = useState(agency?.website ?? '');
  const [description, setDescription] = useState(agency?.description ?? '');
  const [brand, setBrand] = useState(agency?.brandColor ?? '#1a7a3c');
  const [logoUrl, setLogoUrl] = useState(agency?.logoUrl ?? '');
  const [saving, setSaving] = useState(false);

  async function uploadLogo(file: File) {
    if (!agency) return;
    try {
      const storage = firebaseStorage();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]+/g, '_');
      const r = ref(storage, `agencies/${agency.id}/logo-${Date.now()}-${safeFileName}`);
      const ct = file.type && file.type !== 'application/octet-stream' ? file.type : 'image/png';
      await uploadBytes(r, file, { contentType: ct });
      const url = await getDownloadURL(r);
      setLogoUrl(url);
      await updateAgency(agency.id, { logoUrl: url });
      toast('Logo updated', 'success');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Logo upload failed', 'danger');
    }
  }

  async function save() {
    if (!agency) return;
    if (!isValidHexColor(brand)) { toast('Invalid brand color', 'danger'); return; }
    setSaving(true);
    try {
      await updateAgency(agency.id, { name, phone, website, description, brandColor: brand });
      applyBrand(brand);
      toast('Settings saved', 'success');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Save failed', 'danger');
    } finally { setSaving(false); }
  }

  if (!agency) return null;
  const publicUrl = `${location.origin}/${agency.slug}`;

  return (
    <div className="stack stack-5">
      <header><h2>Settings</h2></header>

      <div className="card">
        <div className="lbl-sm">Your public page</div>
        <div className="row-between" style={{ marginTop: 8 }}>
          <a href={publicUrl} target="_blank" rel="noreferrer" className="link mono small">{publicUrl}</a>
          <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(publicUrl); toast('Link copied', 'success'); }}>
            Copy
          </Button>
        </div>
      </div>

      <div className="card">
        <div className="lbl-sm" style={{ marginBottom: 12 }}>Branding</div>
        <div className="row-flex">
          <Avatar name={name || agency.name} photoUrl={logoUrl} size="lg" />
          <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
            <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])} />
            Upload new logo
          </label>
        </div>
        <div className="grid-2" style={{ marginTop: 16 }}>
          <Field label="Brand colour (hex)">
            <div className="row-flex">
              <Input value={brand} onChange={(e) => setBrand(e.target.value)} />
              <input type="color" value={brand} onChange={(e) => setBrand(e.target.value)} style={{ width: 44, height: 40, padding: 0, border: '1px solid var(--border)', borderRadius: 8 }} />
            </div>
          </Field>
          <Field label="Preview">
            <div style={{ background: brand, color: '#fff', padding: 12, borderRadius: 10, textAlign: 'center', fontWeight: 600 }}>
              Sample button
            </div>
          </Field>
        </div>
      </div>

      <div className="card stack stack-3">
        <div className="lbl-sm">Agency details</div>
        <Field label="Agency name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <div className="grid-2">
          <Field label="Phone"><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
          <Field label="Website"><Input value={website} onChange={(e) => setWebsite(e.target.value)} /></Field>
        </div>
        <Field label="Short description">
          <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
      </div>

      <div className="row-flex" style={{ justifyContent: 'flex-end' }}>
        <Button onClick={save} loading={saving}>Save changes</Button>
      </div>
    </div>
  );
}
