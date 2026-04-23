// Ranked candidate pipeline across all jobs. Linear-grade keyboard nav + multi-select compare.
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { listApplicationsByAgency, approveApplication, rejectApplication } from '@/services/applications';
import type { Application } from '@/lib/types';
import { REC_BADGE, REC_LABEL } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { cx, formatRelative, scoreClass } from '@/lib/util';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/lib/toast';

type Filter = 'all' | 'strong_yes' | 'yes' | 'maybe' | 'no' | 'pending';

function exportCsv(rows: Application[]) {
  const header = ['Name', 'Email', 'Job', 'Status', 'Score', 'Recommendation', 'Applied'];
  const lines = rows.map((a) => [
    a.candidateName,
    a.candidateEmail ?? '',
    a.jobTitle,
    a.status,
    a.report?.overallScore ?? '',
    a.report?.recommendation ?? '',
    new Date(typeof a.createdAt === 'number' ? a.createdAt : Date.now()).toISOString().slice(0, 10),
  ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
  const csv = [header.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `pipeline-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Pipeline() {
  const { agency, user } = useAuth();
  const { toast } = useToast();
  const nav = useNavigate();
  const [apps, setApps] = useState<Application[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<number>(0);
  const [picked, setPicked] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!agency) return;
    listApplicationsByAgency(agency.id).then(setApps);
  }, [agency]);

  const visible = useMemo(() => {
    const sorted = [...apps].sort((a, b) => (b.report?.overallScore ?? -1) - (a.report?.overallScore ?? -1));
    if (filter === 'pending') return sorted.filter((a) => !a.report);
    if (filter === 'all') return sorted;
    return sorted.filter((a) => a.report?.recommendation === filter);
  }, [apps, filter]);

  function togglePick(id: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 4) next.add(id);
      else toast('Compare up to 4 candidates at a time', 'warn');
      return next;
    });
  }

  function goCompare() {
    if (picked.size < 2) { toast('Pick at least 2 candidates to compare', 'warn'); return; }
    nav(`/compare?ids=${Array.from(picked).join(',')}`);
  }

  // keyboard shortcuts
  useEffect(() => {
    const h = async (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === 'j') setSelected((s) => Math.min(visible.length - 1, s + 1));
      if (e.key === 'k') setSelected((s) => Math.max(0, s - 1));
      if (e.key === 'c' && picked.size >= 2) goCompare();
      const current = visible[selected];
      if (!current || !user) return;
      if (e.key === 'x') togglePick(current.id);
      if (e.key === 'a' && current.status !== 'approved' && current.status !== 'rejected') {
        await approveApplication(current.id, user.uid);
        toast(`Approved ${current.candidateName}`, 'success');
        setApps((all) => all.map((a) => a.id === current.id ? { ...a, status: 'approved' } : a));
      }
      if (e.key === 'r' && current.status !== 'approved' && current.status !== 'rejected') {
        await rejectApplication(current.id);
        toast(`Rejected ${current.candidateName}`, 'warn');
        setApps((all) => all.map((a) => a.id === current.id ? { ...a, status: 'rejected' } : a));
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [visible, selected, user, toast, picked]);

  return (
    <div className="stack stack-5">
      <header className="row-between">
        <div>
          <h2>Pipeline</h2>
          <div className="muted small mono tiny">
            <kbd>J</kbd>/<kbd>K</kbd> navigate · <kbd>A</kbd> approve · <kbd>R</kbd> reject · <kbd>X</kbd> pick · <kbd>C</kbd> compare · <kbd>?</kbd> shortcuts
          </div>
        </div>
        <div className="row-flex">
          <Button variant="secondary" size="sm" onClick={() => exportCsv(visible)}>
            Export CSV
          </Button>
          {picked.size > 0 && (
            <>
              <Badge kind="info">{picked.size} selected</Badge>
              <Button variant="secondary" size="sm" onClick={() => setPicked(new Set())}>Clear</Button>
              <Button size="sm" onClick={goCompare}>Compare →</Button>
            </>
          )}
        </div>
      </header>

      <div className="row-flex" style={{ flexWrap: 'wrap', gap: 6 }}>
        {(['all', 'strong_yes', 'yes', 'maybe', 'no', 'pending'] as Filter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cx('btn btn-sm', filter === f ? 'btn-primary' : 'btn-secondary')}>
            {f === 'pending' ? 'Processing' : f === 'all' ? 'All' : REC_LABEL[f]}
          </button>
        ))}
      </div>

      <div className="card">
        {visible.length === 0 && <div className="t-center muted small" style={{ padding: 32 }}>Nothing in this bucket.</div>}
        {visible.map((a, i) => {
          const isPicked = picked.has(a.id);
          return (
            <div key={a.id}
              className="row row-hover"
              style={{
                ...(i === selected ? { boxShadow: '0 0 0 2px var(--brand)', background: 'var(--surface-2)' } : undefined),
                ...(isPicked ? { background: 'var(--brand-50)' } : undefined),
              }}
            >
              <input
                type="checkbox"
                checked={isPicked}
                onChange={() => togglePick(a.id)}
                onClick={(e) => e.stopPropagation()}
                style={{ accentColor: 'var(--brand)', marginRight: 4 }}
              />
              <Link to={`/reports/${a.id}`} className="row-flex flex-1" style={{ textDecoration: 'none', color: 'inherit', gap: 10 }}>
                <Avatar name={a.candidateName} />
                <div className="flex-1">
                  <div style={{ fontWeight: 600 }}>{a.candidateName}</div>
                  <div className="muted tiny">{a.jobTitle} · {formatRelative(typeof a.createdAt === 'number' ? a.createdAt : Date.now())}</div>
                </div>
                {a.report?.overallScore != null ? (
                  <>
                    <span className={cx('score', `score-${scoreClass(a.report.overallScore)}`)}>{a.report.overallScore}</span>
                    <Badge kind={REC_BADGE[a.report.recommendation]}>{REC_LABEL[a.report.recommendation]}</Badge>
                  </>
                ) : <Badge kind="neutral">{a.status.replace(/_/g, ' ')}</Badge>}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
