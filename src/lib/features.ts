// ============================================================
// Recruitation.AI — Differentiator feature utilities
// ============================================================
// Pure helpers for: bias redaction, sentiment simulation,
// skill extraction, silver-medalist matching, live coach hints,
// share codes and tiny-QR generation.
// ============================================================

import type {
  Application,
  JourneyEvent,
  SentimentSample,
  Job,
} from '@/lib/types';

// ---------- Bias shield ------------------------------------------------------

/**
 * Return a redacted copy of an application with identity signals hidden.
 * Keeps everything score-related so the agency can evaluate blind.
 */
export function redactForBlindReview(app: Application): Application {
  const anonName = anonHandle(app.candidateUid || app.id);
  // Scrub transcript for first names (light-weight heuristic).
  const scrubText = (s?: string) => {
    if (!s) return s;
    let out = s;
    // Replace the candidate's own name tokens.
    const tokens = (app.candidateName || '').split(/\s+/).filter((t) => t.length > 1);
    for (const tok of tokens) {
      const re = new RegExp(`\\b${escapeRegex(tok)}\\b`, 'gi');
      out = out.replace(re, '▇▇▇');
    }
    // Common school/uni patterns.
    out = out.replace(/\b(?:University|College|Institute|School) of [A-Z][\w -]+/g, '▇▇▇ University');
    out = out.replace(/\b[A-Z][a-z]+ (?:University|College|Institute|Polytechnic)\b/g, '▇▇▇ University');
    return out;
  };
  return {
    ...app,
    candidateName: anonName,
    candidateEmail: undefined,
    candidatePhotoUrl: undefined,
    transcriptEnglish: scrubText(app.transcriptEnglish),
    transcriptOriginal: scrubText(app.transcriptOriginal),
    audioUrl: undefined, // voice conveys identity signals
  };
}

function anonHandle(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const adj = ['Swift', 'Bright', 'Quiet', 'Bold', 'Calm', 'Keen', 'Sharp', 'Warm'][h % 8];
  const noun = ['Finch', 'Otter', 'Heron', 'Kestrel', 'Fox', 'Crane', 'Lark', 'Marten'][(h >> 3) % 8];
  const n = ((h >> 6) % 90) + 10;
  return `${adj} ${noun} #${n}`;
}

