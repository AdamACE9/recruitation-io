// ============================================================
// Candidate service — signup, profile, file uploads
// ============================================================

import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseAuth, firebaseDb, firebaseFunctions, firebaseStorage } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import type { Candidate } from '@/lib/types';
import { safeSetDoc, safeUpdateDoc, stripUndefined } from '@/lib/firestore-safe';

export async function signupCandidate(input: {
  email: string; password: string;
  name: string; phone: string;
  cvFile?: File | null; linkedinFile?: File | null; photoFile?: File | null;
  preferredLanguage: string; skills?: string[];
}): Promise<Candidate> {
  const auth = firebaseAuth();
  const db = firebaseDb();
  const storage = firebaseStorage();

  const cred = await createUserWithEmailAndPassword(auth, input.email, input.password);
  const uid = cred.user.uid;

  const upload = async (f: File | null | undefined, name: string) => {
    if (!f) return undefined;
    // Strip path-unfriendly chars from the filename (parens, spaces, etc.) so the
    // Storage path is canonical and download URLs don't have to URL-encode oddly.
    const safeName = f.name.replace(/[^a-zA-Z0-9._-]+/g, '_');
    const r = ref(storage, `candidates/${uid}/${name}-${Date.now()}-${safeName}`);
    // Force a sensible contentType when the browser leaves it blank or sets a
    // generic value (Firefox / Edge sometimes report '' for PDFs whose names
    // include spaces or parens — that breaks contentType-checking storage rules).
    const inferred =
      f.type && f.type !== 'application/octet-stream'
        ? f.type
        : name === 'photo'
        ? 'image/jpeg'
        : 'application/pdf';
    await uploadBytes(r, f, { contentType: inferred });
    return getDownloadURL(r);
  };

  const [cvUrl, linkedinUrl, photoUrl] = await Promise.all([
    upload(input.cvFile, 'cv'),
    upload(input.linkedinFile, 'linkedin'),
    upload(input.photoFile, 'photo'),
  ]);

  const candidate: Candidate = {
    uid,
    name: input.name,
    email: input.email,
    phone: input.phone,
    // Only attach URL fields when an upload actually happened — Firestore
    // rejects `undefined` and we don't want to write `null`s either.
    ...(cvUrl ? { cvUrl } : {}),
    ...(linkedinUrl ? { linkedinUrl } : {}),
    ...(photoUrl ? { photoUrl } : {}),
    skills: input.skills ?? [],
    preferredLanguage: input.preferredLanguage,
    createdAt: Date.now(),
  };

  // Use the safe wrapper so any stray undefined never reaches Firestore — this is
  // the single most common cause of "Function setDoc() called with invalid data".
  await safeSetDoc(
    doc(db, 'candidates', uid),
    stripUndefined({ ...candidate, createdAt: serverTimestamp() }) as Record<string, unknown>,
  );

  // Trigger async PDF extraction (non-blocking best-effort)
  if (cvUrl || linkedinUrl) {
    const call = httpsCallable(firebaseFunctions(), 'extractCandidateDocs');
    call({ uid, cvUrl, linkedinUrl }).catch(() => {});
  }

  return candidate;
}

export async function loginCandidate(email: string, password: string) {
  return signInWithEmailAndPassword(firebaseAuth(), email, password);
}

export async function getCandidate(uid: string): Promise<Candidate | null> {
  const snap = await getDoc(doc(firebaseDb(), 'candidates', uid));
  return snap.exists() ? ({ uid: snap.id, ...(snap.data() as Omit<Candidate, 'uid'>) }) : null;
}

export async function updateCandidate(uid: string, patch: Partial<Candidate>) {
  await safeUpdateDoc(doc(firebaseDb(), 'candidates', uid), patch as Record<string, unknown>);
}
