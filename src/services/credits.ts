// ============================================================
// Credit ledger — log transactions + increment agency balance
// ============================================================

import { writeBatch, collection, doc, increment, orderBy, query, serverTimestamp, where, getDocs, limit } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import type { CreditTransaction } from '@/lib/types';

export async function recordCredit(
  agencyId: string,
  amount: number,
  type: CreditTransaction['type'],
  actorUid?: string,
  note?: string,
) {
  const db = firebaseDb();
  // Atomic batch: ledger entry + balance update in one commit
  const batch = writeBatch(db);
  const txRef = doc(collection(db, 'creditTransactions'));
  // Coalesce all optionals to null — Firestore client SDK rejects undefined.
  batch.set(txRef, {
    agencyId,
    amount,
    type,
    actorUid: actorUid ?? null,
    note: note ?? null,
    createdAt: serverTimestamp(),
  });
  batch.update(doc(db, 'agencies', agencyId), { credits: increment(amount) });
  await batch.commit();
}

export async function listCreditHistory(agencyId: string, lim = 50): Promise<CreditTransaction[]> {
  const db = firebaseDb();
  const q = query(
    collection(db, 'creditTransactions'),
    where('agencyId', '==', agencyId),
    orderBy('createdAt', 'desc'),
    limit(lim),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<CreditTransaction, 'id'>),
  }));
}
