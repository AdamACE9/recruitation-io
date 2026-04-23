// ============================================================
// Admin — all interviews across all agencies
// ============================================================

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, orderBy, query, limit as qlim } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import type { Application } from '@/lib/types';
import { REC_BADGE, REC_LABEL } from '@/lib/types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { cx, scoreClass, formatRelative } from '@/lib/util';

type RecFilter = '' | 'strong_yes' | 'yes' | 'maybe' | 'no';

export default function AllApplications() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRec, setFilterRec] = useState<RecFilter>('');
  const [filterMinScore, setFilterMinScore] = useState(0);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const q = query(
          collection(firebaseDb(), 'applications'),
          orderBy('createdAt', 'desc'),
          qlim(300),
        );
        const snap = await getDocs(q);
        setApps(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Application)));
      } catch (e) {
        setLoadErr(e instanceof Error ? e.message : 'Failed to load');
      }
      setLoading(false);
    })();
  }, []);

  const visible = useMemo(() => {
    let result = apps;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.candidateName.toLowerCase().includes(q) ||
          a.candidateEmail?.toLowerCase().includes(q) ||
          a.jobTitle.toLowerCase().includes(q),
      );
    }
    if (filterRec) result = result.filter((a) => a.report?.recommendation === filterRec);
    if (filterMinScore > 0) result = result.filter((a) => (a.report?.overallScore ?? 0) >= filterMinScore);
    return result;
  }, [apps, search, filterRec, filterMinScore]);

  const analyzed = apps.filter((a) => !!a.report).length;

  return (
    <div className="stack stack-5">
      <header className="row-between">
        <div>
          <h2>All Interviews</h2>
          <div className="muted small">
            {apps.length} total · {analyzed} analysed · showing {visible.length}
          </div>
        </div>
      </header>

      {/* Filter bar */}
      <div className="row-flex" style={{ flexWrap: 'wrap', gap: 8 }}>
        <input
          type="search"
          placeholder="Search candidate, job, email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: 220, padding: '8px 12px',
            border: '1px solid var(--border-soft)', borderRadius: 8,
            background: 'var(--surface-1)', color: 'inherit', fontSize: 14,
          }}
        />
        <select
          value={filterRec}
          onChange={(e) => setFilterRec(e.target.value as RecFilter)}
          style={{ padding: '8px 12px', border: '1px solid var(--border-soft)', borderRadius: 8, background: 'var(--surface-1)', color: 'inherit', fontSize: 14 }}
        >
          <option value="">All recommendations</option>
          <option value="strong_yes">Strong yes</option>
          <option value="yes">Yes</option>
          <option value="maybe">Maybe</option>
          <option value="no">No</option>
        </select>
        <select
          value={filterMinScore}
          onChange={(e) => setFilterMinScore(Number(e.target.value))}
          style={{ padding: '8px 12px', border: '1px solid var(--border-soft)', borderRadius: 8, background: 'var(--surface-1)', color: 'inherit', fontSize: 14 }}
        >
          <option value={0}>Any score</option>
          <option value={60}>Score 60+</option>
          <option value={70}>Score 70+</option>
          <option value={80}>Score 80+</option>
          <option value={90}>Score 90+</option>
        </select>
        {(search || filterRec || filterMinScore > 0) && (
          <button
            onClick={() => { setSearch(''); setFilterRec(''); setFilterMinScore(0); }}
            style={{ padding: '8px 14px', border: '1px solid var(--border-soft)', borderRadius: 8, background: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-muted, #888)' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card">
        {loadErr && (
          <div className="muted small t-center" style={{ padding: 32, color: 'var(--danger)' }}>
            Error: {loadErr}
          </div>
        )}
        {loading && !loadErr && (
          <div className="muted small t-center" style={{ padding: 32 }}>Loading…</div>
        )}
        {!loading && !loadErr && visible.length === 0 && (
          <div className="muted small t-center" style={{ padding: 32 }}>No interviews match the filters.</div>
        )}
        {visible.map((a) => {
          const score = a.report?.overallScore ?? null;
          const rec = a.report?.recommendation;
          return (
            <div key={a.id} className="row row-hover" style={{ gap: 12 }}>
              <Avatar name={a.candidateName} photoUrl={a.candidatePhotoUrl} />
              <div className="flex-1" style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.candidateName}
                </div>
                <div className="muted tiny" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.jobTitle} · {formatRelative(typeof a.createdAt === 'number' ? a.createdAt : Date.now())}
                </div>
              </div>
              {score != null ? (
                <>
                  <span className={cx('score', `score-${scoreClass(score)}`)}>{score}</span>
                  {rec && <Badge kind={REC_BADGE[rec]}>{REC_LABEL[rec]}</Badge>}
                </>
              ) : (
                <Badge kind="neutral">{a.status.replace(/_/g, ' ')}</Badge>
              )}
              <Link to={`/admin/reports/${a.id}`} className="btn btn-secondary btn-sm">
                Report →
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
