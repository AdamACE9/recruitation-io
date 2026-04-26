// ============================================================
// Branded agency home — /:agencySlug
// Lists all active jobs for the agency with white-label theming.
// ============================================================

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAgencyBySlug } from '@/services/agencies';
import { listActiveJobsByAgency } from '@/services/jobs';
import { applyBrand } from '@/lib/theme';
import { useAuth } from '@/contexts/AuthContext';
import type { Agency, Job } from '@/lib/types';

export default function AgencyHome() {
  const { agencySlug } = useParams<{ agencySlug: string }>();
  const { candidate } = useAuth();
  const [agency, setAgency] = useState<Agency | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!agencySlug) return;
    getAgencyBySlug(agencySlug).then(async (a) => {
      if (!a) { setNotFound(true); setLoading(false); return; }
      setAgency(a);
      applyBrand(a.brandColor);
      const list = await listActiveJobsByAgency(a.id);
      setJobs(list);
      setLoading(false);
    });
  }, [agencySlug]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div className="muted">Loading…</div>
      </div>
    );
  }

  if (notFound || !agency) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h2 style={{ marginBottom: 8 }}>Agency not found</h2>
          <p className="muted" style={{ marginBottom: 24 }}>This link may be incorrect or the agency is no longer active.</p>
          <Link to="/" className="btn btn-secondary">Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <div className="marketing-nav">
        <div className="marketing-nav-inner">
          <div className="row-flex">
            {agency.logoUrl && (
              <img src={agency.logoUrl} alt={agency.name} style={{ height: 28, borderRadius: 6 }} />
            )}
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{agency.name}</span>
          </div>
          {candidate ? (
            <Link to="/me" className="btn btn-secondary btn-sm">My applications</Link>
          ) : (
            <Link to="/login/candidate" className="btn btn-ghost btn-sm">Sign in</Link>
          )}
        </div>
      </div>

      <div className="container-narrow" style={{ paddingTop: 60, paddingBottom: 80 }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px',
            background: 'var(--brand-50)', border: '1px solid var(--brand-200)',
            borderRadius: 999, marginBottom: 16,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--brand)', display: 'inline-block', boxShadow: '0 0 6px var(--brand)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', letterSpacing: '0.07em' }}>NOW HIRING</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem,5vw,2.8rem)', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 12 }}>
            Open roles at {agency.name}
          </h1>
          {agency.description && (
            <p className="muted" style={{ fontSize: 15, lineHeight: 1.7, maxWidth: 520 }}>{agency.description}</p>
          )}
        </div>

        {/* Job list */}
        {jobs.length === 0 ? (
          <div style={{
            padding: '48px 32px', textAlign: 'center',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 16,
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
            <h3 style={{ marginBottom: 8 }}>No open roles right now</h3>
            <p className="muted">Check back soon — new positions are posted regularly.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {jobs.map((job) => (
              <Link
                key={job.id}
                to={`/${agencySlug}/${job.slug}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 14, padding: '20px 24px',
                  transition: 'border-color 160ms ease, box-shadow 160ms ease',
                  cursor: 'pointer',
                }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--brand)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 6, lineHeight: 1.25 }}>{job.title}</h3>
                      <div className="muted" style={{ fontSize: 13, display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
                        {job.jobConfig.location && <span>📍 {job.jobConfig.location}</span>}
                        {job.jobConfig.workType && <span>💼 {job.jobConfig.workType}</span>}
                        {job.jobConfig.industry && <span>🏢 {job.jobConfig.industry}</span>}
                        {job.jobConfig.language && <span>🌐 {job.jobConfig.language}</span>}
                      </div>
                      {job.jobConfig.description && (
                        <p className="muted" style={{ fontSize: 13, marginTop: 10, lineHeight: 1.6,
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                          {job.jobConfig.description}
                        </p>
                      )}
                    </div>
                    <div style={{
                      flexShrink: 0, padding: '6px 14px', borderRadius: 8,
                      background: 'var(--brand-50)', border: '1px solid var(--brand-200)',
                      fontSize: 13, fontWeight: 600, color: 'var(--brand)',
                      whiteSpace: 'nowrap',
                    }}>
                      Apply →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Footer note */}
        <div style={{ marginTop: 48, paddingTop: 28, borderTop: '1px solid var(--border-soft)', textAlign: 'center', fontSize: 13 }} className="muted">
          Interviews powered by{' '}
          <Link to="/" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>Recruitation.AI</Link>
          {' '}— AI voice interviews in 12+ languages
        </div>
      </div>
    </div>
  );
}
