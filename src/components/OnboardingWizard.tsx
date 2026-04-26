// ============================================================
// Agency first-run onboarding wizard
// Shown when agency.onboardingComplete !== true
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { updateAgency } from '@/services/agencies';
import { Button } from '@/components/ui/Button';

const STEPS = [
  {
    icon: '🚀',
    color: '#1a7a3c',
    glow: 'rgba(26,122,60,0.35)',
    badge: 'Welcome',
    title: "You're live on Recruitation.AI",
    body: 'Your branded application link is active. Candidates click it and go straight into a live voice interview — no scheduling, no human in the loop.',
    tip: 'Your link: recruitation.io/[your-slug]/[job-slug] is already working. Share it anywhere and candidates start interviewing instantly.',
    checks: [
      'Branded application portal is live',
      '20 starter credits added to your account',
      'AI interviews available in 12+ languages',
    ],
  },
  {
    icon: '📋',
    color: '#1a56a0',
    glow: 'rgba(26,86,160,0.35)',
    badge: 'Step 1',
    title: 'Create your first job',
    body: 'Go to Jobs → New Job. Set the role, interview language, duration, and tone. Add red-flag probes — things the AI will subtly check for without candidates knowing.',
    tip: 'Upload a PDF job spec and AI will auto-fill every field for you in seconds.',
    checks: [
      'Costs 10 credits to post a job',
      'AI extracts key requirements automatically',
      'Red-flag probes stay hidden from candidates',
    ],
  },
  {
    icon: '🔗',
    color: '#7c3aed',
    glow: 'rgba(124,58,237,0.35)',
    badge: 'Step 2',
    title: 'Share the link & get results',
    body: "Copy your job's branded link and paste it on LinkedIn, job boards, WhatsApp — wherever. Each click drops the candidate into a full voice interview, ranked and scored.",
    tip: 'Interview analysis costs 5 credits. Results land in your pipeline with a full Signal Score report within minutes.',
    checks: [
      '5 credits per AI interview analysis',
      'Full Signal Score report per candidate',
      'Pipeline sorts candidates by score automatically',
    ],
  },
];

interface Props {
  onClose: () => void;
}

export function OnboardingWizard({ onClose }: Props) {
  const [step, setStep] = useState(0);
  const { agency, refresh } = useAuth();
  const nav = useNavigate();

  async function finish() {
    if (agency) {
      await updateAgency(agency.id, { onboardingComplete: true }).catch(() => null);
      await refresh();
    }
    onClose();
  }

  async function goCreateJob() {
    await finish();
    nav('/jobs/new');
  }

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(5,8,15,0.7)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 20,
        animation: 'fadeIn 200ms ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) finish(); }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: none; } }
        @keyframes stepIn { from { opacity: 0; transform: translateX(8px); } to { opacity: 1; transform: none; } }
      `}</style>

      <div style={{
        width: 'min(560px, 100%)',
        background: 'var(--surface)', borderRadius: 24,
        boxShadow: '0 32px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.06)',
        overflow: 'hidden',
        animation: 'slideUp 260ms cubic-bezier(0.22,0.61,0.36,1)',
      }}>

        {/* Top color bar + step icon */}
        <div style={{
          background: `linear-gradient(135deg, ${current.color}20 0%, ${current.color}08 100%)`,
          borderBottom: `1px solid ${current.color}20`,
          padding: '32px 36px 28px',
          position: 'relative', overflow: 'hidden',
          animation: 'stepIn 220ms ease',
        }}>
          {/* decorative ring */}
          <div style={{
            position: 'absolute', right: -40, top: -40,
            width: 180, height: 180, borderRadius: '50%',
            border: `2px solid ${current.color}15`,
          }} />
          <div style={{
            position: 'absolute', right: -10, top: -10,
            width: 120, height: 120, borderRadius: '50%',
            border: `2px solid ${current.color}10`,
          }} />

          {/* Progress bar */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
            {STEPS.map((_, i) => (
              <div
                key={i}
                style={{
                  height: 4, flex: 1, borderRadius: 999,
                  background: i <= step ? current.color : 'var(--border)',
                  transition: 'background 300ms ease, opacity 300ms ease',
                  opacity: i > step ? 0.4 : 1,
                }}
              />
            ))}
          </div>

          {/* Icon + badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: `linear-gradient(135deg, ${current.color}25 0%, ${current.color}10 100%)`,
              border: `1px solid ${current.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24,
              boxShadow: `0 4px 16px ${current.glow}`,
            }}>
              {current.icon}
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', padding: '4px 12px',
              background: `${current.color}15`, border: `1px solid ${current.color}30`,
              borderRadius: 999, fontSize: 11, fontWeight: 700, color: current.color, letterSpacing: '0.06em',
            }}>
              {current.badge}
            </div>
          </div>

          <h3 style={{ fontSize: 20, letterSpacing: '-0.02em', color: 'var(--ink)', lineHeight: 1.25, marginBottom: 8 }}>
            {current.title}
          </h3>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink-muted)' }}>
            {current.body}
          </p>
        </div>

        {/* Bottom content */}
        <div style={{ padding: '24px 36px 28px' }}>

          {/* Checklist */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {current.checks.map((c) => (
              <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  background: `${current.color}15`, border: `1px solid ${current.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: current.color, fontWeight: 700,
                }}>✓</div>
                <span style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.4 }}>{c}</span>
              </div>
            ))}
          </div>

          {/* Tip box */}
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            background: 'var(--surface-2)', border: '1px solid var(--border-soft)',
            borderLeft: `3px solid ${current.color}`,
            borderRadius: '0 10px 10px 0', padding: '11px 14px', marginBottom: 24,
          }}>
            <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>💡</span>
            <p style={{ fontSize: 12.5, lineHeight: 1.65, color: 'var(--ink-muted)' }}>{current.tip}</p>
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              style={{
                fontSize: 13, color: 'var(--ink-muted)', background: 'none', border: 'none',
                cursor: 'pointer', padding: '6px 0',
              }}
              onClick={finish}
            >
              Skip tour
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              {step > 0 && (
                <Button variant="secondary" size="sm" onClick={() => setStep((s) => s - 1)}>
                  ← Back
                </Button>
              )}
              {isLast ? (
                <Button onClick={goCreateJob}>
                  Create first job →
                </Button>
              ) : (
                <Button onClick={() => setStep((s) => s + 1)}>
                  Next →
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
