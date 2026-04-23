// Browse active jobs across all agencies (public-ish, candidate-facing).
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listPublicJobs } from '@/services/jobs';
import { getAgency } from '@/services/agencies';
import type { Agency, Job } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatRelative } from '@/lib/util';

export default function BrowseJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [agencies, setAgencies] = useState<Record<string, Agency>>({});

  useEffect(() => {
    listPublicJobs().then(async (js) => {
      setJobs(js);
      const map: Record<string, Agency> = {};
      await Promise.all(js.map(async (j) => {
        if (!map[j.agencyId]) {
          const a = await getAgency(j.agencyId);
          if (a) map[j.agencyId] = a;
        }
      }));
      setAgencies(map);
    });
  }, []);

  return (
    <div className="stack stack-5">
      <header><h2>Open roles</h2><div className="muted small">One-click apply using your profile data.</div></header>
      <div className="card">
        {jobs.length === 0 ? (
          <div className="t-center muted small" style={{ padding: 32 }}>No live jobs right now.</div>
        ) : jobs.map((j) => {
          const a = agencies[j.agencyId];
          return (
            <div key={j.id} className="row">
              <div className="flex-1">
                <div style={{ fontWeight: 600 }}>{j.title}</div>
                <div className="muted tiny">
                  {a?.name ?? 'Recruitation agency'} · {j.jobConfig.location} · {formatRelative(typeof j.createdAt === 'number' ? j.createdAt : Date.now())}
                </div>
              </div>
              <Badge kind="info">{j.jobConfig.workType}</Badge>
              {a ? (
                <Link to={`/${a.slug}/${j.slug}`}><Button size="sm">One-click apply</Button></Link>
              ) : <Badge kind="neutral">loading</Badge>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
