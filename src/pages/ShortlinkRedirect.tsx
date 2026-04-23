// ============================================================
// ShortlinkRedirect — /s/:code → /:agencySlug/:jobSlug
// ============================================================

import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getJobByShortCode } from '@/services/jobs';
import { getAgency } from '@/services/agencies';

export default function ShortlinkRedirect() {
  const { code } = useParams();
  const [target, setTarget] = useState<string | null | 'not-found'>(null);

  useEffect(() => {
    if (!code) { setTarget('not-found'); return; }
    (async () => {
      try {
        const job = await getJobByShortCode(code);
        if (!job) { setTarget('not-found'); return; }
        const agency = await getAgency(job.agencyId);
        if (!agency) { setTarget('not-found'); return; }
        setTarget(`/${agency.slug}/${job.slug}`);
      } catch {
        setTarget('not-found');
      }
    })();
  }, [code]);

  if (target === null) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="muted">Resolving link…</div>
      </div>
    );
  }
  if (target === 'not-found') return <Navigate to="/" replace />;
  return <Navigate to={target} replace />;
}
