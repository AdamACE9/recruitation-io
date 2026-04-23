import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function Landing() {
  return (
    <>
      {/* HERO */}
      <section className="hero-gradient" style={{ padding: '96px 0 72px' }}>
        <div className="container t-center">
          <Badge kind="success" className="mono tiny" >LIVE · Voice AI screening in 27 languages</Badge>
          <h1 style={{ marginTop: 18, maxWidth: 860, marginInline: 'auto' }}>
            The first-round phone screen, automated{' '}
            <span style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-800))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              better than a human.
            </span>
          </h1>
          <p className="muted" style={{ marginTop: 20, fontSize: 18, maxWidth: 640, marginInline: 'auto', lineHeight: 1.55 }}>
            Recruitation.io runs real voice interviews with every applicant, probes red flags,
            runs technical tests, verifies institutions, and delivers a ranked shortlist in minutes.
          </p>
          <div className="row-flex" style={{ justifyContent: 'center', gap: 10, marginTop: 30 }}>
            <Link to="/signup/agency"><Button size="lg">Start free — 20 credits</Button></Link>
            <a href="#how"><Button variant="secondary" size="lg">See how it works</Button></a>
          </div>
          <div className="row-flex muted tiny mono" style={{ justifyContent: 'center', marginTop: 22, gap: 14, flexWrap: 'wrap' }}>
            <span>SOC 2 ready</span><span>·</span><span>GDPR aligned</span><span>·</span>
            <span>Voice cloning detection</span><span>·</span><span>White-label ready</span>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="container" style={{ marginTop: 40 }}>
        <div className="grid-4">
          {[
            { n: '9×', l: 'More candidates screened per recruiter-hour' },
            { n: '27', l: 'Languages supported out of the box' },
            { n: '$0.50', l: 'Average AI cost per complete interview' },
            { n: '< 2 min', l: 'From interview end to ranked report' },
          ].map((s) => (
            <div key={s.l} className="card-tight card t-center">
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--brand)' }}>{s.n}</div>
              <div className="small muted" style={{ marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="container" style={{ marginTop: 96 }}>
        <div className="t-center stack-3" style={{ marginBottom: 40 }}>
          <span className="chip chip-brand" style={{ margin: '0 auto' }}>How it works</span>
          <h2>Six steps from posting to placement.</h2>
        </div>
        <div className="grid-2">
          {[
            { t: '1 · Agency onboarding', d: 'Sign up, upload your logo, pick a brand color. Admin approves + tops up credits. You get /your-slug — fully white-labeled.' },
            { t: '2 · Job creation wizard', d: 'Fill the form or drop a job-spec PDF — Gemini extracts every field. Add example technical questions with images, and an optional handbook PDF for context.' },
            { t: '3 · Candidates apply', d: 'They land on your branded page, create an account, upload CV + LinkedIn, pick their language, and hit apply.' },
            { t: '4 · Tailored prep', d: 'Gemini reads the CV. Groq writes 3–5 interview questions tailored to the candidate. Google Custom Search pulls images from trusted sources.' },
            { t: '5 · Voice interview', d: 'ElevenLabs runs an 8–15 minute conversation with red-flag probing and silent scoring of technical tests.' },
            { t: '6 · Ranked dashboard', d: 'Candidates pre-sorted by score. Full transcripts, audio, verifications, Signal Score™. One click to approve — full contact details + handbook unlocked.' },
            { t: '+ · Voice cloning detection', d: 'Every interview is checked for synthetic voice markers. Caught deepfakes flagged red.' },
          ].map((s) => (
            <div key={s.t} className="card">
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, marginBottom: 6 }}>{s.t}</div>
              <div className="muted">{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="container" style={{ marginTop: 96 }}>
        <div className="t-center stack-3" style={{ marginBottom: 40 }}>
          <span className="chip chip-brand" style={{ margin: '0 auto' }}>Pricing</span>
          <h2>Credit-based. No surprises.</h2>
          <div className="muted">Pay only for what you post and interview.</div>
        </div>
        <div className="grid-3">
          <div className="card t-center">
            <div className="lbl-sm">Starter</div>
            <div style={{ fontSize: 36, fontFamily: 'var(--font-display)', fontWeight: 800 }}>Free</div>
            <div className="muted small">20 credits on approval</div>
            <hr className="divider" />
            <div className="small stack stack-2 muted t-center">
              <div>4 jobs · 0 interviews</div>
              <div>White-label portal</div>
              <div>Ranked dashboard</div>
            </div>
            <Link to="/signup/agency"><Button block style={{ marginTop: 18 }}>Start free</Button></Link>
          </div>
          <div className="card t-center" style={{ borderColor: 'var(--brand)', boxShadow: 'var(--shadow-md)' }}>
            <div className="lbl-sm" style={{ color: 'var(--brand)' }}>Growth</div>
            <div style={{ fontSize: 36, fontFamily: 'var(--font-display)', fontWeight: 800 }}>$495<span className="muted" style={{ fontSize: 16, fontWeight: 500 }}>/mo</span></div>
            <div className="muted small">300 credits / month</div>
            <hr className="divider" />
            <div className="small stack stack-2 muted t-center">
              <div>~25 jobs · 140 interviews</div>
              <div>Everything in Starter</div>
              <div>Tailored AI questions per candidate</div>
              <div>Branded selection emails</div>
            </div>
            <Link to="/signup/agency"><Button block style={{ marginTop: 18 }}>Start free</Button></Link>
          </div>
          <div className="card t-center">
            <div className="lbl-sm">Enterprise</div>
            <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 800 }}>Custom</div>
            <div className="muted small">Volume credits + SSO</div>
            <hr className="divider" />
            <div className="small stack stack-2 muted t-center">
              <div>Dedicated success team</div>
              <div>Custom calibration</div>
              <div>On-prem data residency</div>
            </div>
            <a href="mailto:sales@recruitation.io"><Button block variant="secondary" style={{ marginTop: 18 }}>Talk to sales</Button></a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container" style={{ marginTop: 96 }}>
        <div className="card-hero t-center" style={{ background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-800) 100%)', color: '#fff' }}>
          <h2 style={{ color: '#fff' }}>Ready to screen 500 candidates by lunch?</h2>
          <p style={{ opacity: 0.85, marginTop: 10, maxWidth: 520, marginInline: 'auto' }}>
            Start free. Twenty credits. Four jobs. Zero cards.
          </p>
          <div className="row-flex" style={{ justifyContent: 'center', gap: 10, marginTop: 22 }}>
            <Link to="/signup/agency"><Button size="lg" variant="secondary">Create agency account</Button></Link>
          </div>
        </div>
      </section>
    </>
  );
}
