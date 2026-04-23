// ============================================================
// Applications service — create, read, list, approve/reject
// ============================================================

import {
  addDoc, collection, doc, getDoc, getDocs, onSnapshot, orderBy, query,
  serverTimestamp, updateDoc, where, limit as qlim,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { firebaseDb, firebaseFunctions } from '@/lib/firebase';
import type { Application, ApplicationStatus } from '@/lib/types';
import { recordCredit } from './credits';

export async function createApplication(input: {
  agencyId: string;
  jobId: string;
  jobTitle: string;
  candidateUid: string;
  candidateName: string;
  candidateEmail?: string;
  candidatePhone?: string;
  candidatePhotoUrl?: string;
}): Promise<Application> {
  const db = firebaseDb();
  const payload = {
    ...input,
    status: 'applied' as ApplicationStatus,
    createdAt: serverTimestamp(),
    // Seed interviewPrep so the UI can immediately start polling
    interviewPrep: {
      status: 'pending',
      questions: [],
      updatedAt: Date.now(),
    },
  };
  const ref = await addDoc(collection(db, 'applications'), payload);
  return { id: ref.id, ...input, status: 'applied', createdAt: Date.now() };
}

/** Kick off the Gemini → Groq → Google CSE prep pipeline. Fire-and-forget from the client;
 *  poll applications/{id}.interviewPrep.status to know when it's ready. */
export async function prepareInterview(applicationId: string): Promise<void> {
  const call = httpsCallable(firebaseFunctions(), 'prepareInterview');
  await call({ applicationId });
}

export async function getApplication(id: string): Promise<Application | null> {
  const snap = await getDoc(doc(firebaseDb(), 'applications', id));
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as Omit<Application, 'id'>) }) : null;
}

export async function updateApplication(id: string, patch: Partial<Application>) {
  await updateDoc(doc(firebaseDb(), 'applications', id), patch as Record<string, unknown>);
}

export function listenApplication(id: string, cb: (a: Application | null) => void): () => void {
  return onSnapshot(doc(firebaseDb(), 'applications', id), (snap) => {
    cb(snap.exists() ? ({ id: snap.id, ...(snap.data() as Omit<Application, 'id'>) }) : null);
  });
}

export async function listApplicationsByCandidate(uid: string): Promise<Application[]> {
  const db = firebaseDb();
  const q = query(collection(db, 'applications'), where('candidateUid', '==', uid), orderBy('createdAt', 'desc'), qlim(100));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Application, 'id'>) }));
}

export async function listApplicationsByJob(jobId: string): Promise<Application[]> {
  const db = firebaseDb();
  const q = query(collection(db, 'applications'), where('jobId', '==', jobId), orderBy('createdAt', 'desc'), qlim(500));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Application, 'id'>) }));
}

export async function listApplicationsByAgency(agencyId: string, lim = 200): Promise<Application[]> {
  const db = firebaseDb();
  const q = query(collection(db, 'applications'), where('agencyId', '==', agencyId), orderBy('createdAt', 'desc'), qlim(lim));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Application, 'id'>) }));
}

/**
 * Approve → delegates the whole flow to Cloud Function `sendSelectionEmail`:
 *   1. Deducts 2 credits from the agency
 *   2. Updates status → 'approved' + approvedAt timestamp
 *   3. Emails the candidate (with handbook download link if available)
 * The function is atomic — if credits are insufficient, nothing happens.
 */
export async function approveApplication(appId: string, actorUid: string) {
  const call = httpsCallable(firebaseFunctions(), 'sendSelectionEmail');
  await call({ applicationId: appId, actorUid });
}

export async function rejectApplication(appId: string, rejectionMessage?: string) {
  await updateApplication(appId, {
    status: 'rejected',
    completedAt: Date.now(),
    ...(rejectionMessage ? { rejectionMessage } : {}),
  });
}

/** Triggered client-side after interview ends — Function runs Gemini+Claude pipeline */
export async function finalizeInterview(appId: string, transcript: string, conversationId?: string, audioUrl?: string) {
  await updateApplication(appId, {
    status: 'interview_complete',
    transcriptOriginal: transcript,
    ...(conversationId ? { conversationId } : {}),
    ...(audioUrl ? { audioUrl } : {}),
  });
  // Fire-and-forget — credits deducted inside the Function after success
  // The Verify page also calls triggerAnalysis; idempotency guard prevents double charge
  const analysisCall = httpsCallable(firebaseFunctions(), 'analyzeInterview');
  analysisCall({ applicationId: appId }).catch((e: unknown) => {
    console.warn('[finalizeInterview] background analysis failed:', e instanceof Error ? e.message : e);
  });
}

/**
 * Fire-and-forget: fetches the official ElevenLabs transcript + audio URL
 * and patches the application document. Should be called with a short delay
 * (~3s) after the interview ends so ElevenLabs has time to finalise the recording.
 * Failures are silently swallowed — this is a best-effort enrichment.
 */
export async function enrichWithOfficialTranscript(appId: string, conversationId: string): Promise<void> {
  try {
    const call = httpsCallable(firebaseFunctions(), 'fetchElevenLabsTranscript');
    await call({ applicationId: appId, conversationId });
  } catch (e) {
    console.warn('[enrichWithOfficialTranscript] best-effort call failed:', e instanceof Error ? e.message : e);
  }
}

/** Trigger AI analysis (Gemini + Claude pipeline). Fire-and-forget. Idempotency-safe. */
export async function triggerAnalysis(appId: string): Promise<void> {
  const call = httpsCallable(firebaseFunctions(), 'analyzeInterview');
  call({ applicationId: appId }).catch((e: unknown) => {
    console.warn('[triggerAnalysis]', e instanceof Error ? e.message : e);
  });
}

// (Re)expose helper so UI components can directly call:
export { recordCredit };
