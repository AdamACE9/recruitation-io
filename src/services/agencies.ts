// ============================================================
// Agency service — signup, lookups, white-label resolution
// ============================================================

import {
  collection, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp,
  setDoc, updateDoc, where,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, type UserCredential } from 'firebase/auth';
import { firebaseAuth, firebaseDb, firebaseStorage } from '@/lib/firebase';
import type { Agency, AgencyStatus } from '@/lib/types';
import { slugify } from '@/lib/util';

export async function signupAgency(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  website?: string;
  description?: string;
  brandColor: string;
  logoFile?: File | null;
}): Promise<Agency> {
  const auth = firebaseAuth();
  const db = firebaseDb();
  const storage = firebaseStorage();

  const cred: UserCredential = await createUserWithEmailAndPassword(auth, input.email, input.password);
  const uid = cred.user.uid;

  let logoUrl: string | undefined;
  if (input.logoFile) {
    const r = ref(storage, `agencies/${uid}/logo.${(input.logoFile.name.split('.').pop() || 'png').toLowerCase()}`);
    await uploadBytes(r, input.logoFile, { contentType: input.logoFile.type });
    logoUrl = await getDownloadURL(r);
  }

  // Ensure unique slug.
  const baseSlug = slugify(input.name) || `agency-${uid.slice(0, 6)}`;
  const slug = await pickUniqueSlug(baseSlug);

  const agency: Agency = {
    id: uid,
    ownerUid: uid,
    name: input.name,
    slug,
    email: input.email,
    phone: input.phone,
    website: input.website,
    description: input.description,
    logoUrl,
    brandColor: input.brandColor,
    credits: 0,
    status: 'pending',
    createdAt: Date.now(),
  };

  await setDoc(doc(db, 'agencies', uid), {
    ...agency,
    createdAt: serverTimestamp(),
  });

  await setDoc(doc(db, 'agencies_by_slug', slug), { agencyId: uid });

  return agency;
}

async function pickUniqueSlug(base: string): Promise<string> {
  const db = firebaseDb();
  let attempt = base;
  for (let i = 0; i < 30; i++) {
    const snap = await getDoc(doc(db, 'agencies_by_slug', attempt));
    if (!snap.exists()) return attempt;
    attempt = `${base}-${Math.floor(Math.random() * 10000)}`;
  }
  throw new Error('Could not allocate unique slug');
}

export async function loginAgency(email: string, password: string) {
  return signInWithEmailAndPassword(firebaseAuth(), email, password);
}

export async function getAgency(id: string): Promise<Agency | null> {
  const snap = await getDoc(doc(firebaseDb(), 'agencies', id));
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as Omit<Agency, 'id'>) }) : null;
}

export async function getAgencyBySlug(slug: string): Promise<Agency | null> {
  const db = firebaseDb();
  const idx = await getDoc(doc(db, 'agencies_by_slug', slug));
  if (!idx.exists()) return null;
  const { agencyId } = idx.data() as { agencyId: string };
  return getAgency(agencyId);
}

export async function listPendingAgencies(): Promise<Agency[]> {
  const db = firebaseDb();
  const q = query(collection(db, 'agencies'), where('status', '==', 'pending' as AgencyStatus), orderBy('createdAt', 'desc'), limit(100));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Agency, 'id'>) }));
}

export async function listActiveAgencies(): Promise<Agency[]> {
  const db = firebaseDb();
  const q = query(collection(db, 'agencies'), where('status', '==', 'active' as AgencyStatus), orderBy('createdAt', 'desc'), limit(200));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Agency, 'id'>) }));
}

export async function setAgencyStatus(id: string, status: AgencyStatus) {
  const db = firebaseDb();
  const update: Record<string, unknown> = { status };
  if (status === 'active') update.approvedAt = Date.now();
  await updateDoc(doc(db, 'agencies', id), update);
}

export async function updateAgency(id: string, patch: Partial<Agency>) {
  await updateDoc(doc(firebaseDb(), 'agencies', id), patch as Record<string, unknown>);
}
