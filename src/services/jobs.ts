// ============================================================
// Jobs service — create, list, update, test questions
// ============================================================

import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy,
  query, serverTimestamp, setDoc, updateDoc, where, limit as qlim,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseDb, firebaseFunctions, firebaseStorage } from '@/lib/firebase';
import type { Job, JobConfig, JobStatus, TestQuestion } from '@/lib/types';
import { CREDIT_COSTS } from '@/lib/types';
import { httpsCallable } from 'firebase/functions';
import { slugify, randomId } from '@/lib/util';
import { makeShortCode } from '@/lib/features';
import { recordCredit } from './credits';

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
    const r = ref(storage, `jobs/${slug}/handbook/${id}-${input.handbookFile.name}`);
    await uploadBytes(r, input.handbookFile, { contentType: input.handbookFile.type });
    handbookUrl = await getDownloadURL(r);
    handbookFileName = input.handbookFile.name;
  }

  const job: Job = {
    id: '',
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

  const docRef = await addDoc(collection(db, 'jobs'), { ...job, createdAt: serverTimestamp() });
  const created = { ...job, id: docRef.id };
  // deduct credits
  await recordCredit(input.agencyId, -CREDIT_COSTS.jobCreate, 'job_create', input.actorUid, `Created job ${input.title}`);

  return created;
}

export async function updateJob(id: string, patch: Partial<Job>) {
  await updateDoc(doc(firebaseDb(), 'jobs', id), patch as Record<string, unknown>);
}

export async function setJobStatus(id: string, status: JobStatus) {
  await updateJob(id, { status });
}

export async function getJob(id: string): Promise<Job | null> {
  const snap = await getDoc(doc(firebaseDb(), 'jobs', id));
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as Omit<Job, 'id'>) }) : null;
}

export async function listJobsByAgency(agencyId: string): Promise<Job[]> {
  const db = firebaseDb();
  const q = query(collection(db, 'jobs'), where('agencyId', '==', agencyId), orderBy('createdAt', 'desc'), qlim(100));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Job, 'id'>) }));
}

export async function listActiveJobsByAgency(agencyId: string): Promise<Job[]> {
  const jobs = await listJobsByAgency(agencyId);
  return jobs.filter((j) => j.status === 'active');
}

export async function listPublicJobs(): Promise<Job[]> {
  const db = firebaseDb();
  const q = query(collection(db, 'jobs'), where('status', '==', 'active' as JobStatus), orderBy('createdAt', 'desc'), qlim(50));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Job, 'id'>) }));
}

/** Resolve a short share-code to its full job. Used by /s/:code redirect. */
export async function getJobByShortCode(code: string): Promise<Job | null> {
  const db = firebaseDb();
  const q = query(collection(db, 'jobs'), where('shortCode', '==', code), qlim(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...(d.data() as Omit<Job, 'id'>) };
}

// ---- Test questions (sub-collection) ----

export async function addTestQuestion(jobId: string, q: Omit<TestQuestion, 'id'>, imageFile?: File | null): Promise<TestQuestion> {
  const db = firebaseDb();
  const storage = firebaseStorage();
  const id = randomId(8);
  let imageUrl: string | undefined;
  if (imageFile) {
    const r = ref(storage, `jobs/${jobId}/tests/${id}-${imageFile.name}`);
    await uploadBytes(r, imageFile, { contentType: imageFile.type });
    imageUrl = await getDownloadURL(r);
  }
  const full: TestQuestion = { ...q, id, imageUrl: imageUrl ?? q.imageUrl ?? null };
  await setDoc(doc(db, 'jobs', jobId, 'testQuestions', id), full);
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
