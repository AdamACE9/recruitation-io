// ============================================================
// SkillsHeatmap — agency × skills depth grid across candidates
// ============================================================

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { listApplicationsByAgency } from '@/services/applications';
import { extractSkills } from '@/lib/features';
import type { Application } from '@/lib/types';
import { Avatar } from '@/components/ui/Avatar';
import { Link } from 'react-router-dom';

interface Row {
  app: Application;
  skills: { name: string; depth: number }[];
}

function cellColor(depth: number | undefined): string {
  if (depth == null) return 'transparent';
  if (depth >= 80) return 'rgba(29, 122, 75, 0.85)';
  if (depth >= 60) return 'rgba(29, 122, 75, 0.55)';
  if (depth >= 40) return 'rgba(29, 122, 75, 0.30)';
  return 'rgba(29, 122, 75, 0.12)';
}

export default function SkillsHeatmap() {
  const { agency } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!agency) return;
    (async () => {
      try {
        const apps = await listApplicationsByAgency(agency.id, 200);
        const interviewed = apps.filter((a) => a.transcriptEnglish || a.report);
        const enriched: Row[] = interviewed.map((app) => ({
          app,
          skills: extractSkills([app.transcriptEnglish, app.report?.summary]),
        }));
        setRows(enriched);
      } finally {
        setLoading(false);
      }
    })();
  }, [agency]);

  // Union of skill names across all candidates (most-mentioned first)
  const allSkills = useMemo(() => {
    const tally = new Map<string, number>();
    rows.forEach((r) => r.skills.forEach((s) => tally.set(s.name, (tally.get(s.name) ?? 0) + 1)));
    return Array.from(tally.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }, [rows]);

  const visibleSkills = useMemo(() => {
    if (!filter.trim()) return allSkills;
    const q = filter.toLowerCase();
    return allSkills.filter((s) => s.includes(q));
  }, [allSkills, filter]);

  if (loading) return <div className="muted">Loading skills…</div>;

  return (
    <div className="stack stack-4">
      <header className="row-between">
        <div>
          <h2>Skills heatmap</h2>
          <div className="muted small">Depth of mention across interviews — darker = more expertise signalled.</div>
        </div>
        <input
          className="input"
          style={{ maxWidth: 240 }}
          placeholder="Filter skills…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </header>

      {rows.length === 0 ? (
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <div className="muted">No interviewed candidates yet — run an interview, then come back.</div>
        </div>
      ) : (
        <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ padding: '10px 12px', textAlign: 'left', position: 'sticky', left: 0, background: 'var(--surface-2)', borderBottom: '1px solid var(--border-soft)', minWidth: 200 }}>Candidate</th>
                {visibleSkills.map((s) => (
                  <th key={s} style={{ padding: '10px 8px', textAlign: 'center', borderBottom: '1px solid var(--border-soft)', background: 'var(--surface-2)', whiteSpace: 'nowrap', fontWeight: 500 }}>
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const byName = new Map(r.skills.map((s) => [s.name, s.depth]));
                return (
                  <tr key={r.app.id}>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-soft)', position: 'sticky', left: 0, background: 'var(--surface)' }}>
                      <Link to={`/reports/${r.app.id}`} className="row-flex" style={{ gap: 8, textDecoration: 'none', color: 'inherit' }}>
                        <Avatar name={r.app.candidateName} size="sm" />
                        <div>
                          <div style={{ fontWeight: 600 }}>{r.app.candidateName}</div>
                          <div className="muted tiny">{r.app.jobTitle}</div>
                        </div>
                      </Link>
                    </td>
                    {visibleSkills.map((s) => {
                      const d = byName.get(s);
                      return (
                        <td
                          key={s}
                          title={d != null ? `${s}: ${d}/100` : `${s}: not mentioned`}
                          style={{
                            padding: '4px 6px',
                            borderBottom: '1px solid var(--border-soft)',
                            background: cellColor(d),
                            textAlign: 'center',
                            color: d && d >= 60 ? '#fff' : 'var(--text)',
                            fontWeight: d && d >= 80 ? 600 : 400,
                            minWidth: 48,
                          }}
                        >
                          {d != null ? d : ''}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="muted tiny">
        Heuristic extraction from interview transcripts. Depth score combines mention frequency and nearby "years" context.
      </div>
    </div>
  );
}
