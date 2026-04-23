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
    icon: '🎨',
    title: 'Welcome to Recruitation.io',
    body: "You're set up and ready to go. Here's how to get your first interview running in 5 minutes.",
    tip: 'Your branded application link is live at recruitation.io/[your-slug]/[job-slug]. Candidates click it and go straight to a voice interview.',
  },
  {
    icon: '📋',
    title: 'Create your first job',
    body: 'Head to Jobs → New Job. Describe the role, set the interview language, duration, and tone. Add optional red-flag probes — things you want the AI to subtly check for.',
    tip: 'You can upload a PDF job spec and we\'ll auto-populate the fields using AI.',
  },
  {
    icon: '🔗',
    title: 'Share the link',
    body: "Copy your job's branded link and share it anywhere — job boards, LinkedIn, email, WhatsApp. Each click goes directly into a live AI voice interview.",
    tip: '10 credits = 1 job post. 5 credits = 1 AI interview analysis. 2 credits = 1 approval email.',
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
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) finish(); }}
    >
      <div
        className="card"
        style={{
          width: 480, maxWidth: '95vw', padding: 36,
          borderRadius: 18, boxShadow: 'var(--shadow-lg, 0 20px 60px rgba(0,0,0,0.2))',
        }}
      >
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                height: 4, flex: 1, borderRadius: 999,
                background: i <= step ? 'var(--brand)' : 'var(--border-soft)',
                transition: 'background 300ms',
              }}
            />
          ))}
        </div>

        <div style={{ fontSize: 40, marginBottom: 12 }}>{current.icon}</div>
        <h3 style={{ marginBottom: 12 }}>{current.title}</h3>
        <p style={{ lineHeight: 1.7, color: 'var(--text-2, #4b5563)', marginBottom: 16 }}>{current.body}</p>

        <div
          className="small"
          style={{
            background: 'var(--brand-50)', border: '1px solid var(--brand)',
            borderRadius: 10, padding: '10px 14px', marginBottom: 28, lineHeight: 1.6,
          }}
        >
          💡 {current.tip}
        </div>

        <div className="row-between">
          <button
            className="btn btn-ghost btn-sm"
            onClick={finish}
          >
            Skip tour
          </button>
          <div className="row-flex">
            {step > 0 && (
              <Button variant="secondary" size="sm" onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
            )}
            {isLast ? (
              <Button onClick={goCreateJob}>Create first job →</Button>
            ) : (
              <Button onClick={() => setStep((s) => s + 1)}>Next →</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
