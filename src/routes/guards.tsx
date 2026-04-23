import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function RequireAgency({ children }: { children: ReactNode }) {
  const { loading, role, agency } = useAuth();
  const loc = useLocation();
  if (loading) return <FullLoader label="Loading…" />;
  if (role !== 'agency') return <Navigate to="/login/agency" state={{ from: loc.pathname }} replace />;
  if (agency?.status === 'pending') return <Navigate to="/pending" replace />;
  return <>{children}</>;
}

export function RequireCandidate({ children }: { children: ReactNode }) {
  const { loading, role } = useAuth();
  const loc = useLocation();
  if (loading) return <FullLoader label="Loading…" />;
  if (role !== 'candidate') return <Navigate to="/login/candidate" state={{ from: loc.pathname }} replace />;
  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { loading, isAdmin } = useAuth();
  if (loading) return <FullLoader label="Loading…" />;
  if (!isAdmin) return <Navigate to="/login/admin" replace />;
  return <>{children}</>;
}

export function FullLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '70vh' }}>
      <div className="row-flex" style={{ gap: 12 }}>
        <div className="pulse-dot" />
        <div className="muted">{label}</div>
      </div>
    </div>
  );
}
