// ============================================================
// Auth context — tracks firebase user + resolved role doc
// ============================================================

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signOut, type User as FbUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { safeAuth, safeDb } from '@/lib/firebase';
import type { Agency, Candidate, UserRole } from '@/lib/types';
import { applyBrand } from '@/lib/theme';

interface AuthState {
  loading: boolean;
  user: FbUser | null;
  role: UserRole | null;
  agency: Agency | null;
  candidate: Candidate | null;
  isAdmin: boolean;
}

interface AuthCtx extends AuthState {
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  loading: true, user: null, role: null, agency: null, candidate: null, isAdmin: false,
  signOut: async () => {}, refresh: async () => {},
});

async function resolveRole(fbUser: FbUser): Promise<Omit<AuthState, 'loading' | 'user'>> {
  const db = safeDb();
  if (!db) return { role: null, agency: null, candidate: null, isAdmin: false };

  // claims first — admin is via custom claim
  // On first load a network hiccup can make getIdTokenResult() reject. Retry once
  // with forceRefresh so a transient failure never silently demotes an admin.
  let tokenResult = await fbUser.getIdTokenResult().catch(() => null);
  if (!tokenResult) {
    tokenResult = await fbUser.getIdTokenResult(true).catch(() => null);
  }
  const isAdmin = Boolean(tokenResult?.claims?.admin);

  // check agency doc (doc id == uid or lookup by ownerUid)
  const agencySnap = await getDoc(doc(db, 'agencies', fbUser.uid)).catch(() => null);
  if (agencySnap?.exists()) {
    const agency = { id: agencySnap.id, ...(agencySnap.data() as Omit<Agency, 'id'>) };
    return { role: 'agency', agency, candidate: null, isAdmin };
  }

  const candSnap = await getDoc(doc(db, 'candidates', fbUser.uid)).catch(() => null);
  if (candSnap?.exists()) {
    const candidate = { uid: candSnap.id, ...(candSnap.data() as Omit<Candidate, 'uid'>) };
    return { role: 'candidate', agency: null, candidate, isAdmin };
  }

  return { role: isAdmin ? 'admin' : null, agency: null, candidate: null, isAdmin };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    loading: true, user: null, role: null, agency: null, candidate: null, isAdmin: false,
  });

  const refresh = async () => {
    const auth = safeAuth();
    const current = auth?.currentUser;
    if (!current) {
      setState({ loading: false, user: null, role: null, agency: null, candidate: null, isAdmin: false });
      return;
    }
    const resolved = await resolveRole(current);
    setState({ loading: false, user: current, ...resolved });
    if (resolved.agency?.brandColor) applyBrand(resolved.agency.brandColor);
  };

  useEffect(() => {
    const auth = safeAuth();
    if (!auth) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setState({ loading: false, user: null, role: null, agency: null, candidate: null, isAdmin: false });
        return;
      }
      const resolved = await resolveRole(fbUser);
      setState({ loading: false, user: fbUser, ...resolved });
      if (resolved.agency?.brandColor) applyBrand(resolved.agency.brandColor);
    });
    return () => unsub();
  }, []);

  const value = useMemo<AuthCtx>(() => ({
    ...state,
    refresh,
    signOut: async () => {
      const auth = safeAuth();
      if (auth) await signOut(auth);
    },
  }), [state]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() { return useContext(Ctx); }
