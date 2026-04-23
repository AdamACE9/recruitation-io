// Candidate — my applications
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { listApplicationsByCandidate } from '@/services/applications';
import { getJob } from '@/services/jobs';
import type { Application, Job } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { formatRelative } from '@/lib/util';

const STATUS_LABEL: Record<Application['status'], string> = {
  draft: 'Draft', applied: 'Applied', interview_scheduled: 'Interview scheduled',
  interview_live: 'Interview live', interview_complete: 'Interview complete',
  under_review: 'Under review', approved: 'Selected', rejected: 'Not selected',
};
const STATUS_BADGE: Record<Application['status'], 'success' | 'info' | 'warn' | 'danger' | 'neutral'> = {
  draft: 'neutral', applied: 'info', interview_scheduled: 'info', interview_live: 'info',
  interview_complete: 'warn', under_review: 'warn', approved: 'success', rejected: 'danger',
};

export default function CandidatePortal() {
  const { candidate } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);
  // jobId → Job (used to surface handbookUrl for approved apps)
  const [jobsById, setJobsById] = useState<Record<string, Job>>({});

  useEffect(() => {
    if (!candidate) return;
    listApplicationsByCandidate(candidate.uid).then(async (list) => {
      setApps(list);
      // Fetch jobs for approved applications so we can surface the handbook.
      // Use allSettled so a single failed job fetch doesn't blank the whole list.
      const approvedJobIds = Array.from(
        new Set(list.filter((a) => a.status === 'approved').map((a) => a.jobId)),
      );
      const results = await Promise.allSettled(approvedJobIds.map((id) => getJob(id)));
      const map: Record<string, Job> = {};
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value) map[r.value.id] = r.value;
      }
      setJobsById(map);
    }).catch((e) => {
      console.error('[Portal] failed to load applications:', e instanceof Error ? e.message : e);
    });
  }, [candidate]);

  return (
    <div className="stack stack-5">
      <header><h2>My applications</h2></header>
      <div className="stack stack-3">
        {apps.length === 0 ? (
          <div className="card">
            <div className="t-center muted small" style={{ padding: 32 }}>
              You haven't applied to any jobs yet.{' '}
              <Link to="/jobs-open" className="link">Browse open roles →</Link>
            </div>
          </div>
        ) : (
          apps.map((a) => {
            const job = jobsById[a.jobId];
            const isApproved = a.status === 'approved';
            return (
              <div
                key={a.id}
                className="card"
                style={
                  isApproved
                    ? { background: 'var(--success-bg, var(--brand-50))', borderColor: 'var(--brand)' }
                    : undefined
                }
              >
                <div className="row-between">
                  <div className="flex-1">
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{a.jobTitle}</div>
                    <div className="muted tiny">
                      Applied {formatRelative(typeof a.createdAt === 'number' ? a.createdAt : Date.now())}
                    </div>
                  </div>
                  <Badge kind={STATUS_BADGE[a.status]}>{STATUS_LABEL[a.status]}</Badge>
                </div>

                {isApproved && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontWeight: 500, lineHeight: 1.5 }}>
                      🎉 You have been approved for <strong>{a.jobTitle}</strong>.
                    </div>
                    <div className="muted small" style={{ marginTop: 4 }}>
                      The agency will contact you shortly with next steps.
                    </div>
                    {job?.handbookUrl && (
                      <div style={{ marginTop: 14 }}>
                        <a
                          href={job.handbookUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-primary btn-sm"
                        >
                          📎 Download handbook ({job.handbookFileName ?? 'handbook.pdf'})
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {a.status === 'rejected' && a.rejectionMessage && (
                  <div style={{ marginTop: 10 }}>
                    <div className="muted small" style={{ lineHeight: 1.6 }}>
                      {a.rejectionMessage}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
