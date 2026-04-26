// ============================================================
// Jobs service — create, list, update, test questions
// ============================================================

import {
  collection, deleteDoc, doc, getDoc, getDocs, orderBy,
  query, serverTimestamp, where, limit as qlim,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseDb, firebaseFunctions, firebaseStorage } from '@/lib/firebase';
import type { Job, JobConfig, JobStatus, TestQuestion } from '@/lib/types';
import { CREDIT_COSTS } from '@/lib/types';
import { httpsCallable } from 'firebase/functions';
import { slugify, randomId } from '@/lib/util';
import { makeShortCode } from '@/lib/features';
import { recordCredit } from './credits';
import { safeAddDoc, safeSetDoc, safeUpdateDoc } from '@/lib/firestore-safe';

export async function createJob(input: {
  agencyId: string;
  title: string;
  method: 'form' | 'pdf';
  config: JobConfig;
  handbookFile?: File | null;
  actorUid: string;
}): Promise<Job> {
  const db = firebaseDb();
  const storage = firebaseStorage();
  const slugBase = slugify(input.title) || 'job';
  const slug = `${slugBase}-${randomId(5)}`;
  const shortCode = makeShortCode();
  const now = Date.now();

  // Upload handbook if provided
  let handbookUrl: string | undefined;
  let handbookFileName: string | undefined;
  if (input.handbookFile) {
    const id = randomId(8);
    const safeFileName = input.handbookFile.name.replace(/[^a-zA-Z0-9._-]+/g, '_');
    const r = ref(storage, `jobs/${slug}/handbook/${id}-${safeFileName}`);
    const ct = input.handbookFile.type && input.handbookFile.type !== 'application/octet-stream'
      ? input.handbookFile.type
      : 'application/pdf';
    await uploadBytes(r, input.handbookFile, { contentType: ct });
    handbookUrl = await getDownloadURL(r);
    handbookFileName = input.handbookFile.name;
  }

  // Build the persisted shape WITHOUT an `id` field. Storing `id: ''` and then
  // doing `{ id: d.id, ...d.data() }` on reads caused the data spread to
  // OVERWRITE the doc id with empty string, which then propagated through to
  // application.jobId and broke prepareInterview with "documentPath must be a
  // non-empty string". The doc id is only known to Firestore — never store it.
  const jobData: Omit<Job, 'id'> = {
    agencyId: input.agencyId,
    title: input.title,
    slug,
    status: 'active',
    method: input.method,
    jobConfig: input.config,
    createdAt: now,
    applicantCount: 0,
    interviewCount: 0,
    lastActivityAt: now,
    shortCode,
    ...(handbookUrl ? { handbookUrl, handbookFileName } : {}),
  };

  const docRef = await safeAddDoc(collection(db, 'jobs'), { ...jobData, createdAt: serverTimestamp() });
  const created: Job = { ...jobData, id: docRef.id };
  // deduct credits
  await recordCredit(input.agencyId, -CREDIT_COSTS.jobCreate, 'job_create', input.actorUid, `Created job ${input.title}`);

  return created;
}

export async function updateJob(id: string, patch: Partial<Job>) {
  await safeUpdateDoc(doc(firebaseDb(), 'jobs', id), patch as Record<string, unknown>);
}

export async function setJobStatus(id: string, status: JobStatus) {
  await updateJob(id, { status });
}

// IMPORTANT: in all of the following readers, `id: snap.id` is spread LAST so it
// always overrides any `id` field present in the stored document body. Older
// `createJob` versions persisted `id: ''`; without this defensive ordering,
// every read would zero-out the doc id and corrupt downstream lookups (e.g.
// applications written with `jobId: ''` then prepareInterview throwing
// "documentPath must be a non-empty string").

export async function getJob(id: string): Promise<Job | null> {
  const snap = await getDoc(doc(firebaseDb(), 'jobs', id));
  return snap.exists() ? ({ ...(snap.data() as Omit<Job, 'id'>), id: snap.id }) : null;
}

