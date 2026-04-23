// ============================================================
// Candidate service — signup, profile, file uploads
// ============================================================

import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, serverTimestamp, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseAuth, firebaseDb, firebaseFunctions, firebaseStorage } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import type { Candidate } from '@/lib/types';

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
    const r = ref(storage, `candidates/${uid}/${name}-${Date.now()}-${f.name}`);
    await uploadBytes(r, f, { contentType: f.type });
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
    cvUrl, linkedinUrl, photoUrl,
    skills: input.skills ?? [],
    preferredLanguage: input.preferredLanguage,
    createdAt: Date.now(),
  };

  await setDoc(doc(db, 'candidates', uid), { ...candidate, createdAt: serverTimestamp() });

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
  await updateDoc(doc(firebaseDb(), 'candidates', uid), patch as Record<string, unknown>);
}
