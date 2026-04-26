// ============================================================
// Firestore-safe helpers — strip `undefined` from any payload before
// shipping it to Firestore (which rejects undefined values with
// "Function setDoc() called with invalid data" errors).
//
// Use these wherever the codebase writes to Firestore. Any `undefined`
// field is OMITTED entirely; nested objects/arrays are sanitized
// recursively. Date/Timestamp/serverTimestamp/sentinels pass through.
// ============================================================

import {
  doc,
  setDoc as fsSetDoc,
  updateDoc as fsUpdateDoc,
  addDoc as fsAddDoc,
  collection,
  type DocumentReference,
  type CollectionReference,
  type SetOptions,
  type UpdateData,
  type DocumentData,
} from 'firebase/firestore';

/** Recursively remove undefined keys from objects and undefined elements from arrays. */
export function stripUndefined<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    return value.filter((v) => v !== undefined).map((v) => stripUndefined(v)) as unknown as T;
  }
  // Pass through Firestore sentinels, Dates, Timestamps and other class instances.
  if (typeof value === 'object') {
    const proto = Object.getPrototypeOf(value);
    const isPlain = proto === Object.prototype || proto === null;
    if (!isPlain) return value;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === undefined) continue;
      out[k] = stripUndefined(v);
    }
    return out as unknown as T;
  }
  return value;
}

export async function safeSetDoc<T extends DocumentData>(
  ref: DocumentReference<T>,
  data: T,
  options?: SetOptions,
): Promise<void> {
  const clean = stripUndefined(data);
  if (options) await fsSetDoc(ref, clean as T, options);
  else await fsSetDoc(ref, clean as T);
}

export async function safeUpdateDoc<T extends DocumentData>(
  ref: DocumentReference<T>,
  data: UpdateData<T>,
): Promise<void> {
  await fsUpdateDoc(ref, stripUndefined(data) as UpdateData<T>);
}

export async function safeAddDoc<T extends DocumentData>(
  ref: CollectionReference<T>,
  data: T,
): Promise<DocumentReference<T>> {
  return fsAddDoc(ref, stripUndefined(data) as T);
}

// Re-export passthroughs for convenience.
export { doc, collection };