export async function listJobsByAgency(agencyId: string): Promise<Job[]> {
  const db = firebaseDb();
  const q = query(collection(db, 'jobs'), where('agencyId', '==', agencyId), orderBy('createdAt', 'desc'), qlim(100));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...(d.data() as Omit<Job, 'id'>), id: d.id }));
}

export async function listActiveJobsByAgency(agencyId: string): Promise<Job[]> {
  const jobs = await listJobsByAgency(agencyId);
  return jobs.filter((j) => j.status === 'active');
}

export async function listPublicJobs(): Promise<Job[]> {
  const db = firebaseDb();
  const q = query(collection(db, 'jobs'), where('status', '==', 'active' as JobStatus), orderBy('createdAt', 'desc'), qlim(50));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...(d.data() as Omit<Job, 'id'>), id: d.id }));
}

/** Resolve an agencyId + slug pair to a single active job. Used by the public candidate portal.
 *  Uses only a slug equality filter (no orderBy) to avoid requiring a composite index. */
export async function getActiveJobBySlug(agencyId: string, slug: string): Promise<Job | null> {
  const db = firebaseDb();
  // Filter by slug only — single equality filter needs no composite index.
  // Verify agencyId + status in code to prevent cross-agency slug collisions.
  const q = query(
    collection(db, 'jobs'),
    where('slug', '==', slug),
    qlim(5),
  );
  const snap = await getDocs(q);
  // Spread data first so `id: d.id` always wins over any stale `id` in the doc body.
  const match = snap.docs
    .map((d) => ({ ...(d.data() as Omit<Job, 'id'>), id: d.id }))
    .find((j) => j.agencyId === agencyId && j.status === 'active');
  return match ?? null;
}

/** Resolve a short share-code to its full job. Used by /s/:code redirect. */
export async function getJobByShortCode(code: string): Promise<Job | null> {
  const db = firebaseDb();
  const q = query(collection(db, 'jobs'), where('shortCode', '==', code), qlim(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { ...(d.data() as Omit<Job, 'id'>), id: d.id };
}

// ---- Test questions (sub-collection) ----

export async function addTestQuestion(jobId: string, q: Omit<TestQuestion, 'id'>, imageFile?: File | null): Promise<TestQuestion> {
  const db = firebaseDb();
  const storage = firebaseStorage();
  const id = randomId(8);
  let imageUrl: string | undefined;
  if (imageFile) {
    const safeFileName = imageFile.name.replace(/[^a-zA-Z0-9._-]+/g, '_');
    const r = ref(storage, `jobs/${jobId}/tests/${id}-${safeFileName}`);
    const ct = imageFile.type && imageFile.type !== 'application/octet-stream'
      ? imageFile.type
      : 'image/jpeg';
    await uploadBytes(r, imageFile, { contentType: ct });
    imageUrl = await getDownloadURL(r);
  }
  const full: TestQuestion = { ...q, id, imageUrl: imageUrl ?? q.imageUrl ?? null };
  await safeSetDoc(doc(db, 'jobs', jobId, 'testQuestions', id), full as unknown as Record<string, unknown>);
  return full;
}

export async function listTestQuestions(jobId: string): Promise<TestQuestion[]> {
  const db = firebaseDb();
  const snap = await getDocs(collection(db, 'jobs', jobId, 'testQuestions'));
  return snap.docs.map((d) => ({ ...(d.data() as TestQuestion) }));
}

export async function deleteTestQuestion(jobId: string, qId: string) {
  await deleteDoc(doc(firebaseDb(), 'jobs', jobId, 'testQuestions', qId));
}

// ---- PDF extraction — delegated to Firebase Function ----
export async function extractJobFromPdf(dataUrl: string): Promise<Partial<JobConfig> & { title?: string }> {
  const call = httpsCallable<{ pdfDataUrl: string }, Partial<JobConfig> & { title?: string }>(
    firebaseFunctions(),
    'extractJobFromPdf',
  );
  const res = await call({ pdfDataUrl: dataUrl });
  return res.data;
}