function escapeRegex(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// ---------- Voice sentiment (simulated from transcript) ----------------------

/**
 * Produce a sentiment timeline. If a real ASR pipeline is wired in later,
 * replace this with actual prosody features. Currently derived deterministically
 * from transcript length + pseudo-random walk seeded by application id.
 */
export function synthSentiment(applicationId: string, transcript: string, durationSec: number): SentimentSample[] {
  const seedRng = mulberry32(hash32(applicationId));
  const samples: SentimentSample[] = [];
  const step = 15;
  const wordCount = transcript.split(/\s+/).length;
  let energy = 55 + seedRng() * 10;
  let confidence = 50 + seedRng() * 10;
  let stress = 25 + seedRng() * 10;
  for (let t = 0; t <= durationSec; t += step) {
    // drift a little; confidence generally grows if the candidate is answering
    energy += (seedRng() - 0.45) * 10;
    confidence += (seedRng() - 0.35) * 8 + (wordCount > 80 ? 0.6 : -0.2);
    stress += (seedRng() - 0.55) * 7;
    energy = clamp(energy, 20, 95);
    confidence = clamp(confidence, 15, 95);
    stress = clamp(stress, 5, 90);
    samples.push({ t, energy: Math.round(energy), confidence: Math.round(confidence), stress: Math.round(stress) });
  }
  return samples;
}

export function synthJourneyEvents(app: Application, transcript: string, durationSec: number): JourneyEvent[] {
  const events: JourneyEvent[] = [];
  events.push({ t: 0, kind: 'milestone', label: 'Interview started' });
  const turns = transcript.split(/\n/).filter(Boolean);
  const spacing = durationSec / Math.max(1, turns.length);
  turns.slice(0, 20).forEach((line, i) => {
    const who = /^agent/i.test(line) ? 'agent' : 'candidate';
    events.push({
      t: Math.round((i + 0.5) * spacing),
      kind: who,
      label: who === 'agent' ? 'Agent question' : 'Candidate answer',
      detail: line.replace(/^(agent|candidate):\s*/i, '').slice(0, 140),
    });
  });
  (app.report?.redFlags ?? []).forEach((f, i) => {
    events.push({ t: Math.min(durationSec - 1, Math.round(durationSec * (0.35 + i * 0.12))), kind: 'flag', label: 'Red flag detected', detail: f });
  });
  (app.report?.testResults ?? []).forEach((t, i) => {
    events.push({ t: Math.round(durationSec * (0.45 + i * 0.1)), kind: 'test', label: t.correct ? 'Test passed' : 'Test missed', detail: t.question });
  });
  events.push({ t: durationSec, kind: 'milestone', label: 'Interview complete' });
  return events.sort((a, b) => a.t - b.t);
}

// ---------- Skills extraction ------------------------------------------------

const SKILL_VOCAB = [
  'react', 'typescript', 'javascript', 'node', 'python', 'sql', 'postgres', 'mysql',
  'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'terraform', 'ci/cd',
  'figma', 'photoshop', 'excel', 'powerpoint', 'tableau', 'powerbi',
  'leadership', 'communication', 'stakeholder', 'agile', 'scrum',
  'sales', 'negotiation', 'crm', 'salesforce', 'hubspot',
  'teaching', 'curriculum', 'coaching', 'mentoring',
  'accounting', 'finance', 'forecasting', 'budgeting',
  'marketing', 'seo', 'analytics', 'content', 'copywriting',
  'customer service', 'hospitality', 'retail', 'logistics',
  'machine learning', 'data analysis', 'statistics', 'r',
  'java', 'c++', 'c#', 'go', 'rust', 'swift', 'kotlin',
  'design', 'ux', 'ui', 'product',
  'project management', 'pmp', 'jira',
];

/** Extract approximate skill depths (0-100) from free text. */
export function extractSkills(texts: (string | undefined)[]): { name: string; depth: number }[] {
  const joined = texts.filter(Boolean).join('\n').toLowerCase();
  if (!joined) return [];
  const out: { name: string; depth: number }[] = [];
  for (const skill of SKILL_VOCAB) {
    const re = new RegExp(`\\b${escapeRegex(skill)}\\b`, 'g');
    const matches = joined.match(re);
    if (!matches) continue;
    const mentions = matches.length;
    // heuristic: years context nearby
    const yearMatch = new RegExp(`(\\d+)\\+?\\s*(?:years?|yrs?)[^.]{0,40}${escapeRegex(skill)}`, 'i').exec(joined)
      || new RegExp(`${escapeRegex(skill)}[^.]{0,40}(\\d+)\\+?\\s*(?:years?|yrs?)`, 'i').exec(joined);
    const years = yearMatch ? parseInt(yearMatch[1], 10) : 0;
    const depth = clamp(30 + mentions * 12 + years * 8, 25, 98);
    out.push({ name: skill, depth: Math.round(depth) });
  }
  return out.sort((a, b) => b.depth - a.depth).slice(0, 14);
}

// ---------- Silver-medalist matcher -----------------------------------------

export interface SilverMedalistMatch {
  app: Application;
  score: number; // 0-100
  reason: string;
}

/** Given a new job and past applications, find previously-rejected strong candidates
 *  whose skills/score align with the new role. */
export function findSilverMedalists(
  newJob: { title: string; jobConfig: { description: string; qualifications: string; industry: string } },
  pastApps: Application[],
): SilverMedalistMatch[] {
  const target = (newJob.title + ' ' + newJob.jobConfig.description + ' ' + newJob.jobConfig.qualifications + ' ' + newJob.jobConfig.industry).toLowerCase();
  const targetTokens = tokenize(target);
  const eligible = pastApps.filter((a) => a.status === 'rejected' && a.report && a.report.overallScore >= 60);
  const scored = eligible.map((a) => {
    const hay = ((a.report?.summary ?? '') + ' ' + (a.transcriptEnglish ?? '') + ' ' + (a.jobTitle ?? '')).toLowerCase();
    const hayTokens = tokenize(hay);
    const overlapTokens = [...targetTokens].filter((t) => hayTokens.has(t));
    const overlap = overlapTokens.length;
    const base = a.report?.overallScore ?? 0;
    const match = Math.min(100, Math.round(base * 0.6 + overlap * 4));
    const reason = overlap >= 3
      ? `Strong overlap: ${overlapTokens.slice(0, 4).join(', ')}`
      : `Previous score ${base} from ${a.jobTitle}`;
    return { app: a, score: match, reason };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, 3);
}

function tokenize(s: string): Set<string> {
  return new Set(s.split(/[^a-z0-9+#]+/i).filter((t) => t.length > 3));
}

// ---------- Live AI coach (interview sidebar) -------------------------------

export interface CoachHint {
  kind: 'follow-up' | 'strength' | 'concern' | 'topic';
  text: string;
}

/**
 * Given the conversation so far, produce follow-up questions + signal
 * callouts for the recruiter watching live. Pure local heuristics for now
 * — a real system would stream this from a backend flow.
 */
export function generateCandidateHints(
  transcript: { role: 'agent' | 'candidate' | 'system'; text: string }[],
): CoachHint[] {
  const hints: CoachHint[] = [];
  const lastCandidate = [...transcript].reverse().find((m) => m.role === 'candidate')?.text?.toLowerCase() ?? '';
  const lastAgent = [...transcript].reverse().find((m) => m.role === 'agent')?.text?.toLowerCase() ?? '';

  if (transcript.length <= 2) {
    hints.push({ kind: 'strength', text: 'Opening tip: greet briefly, then dive straight into your answer.' });
  }
  if (lastAgent && !lastCandidate) {
    hints.push({ kind: 'follow-up', text: 'Take a breath — a 2-second pause before answering is completely fine.' });
  }
  if (lastCandidate && lastCandidate.length < 30) {
    hints.push({ kind: 'concern', text: 'That answer was quite short — consider adding one concrete example.' });
  }
  if (/\bwe\b|\bour team\b/.test(lastCandidate) && !/\bi\b/.test(lastCandidate)) {
    hints.push({ kind: 'follow-up', text: 'Say what *you* personally did, not just what the team did.' });
  }
  if (/result|outcome|metric|kpi|growth|\d+%|percent/.test(lastCandidate)) {
    hints.push({ kind: 'strength', text: 'Great — quantifying outcomes is exactly what interviewers remember.' });
  }
  return hints.slice(0, 3);
}

export function generateCoachHints(
  transcript: { role: 'agent' | 'candidate' | 'system'; text: string }[],
  job: { title: string; jobConfig: { redFlags: string[]; topics: string[]; qualifications: string } },
): CoachHint[] {
  const last = transcript.filter((m) => m.role === 'candidate').slice(-3).map((m) => m.text).join(' ').toLowerCase();
  const hints: CoachHint[] = [];

  if (last.length < 30 && transcript.filter((m) => m.role === 'candidate').length > 1) {
    hints.push({ kind: 'concern', text: 'Short answer — consider asking for a specific example.' });
  }
  if (/\bteam\b|\bwe\b/.test(last) && !/\bi\b/.test(last)) {
    hints.push({ kind: 'follow-up', text: 'They answered with "we". Ask what *their* specific role was.' });
  }
  if (/never|don'?t know|not sure|unsure/.test(last)) {
    hints.push({ kind: 'concern', text: 'Uncertainty detected — probe for prior learning experiences.' });
  }
  if (/result|outcome|metric|kpi|growth|percent|%/.test(last)) {
    hints.push({ kind: 'strength', text: 'Outcome-focused answer 👍 — anchor on the metric.' });
  }
  // Suggest an un-covered topic
  const covered = transcript.map((m) => m.text).join(' ').toLowerCase();
  const uncovered = job.jobConfig.topics.find((t) => !covered.includes(t.toLowerCase()));
  if (uncovered) hints.push({ kind: 'topic', text: `Still to cover: "${uncovered}"` });
  // Red-flag probe
  const rf = job.jobConfig.redFlags.find((r) => !covered.includes(r.toLowerCase().slice(0, 12)));
  if (rf) hints.push({ kind: 'follow-up', text: `Probe red-flag area: ${rf}` });

  return hints.slice(0, 4);
}

// ---------- Smart rejection draft -------------------------------------------

export function draftRejection(app: Application, tone: 'warm' | 'brief' = 'warm'): string {
  const first = (app.candidateName || 'there').split(/\s+/)[0];
  const score = app.report?.overallScore ?? 0;
  const strengths = app.report?.rubricScores?.length
    ? app.report.rubricScores.sort((a, b) => b.score - a.score).slice(0, 2).map((x) => x.label)
    : Object.entries(app.report?.scores ?? {})
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .slice(0, 2)
        .map(([k]) => humaniseAxis(k));
  const growth = Object.entries(app.report?.scores ?? {})
    .sort((a, b) => (a[1] as number) - (b[1] as number))[0];
  const growthLabel = growth ? humaniseAxis(growth[0]) : 'depth of experience';
  if (tone === 'brief') {
    return `Hi ${first},\n\nThank you for interviewing for ${app.jobTitle}. After careful review we won't be moving forward with your application this round. We appreciated your time and wish you the best in your search.\n\nBest,\nThe hiring team`;
  }
  return `Hi ${first},\n\nThank you for taking the time to interview for ${app.jobTitle}. This was a genuinely competitive round and we've decided to move forward with other candidates.\n\nA few things we thought went well: ${strengths.join(' and ')}. ${score >= 70 ? "Your scores were strong overall" : "Your answers showed real potential"}, and the area where the team felt most hesitation was around ${growthLabel.toLowerCase()}.\n\nWe'd encourage you to apply again in future — roles open here regularly, and we'll keep your application on file in case something closer to your profile opens up.\n\nWishing you the very best,\nThe hiring team`;
}

function humaniseAxis(k: string): string {
  return ({
    qualification: 'Qualification fit',
    communication: 'Communication',
    confidence: 'Confidence under pressure',
    roleFit: 'Role alignment',
  } as Record<string, string>)[k] ?? k;
}

// ---------- Share / shortlink -----------------------------------------------

export function makeShortCode(): string {
  const alphabet = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 7; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export function buildPublicUrl(agencySlug: string, jobSlug: string): string {
  const base = typeof window === 'undefined' ? '' : window.location.origin;
  return `${base}/${agencySlug}/${jobSlug}`;
}

// ---------- Tiny helpers -----------------------------------------------------

function clamp(n: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, n)); }

function hash32(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
