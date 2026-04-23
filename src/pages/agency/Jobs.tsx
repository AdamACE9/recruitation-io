import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { listJobsByAgency, setJobStatus } from '@/services/jobs';
import type { Job } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatRelative } from '@/lib/util';
import { useToast } from '@/lib/toast';

export default function Jobs() {
  const { agency } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!agency) return;
    listJobsByAgency(agency.id).then(setJobs);
  }, [agency]);

  async function togglePause(j: Job) {
    const next = j.status === 'active' ? 'paused' : 'active';
    await setJobStatus(j.id, next);
    setJobs((all) => all.map((x) => x.id === j.id ? { ...x, status: next } : x));
    toast(next === 'paused' ? 'Job paused' : 'Job resumed', 'success');
  }

  return (
    <div className="stack stack-5">
      <header className="row-between">
        <h2>Jobs</h2>
        <Link to="/jobs/new"><Button>+ New job</Button></Link>
      </header>
      <div className="card">
        {jobs.length === 0 ? (
          <div className="t-center muted small" style={{ padding: 32 }}>No jobs yet.</div>
        ) : jobs.map((j) => (
          <div key={j.id} className="row">
            <div className="flex-1">
              <div style={{ fontWeight: 600 }}>{j.title}</div>
              <div className="muted tiny">
                {j.jobConfig?.location} · Created {formatRelative(typeof j.createdAt === 'number' ? j.createdAt : Date.now())}
              </div>
              <div className="mono tiny muted" style={{ marginTop: 2 }}>
                /{agency?.slug}/{j.slug}
              </div>
            </div>
            <Badge kind={j.status === 'active' ? 'success' : j.status === 'paused' ? 'warn' : 'neutral'}>{j.status}</Badge>
            <Button variant="ghost" size="sm" onClick={() => togglePause(j)}>{j.status === 'active' ? 'Pause' : 'Resume'}</Button>
            <Link to={`/jobs/${j.id}`} className="link small">Edit</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
