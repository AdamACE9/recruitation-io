// ============================================================
// Recruitation.AI — Landing v3  (adaptive dark/light, full anim)
// ============================================================
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

/* ─── Theme ─────────────────────────────────────────────────── */
const D = {
  bg:'#070a14', bg2:'#0d1626',
  card:'rgba(255,255,255,0.028)', cardHov:'rgba(255,255,255,0.055)',
  border:'rgba(255,255,255,0.08)', borderAcc:'rgba(26,122,60,0.45)',
  t:'#f1f5f9', tm:'#94a3b8', td:'#64748b',
  nav:'rgba(7,10,20,0.88)',
  chip:'rgba(26,122,60,0.10)', chipB:'rgba(26,122,60,0.30)',
  tag:'rgba(255,255,255,0.04)', tagB:'rgba(255,255,255,0.07)', tagT:'#475569',
  ghost:'rgba(255,255,255,0.12)', ghostT:'#94a3b8',
  ft:'rgba(255,255,255,0.06)', ftT:'#334155',
};
const L = {
  bg:'#f8fafc', bg2:'#f1f5f9',
  card:'rgba(255,255,255,0.85)', cardHov:'#fff',
  border:'rgba(0,0,0,0.08)', borderAcc:'rgba(26,122,60,0.40)',
  t:'#0f172a', tm:'#475569', td:'#94a3b8',
  nav:'rgba(248,250,252,0.93)',
  chip:'rgba(26,122,60,0.07)', chipB:'rgba(26,122,60,0.22)',
  tag:'rgba(0,0,0,0.04)', tagB:'rgba(0,0,0,0.06)', tagT:'#64748b',
  ghost:'rgba(0,0,0,0.09)', ghostT:'#475569',
  ft:'rgba(0,0,0,0.06)', ftT:'#94a3b8',
};
type TH = typeof D;

/* ─── Data ──────────────────────────────────────────────────── */
const HEIGHTS = [18,28,14,36,22,32,16,26,38,20,30,12,34,24,40,18,28,22,36,16];

const TRANSCRIPT = [
  { role:'agent' as const, text:"Hi Sarah — walk me through leading a distributed systems migration at scale." },
  { role:'cand'  as const, text:"Sure. I led the full monolith-to-microservices migration — auth, rate-limiting, distributed tracing, the works." },
  { role:'agent' as const, text:"Specific question: how did you handle race conditions during the cutover window?" },
  { role:'cand'  as const, text:"Redis distributed locks with TTL, plus circuit breakers for graceful degradation under partial failure." },
  { role:'agent' as const, text:"I noticed a 6-month gap on your LinkedIn. What were you working on?" },
];
const SCORES = [
  { l:'Technical Depth', v:91 },
  { l:'Communication',   v:87 },
  { l:'Confidence',      v:82 },
  { l:'Role Fit',        v:89 },
];

const PIPE_STEPS = [
  { icon:'📄', t:'CV Uploaded',      detail:'Sarah Chen · Stanford MS · 6y ML at Google' },
  { icon:'🧠', t:'AI Analysis',      detail:'3 tailored questions · 2 red flags detected' },
  { icon:'🎙️', t:'Voice Interview',  detail:'14 min · 47 exchanges · deepfake: clean' },
  { icon:'🔍', t:'Verification',     detail:'Stanford ✓ · Google ✓ · Patent claim ✓' },
  { icon:'📊', t:'Report Ready',     detail:'Signal Score 94 · Recommendation: HIRE' },
];

const CORE_FEAT = [
  { icon:'🧠', t:'Tailored AI Questions',   d:'Gemini reads the CV. Groq writes 3–5 questions tailored to that exact candidate. No cookie-cutter scripts.' },
  { icon:'🎙️', t:'Real Voice Interview',    d:'ElevenLabs runs an 8–15 min conversation — probes red flags, runs technical tests, stays natural throughout.' },
  { icon:'🏛️', t:'Institution Verification',d:'Every university and employer mentioned is verified server-side using Gemini after the call.' },
  { icon:'🕵️', t:'Anti-Deepfake Shield',   d:'Synthetic voice markers checked live. Caught deepfakes flagged red before they reach your shortlist.' },
  { icon:'📊', t:'Ranked Shortlist',        d:'Candidates pre-sorted by overall score, Signal Score™, and recommendation. Full audio + transcript included.' },
  { icon:'🌍', t:'27 Languages',            d:"Interview in the candidate's preferred language. Transcripts auto-translated to English for your team." },
];

const POWER_FEAT = [
  { icon:'⚔️', t:'Side-by-Side Comparison', d:'Pick any 2–3 candidates. AI creates a head-to-head matrix — technical depth, communication, experience fit. Settle shortlist debates in 30 seconds.' },
  { icon:'🎯', t:'Custom Scoring Rubrics',  d:"Define what 'excellent' means for your role. AI auto-scores every answer against your rubric. Fair, consistent, fully documentable for compliance." },
  { icon:'💰', t:'Salary Intelligence',     d:"Based on verified experience, AI estimates fair market comp range. Stop losing candidates to mismatch — and stop overpaying for average." },
  { icon:'🔁', t:'Full Interview Replay',   d:'Watch or listen back with AI-generated chapter markers. Jump straight to technical questions, red-flag moments, or culture fit signals.' },
  { icon:'🗺️', t:'Candidate Journey Map',  d:'Every interaction from CV upload to offer tracked on a visual timeline. Full audit trail for compliance. Never lose context mid-process.' },
];

const SMALL_FEAT = [
  { icon:'⌨️', t:'Keyboard Shortcuts',       d:'J/K to navigate, Space to play audio, E to export — no mouse required' },
  { icon:'🔔', t:'Slack & Teams Webhooks',   d:'Instant ping when a top-scorer finishes their interview' },
  { icon:'📤', t:'One-Click ATS Export',     d:'Push directly to Greenhouse, Lever, or Workday' },
  { icon:'📬', t:'Bulk Branded Emails',      d:'Custom rejection or invite emails to 50+ candidates at once' },
  { icon:'📊', t:'Skills Heat Map',          d:'Visual matrix of skill gaps across your entire applicant pool' },
];

const TEMPLATES = [
  { role:'Senior Software Engineer', level:'L5/L6',      questions:5, est:'12 min', lang:'English', tags:['System design','Distributed systems','Leadership'] },
  { role:'Product Manager',          level:'Senior',      questions:4, est:'10 min', lang:'English', tags:['Strategy','Prioritization','Metrics'] },
  { role:'Data Scientist',           level:'Mid–Senior',  questions:5, est:'14 min', lang:'Multi',   tags:['ML/AI','Statistics','Python'] },
];

const PLANS = [
  { name:'Starter',    price:'Free',  period:'',    sub:'20 credits on approval',        hot:false, feat:['4 job postings','White-label portal','AI analysis reports','Ranked dashboard'] },
  { name:'Growth',     price:'$495',  period:'/mo', sub:'300 credits · ~140 interviews', hot:true,  feat:['Everything in Starter','Tailored AI questions per candidate','Branded selection emails','Signal Score™ + full audio','Side-by-side comparison'] },
  { name:'Enterprise', price:'Custom',period:'',    sub:'Volume + SSO + on-prem',        hot:false, feat:['Dedicated success team','Custom calibration model','On-prem data residency','SLA + priority support'] },
];

/* ─── Hooks ─────────────────────────────────────────────────── */
function useDark(): boolean {
  const [dark, setDark] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme:dark)').matches
      : true
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme:dark)');
    const h = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);
  return dark;
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-sr]');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement;
          const d = el.getAttribute('data-sr-delay') ?? '0';
          el.style.transitionDelay = d + 's';
          el.classList.add('sr-vis');
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ─── WaveBar ────────────────────────────────────────────────── */
function WaveBar({ i, act }: { i: number; act: boolean }) {
  const h = HEIGHTS[i % HEIGHTS.length];
  const col = i % 3 === 0 ? '#39d98a' : i % 3 === 1 ? '#1a7a3c' : 'rgba(57,217,138,0.35)';
  return (
    <div style={{
      width:3, borderRadius:3, background:col,
      height: act ? h : 3,
      transition:`height ${0.3+(i%5)*0.08}s ease ${(i*0.04)%0.4}s`,
      flexShrink:0,
    }} />
  );
}

/* ─── HeroWidget ─────────────────────────────────────────────── */
function HeroWidget() {
  const [msgs, setMsgs] = useState<typeof TRANSCRIPT>([]);
  const [wave, setWave] = useState(false);
  const [scores, setScores] = useState([0,0,0,0]);
  const [elapsed, setElapsed] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const idx = useRef(0);

  useEffect(() => {
    const tick = setInterval(() => setElapsed(t => t + 1), 1000);
    const addMsg = () => {
      if (idx.current >= TRANSCRIPT.length) { idx.current = 0; setMsgs([]); return; }
      const m = TRANSCRIPT[idx.current++];
      setWave(true);
      setTimeout(() => setWave(false), 1200);
      setMsgs(p => [...p, m]);
    };
    const mt = setInterval(addMsg, 2800);
    addMsg();
    setTimeout(() => setScores(SCORES.map(s => s.v)), 4000);
    return () => { clearInterval(tick); clearInterval(mt); };
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs]);

  const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const secs = (elapsed % 60).toString().padStart(2, '0');

  return (
    <div style={{ position:'relative', width:'100%', maxWidth:440 }}>
      <div style={{ position:'absolute', inset:-40, borderRadius:'50%', background:'radial-gradient(ellipse at center,rgba(26,122,60,0.25) 0%,transparent 70%)', filter:'blur(24px)', pointerEvents:'none' }} />
      <div style={{ position:'relative', background:'rgba(13,21,38,0.88)', border:'1px solid rgba(26,122,60,0.35)', borderRadius:20, backdropFilter:'blur(20px)', boxShadow:'0 8px 32px rgba(0,0,0,0.5),inset 0 0 0 1px rgba(255,255,255,0.04)', overflow:'hidden' }}>
        <div style={{ height:2, background:'linear-gradient(90deg,transparent,#1a7a3c,#39d98a,transparent)', opacity:.8 }} />

        {/* Header */}
        <div style={{ padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'rgba(26,122,60,0.12)', border:'1px solid rgba(26,122,60,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🎙️</div>
            <div>
              <div style={{ fontWeight:700, fontSize:13, color:'#f1f5f9' }}>Live Interview</div>
              <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:2 }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 8px rgba(34,197,94,0.8)', animation:'pulseDot 1.5s ease-in-out infinite' }} />
                <span style={{ fontFamily:'monospace', fontSize:10, color:'#22c55e' }}>ACTIVE</span>
              </div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(26,122,60,0.12)', border:'1px solid rgba(26,122,60,0.25)', borderRadius:20, padding:'4px 10px' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:'#1a7a3c' }} />
            <span style={{ fontFamily:'monospace', fontSize:10, color:'#39d98a', fontWeight:600 }}>REC {mins}:{secs}</span>
          </div>
        </div>

        {/* Waveform */}
        <div style={{ padding:'14px 20px', display:'flex', alignItems:'center', gap:3, height:54, borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
          {Array.from({ length:20 }).map((_,i) => <WaveBar key={i} i={i} act={wave} />)}
        </div>

        {/* Transcript */}
        <div ref={scrollRef} style={{ padding:'12px 16px', height:180, overflowY:'auto', display:'flex', flexDirection:'column', gap:10, scrollbarWidth:'none' }}>
          {msgs.length === 0 && <div style={{ margin:'auto', color:'#475569', fontSize:12 }}>Connecting…</div>}
          {msgs.map((m, i) => (
            <div key={i} style={{ display:'flex', flexDirection:'column', alignItems: m.role === 'agent' ? 'flex-start' : 'flex-end', animation:'fadeUp 0.35s ease forwards' }}>
              <span style={{ fontSize:9, color:'#475569', marginBottom:3, paddingInline:4 }}>{m.role === 'agent' ? 'Recruitation AI' : 'Candidate · Sarah K.'}</span>
              <div style={{
                maxWidth:'85%', padding:'7px 11px',
                borderRadius: m.role === 'agent' ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                background: m.role === 'agent' ? 'rgba(26,122,60,0.14)' : 'rgba(30,40,60,0.8)',
                border:`1px solid ${m.role === 'agent' ? 'rgba(26,122,60,0.25)' : 'rgba(255,255,255,0.06)'}`,
                fontSize:12, color: m.role === 'agent' ? '#86efac' : '#cbd5e1', lineHeight:1.5,
              }}>{m.text}</div>
            </div>
          ))}
        </div>

        {/* Score bars */}
        <div style={{ padding:'14px 20px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontFamily:'monospace', fontSize:9, color:'#475569', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>Live Score</div>
          {SCORES.map((s, i) => (
            <div key={s.l} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:7 }}>
              <span style={{ fontSize:10, color:'#64748b', width:110, flexShrink:0 }}>{s.l}</span>
              <div style={{ flex:1, height:4, background:'rgba(255,255,255,0.06)', borderRadius:2, overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:2, background:'linear-gradient(90deg,#1a7a3c,#39d98a)', width:`${scores[i]}%`, transition:`width 1.2s cubic-bezier(0.22,0.61,0.36,1) ${i*0.15}s`, boxShadow:'0 0 6px rgba(57,217,138,0.4)' }} />
              </div>
              <span style={{ fontFamily:'monospace', fontSize:10, color:'#39d98a', width:28, textAlign:'right' }}>{scores[i]}%</span>
            </div>
          ))}
        </div>

        {/* Badge */}
        <div style={{ position:'absolute', bottom:-20, right:-12, background:'rgba(13,21,38,0.9)', border:'1px solid rgba(26,122,60,0.2)', borderRadius:12, backdropFilter:'blur(12px)', padding:'8px 14px', display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 8px rgba(34,197,94,0.8)', display:'inline-block' }} />
          <span style={{ fontSize:11, color:'#94a3b8' }}>Report ready in ~2 min</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Typewriter ─────────────────────────────────────────────── */
function Typewriter({ text }: { text: string }) {
  const [shown, setShown] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let iv: ReturnType<typeof setInterval>;
    const t = setTimeout(() => {
      let i = 0;
      iv = setInterval(() => {
        if (i < text.length) {
          setShown(text.slice(0, ++i));
        } else {
          setDone(true);
          clearInterval(iv);
        }
      }, 60);
    }, 900);
    return () => { clearTimeout(t); clearInterval(iv); };
  }, [text]);

  return (
    <span className="brand-grad">
      {shown || ' '}
      {!done && (
        <span style={{ borderRight:'2px solid #39d98a', marginLeft:1, animation:'blink 0.75s step-end infinite' }}>&nbsp;</span>
      )}
    </span>
  );
}

/* ─── Floating Orbs ──────────────────────────────────────────── */
function FloatingOrbs({ dark }: { dark: boolean }) {
  type Orb = { w:number; h:number; top?:string; bottom?:string; left?:string; right?:string; delay:string; dur:string; alpha:number };
  const orbs: Orb[] = [
    { w:700, h:700, top:'-15%',  left:'-12%',  delay:'0s', dur:'9s',  alpha: dark ? 0.18 : 0.07 },
    { w:450, h:450, top:'25%',   right:'-8%',  delay:'2s', dur:'11s', alpha: dark ? 0.09 : 0.04 },
    { w:320, h:320, bottom:'8%', left:'18%',   delay:'4s', dur:'8s',  alpha: dark ? 0.12 : 0.05 },
    { w:200, h:200, top:'55%',   right:'22%',  delay:'1s', dur:'10s', alpha: dark ? 0.07 : 0.03 },
  ];
  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
      {orbs.map((o, i) => (
        <div key={i} style={{
          position:'absolute',
          width:o.w, height:o.h,
          top:o.top, bottom:o.bottom, left:o.left, right:o.right,
          borderRadius:'50%',
          background:`radial-gradient(ellipse at center, rgba(26,122,60,${o.alpha}) 0%, transparent 70%)`,
          filter:'blur(40px)',
          animation:`orbFloat ${o.dur} ease-in-out ${o.delay} infinite alternate`,
        }} />
      ))}
    </div>
  );
}

/* ─── Pipeline "See It Live" ─────────────────────────────────── */
function Pipeline({ T, dark }: { T: TH; dark: boolean }) {
  const [active, setActive] = useState(0);
  const [done, setDone] = useState<number[]>([]);

  useEffect(() => {
    const iv = setInterval(() => {
      setActive(a => {
        const next = (a + 1) % PIPE_STEPS.length;
        if (next === 0) setDone([]);
        else setDone(d => [...d, a]);
        return next;
      });
    }, 2600);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 32px' }}>
      <div style={{ textAlign:'center', marginBottom:52 }} data-sr data-sr-delay="0">
        <span className="land-chip" style={{ background:T.chip, border:`1px solid ${T.chipB}`, marginBottom:16, display:'inline-flex' }}>See it live</span>
        <h2 className="land-h2" style={{ color:T.t, marginTop:12 }}>
          From CV to ranked report in{' '}
          <span className="brand-grad">under 2 minutes.</span>
        </h2>
        <p style={{ color:T.tm, fontSize:15, marginTop:10, maxWidth:500, marginInline:'auto' }}>
          Watch the pipeline run in real time. Every step automated.
        </p>
      </div>

      <div data-sr data-sr-delay="0.1" style={{ display:'flex', gap:0, alignItems:'stretch', position:'relative' }}>
        {PIPE_STEPS.map((s, i) => {
          const isActive = i === active;
          const isDone = done.includes(i);
          return (
            <div key={i} style={{ flex:1, position:'relative' }}>
              {/* Connector line */}
              {i < PIPE_STEPS.length - 1 && (
                <div style={{ position:'absolute', top:30, left:'50%', right:'-50%', height:2, background:T.border, zIndex:0 }}>
                  <div style={{ height:'100%', background:'linear-gradient(90deg,#1a7a3c,#39d98a)', width: isDone ? '100%' : isActive ? '50%' : '0%', transition:'width 0.7s ease' }} />
                </div>
              )}
              <div style={{
                margin:'0 6px',
                padding:'18px 14px',
                borderRadius:14,
                border:`1px solid ${isActive ? 'rgba(26,122,60,0.55)' : isDone ? 'rgba(26,122,60,0.25)' : T.border}`,
                background: isActive ? (dark ? 'rgba(26,122,60,0.10)' : 'rgba(26,122,60,0.06)') : T.card,
                transition:'all 0.4s ease',
                boxShadow: isActive ? '0 0 28px rgba(26,122,60,0.18)' : 'none',
                position:'relative', zIndex:1,
                transform: isActive ? 'translateY(-4px)' : 'none',
              }}>
                <div style={{ fontSize:24, marginBottom:10, filter: !isActive && !isDone ? 'grayscale(0.6)' : 'none', transition:'filter 0.4s' }}>{s.icon}</div>
                <div style={{ fontSize:12, fontWeight:700, color: isActive ? '#39d98a' : T.t, marginBottom:6, transition:'color 0.4s' }}>{s.t}</div>
                <div style={{ fontSize:11, color:T.td, lineHeight:1.55, minHeight:32, opacity: isActive ? 1 : 0.4, transition:'opacity 0.4s' }}>{s.detail}</div>
                {isDone && (
                  <div style={{ position:'absolute', top:10, right:10, width:18, height:18, borderRadius:'50%', background:'rgba(26,122,60,0.2)', border:'1px solid rgba(26,122,60,0.45)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#39d98a' }}>✓</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress dots */}
      <div data-sr data-sr-delay="0.15" style={{ display:'flex', justifyContent:'center', gap:8, marginTop:28 }}>
        {PIPE_STEPS.map((_, i) => (
          <div key={i} style={{ width: i === active ? 24 : 8, height:8, borderRadius:4, background: i === active ? '#39d98a' : done.includes(i) ? 'rgba(26,122,60,0.4)' : T.border, transition:'all 0.4s ease' }} />
        ))}
      </div>
    </div>
  );
}

/* ─── Main Landing ───────────────────────────────────────────── */
export default function Landing() {
  const dark = useDark();
  const T = dark ? D : L;
  useReveal();

  useEffect(() => {
    document.body.style.background = T.bg;
    document.body.style.color = T.t;
    return () => { document.body.style.background = ''; document.body.style.color = ''; };
  }, [dark, T.bg, T.t]);

  return (
    <>
      <style>{`
        @keyframes pulseDot  { 0%,100%{opacity:1;box-shadow:0 0 8px rgba(34,197,94,0.8);}50%{opacity:0.5;box-shadow:0 0 3px rgba(34,197,94,0.3);} }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;} }
        @keyframes blink     { 50%{opacity:0;} }
        @keyframes orbFloat  { from{transform:translateY(0) scale(1);}to{transform:translateY(-44px) scale(1.06);} }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .brand-grad {
          background: linear-gradient(135deg,#39d98a,#1a7a3c);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .land-h2 {
          font-family: var(--font-display,system-ui);
          font-weight: 800;
          font-size: clamp(1.9rem,3.5vw,2.8rem);
          letter-spacing: -0.03em;
        }
        .land-h3 { font-family: var(--font-display,system-ui); font-weight:700; font-size:1rem; }

        /* Scroll reveal */
        [data-sr] { opacity:0; transform:translateY(28px); transition:opacity 0.65s ease, transform 0.65s ease; }
        [data-sr].sr-vis { opacity:1; transform:none; }

        /* Chip */
        .land-chip {
          display:inline-flex; align-items:center; gap:7px;
          border-radius:9999px; padding:5px 14px;
          font-size:11px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:#39d98a;
        }

        /* Cards */
        .land-card {
          border-radius:16px;
          transition: border-color 0.28s, box-shadow 0.28s, transform 0.22s;
        }
        .land-card:hover {
          border-color: rgba(26,122,60,0.48) !important;
          box-shadow: 0 0 32px rgba(26,122,60,0.14) !important;
          transform: translateY(-3px);
        }

        /* Buttons */
        .land-btn-p {
          display:inline-flex; align-items:center; gap:8px;
          background:#1a7a3c; color:#fff; border:none;
          border-radius:9999px; padding:12px 24px;
          font-size:14px; font-weight:600; cursor:pointer; text-decoration:none;
          transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
          box-shadow: 0 0 20px rgba(26,122,60,0.35);
        }
        .land-btn-p:hover { background:#156430; transform:translateY(-2px); box-shadow:0 0 32px rgba(26,122,60,0.55); }
        .land-btn-g {
          display:inline-flex; align-items:center; gap:6px;
          background:transparent;
          border-radius:9999px; padding:11px 22px;
          font-size:14px; font-weight:500; cursor:pointer; text-decoration:none;
          transition: border-color 0.2s, color 0.2s;
        }
        .land-btn-g:hover { color:#39d98a !important; border-color:rgba(26,122,60,0.55) !important; }

        /* Nav link */
        .land-nl {
          font-size:12px; letter-spacing:0.1em; text-transform:uppercase;
          text-decoration:none; transition:color 0.2s;
        }
        .land-nl:hover { color:#39d98a !important; }

        /* Small feature card */
        .sf-card {
          border-radius:12px; padding:18px 20px;
          display:flex; align-items:flex-start; gap:14px;
          transition: border-color 0.25s, box-shadow 0.25s;
        }
        .sf-card:hover { border-color:rgba(26,122,60,0.38) !important; box-shadow:0 4px 20px rgba(26,122,60,0.10) !important; }

        /* Template card */
        .tmpl-card {
          border-radius:16px; padding:26px;
          transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
        }
        .tmpl-card:hover {
          border-color:rgba(26,122,60,0.5) !important;
          box-shadow:0 8px 36px rgba(26,122,60,0.13) !important;
          transform:translateY(-4px);
        }

        /* Responsive */
        @media (max-width:900px) {
          .hero-grid  { grid-template-columns:1fr !important; }
          .land-widget{ display:none !important; }
          .g3         { grid-template-columns:1fr !important; }
          .g2         { grid-template-columns:1fr !important; }
          .g4         { grid-template-columns:1fr 1fr !important; }
          .pipe-flex  { flex-direction:column !important; }
        }
        @media (max-width:600px) {
          .g4 { grid-template-columns:1fr !important; }
          nav .nav-links { display:none !important; }
        }
      `}</style>

      <div style={{ background:T.bg, color:T.t, minHeight:'100vh', position:'relative', overflowX:'hidden' }}>

        {/* ── NAV ───────────────────────────────────────────────── */}
        <nav style={{ position:'sticky', top:0, zIndex:50, borderBottom:`1px solid ${T.ft}`, backdropFilter:'blur(20px)', background:T.nav }}>
          <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 32px', height:68, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontWeight:800, fontSize:20, color:T.t, fontFamily:'var(--font-display,system-ui)', letterSpacing:'-0.02em' }}>
              Recruitation<span className="brand-grad">.io</span>
            </span>
            <div className="nav-links" style={{ display:'flex', alignItems:'center', gap:32 }}>
              <a href="#live"     className="land-nl" style={{ color:T.td }}>See it live</a>
              <a href="#how"      className="land-nl" style={{ color:T.td }}>How it works</a>
              <a href="#features" className="land-nl" style={{ color:T.td }}>Features</a>
              <a href="#pricing"  className="land-nl" style={{ color:T.td }}>Pricing</a>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <Link to="/login"          className="land-btn-g" style={{ border:`1px solid ${T.ghost}`, color:T.ghostT }}>Log in</Link>
              <Link to="/signup/agency"  className="land-btn-p">Start free →</Link>
            </div>
          </div>
        </nav>

        {/* ── HERO ──────────────────────────────────────────────── */}
        <section style={{ padding:'100px 0 80px', position:'relative', overflow:'hidden' }}>
          <FloatingOrbs dark={dark} />
          <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 32px', position:'relative', zIndex:1 }}>
            <div className="hero-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center' }}>

              {/* Copy */}
              <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
                <div data-sr data-sr-delay="0" style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                  <span className="land-chip" style={{ background:T.chip, border:`1px solid ${T.chipB}` }}>
                    <span style={{ width:7, height:7, borderRadius:'50%', background:'#39d98a', display:'inline-block', animation:'pulseDot 1.5s ease-in-out infinite' }} />
                    Live in 27 languages
                  </span>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:6, background:T.tag, border:`1px solid ${T.tagB}`, borderRadius:9999, padding:'5px 14px', fontSize:11, color:T.tagT }}>
                    <span style={{ color:'#39d98a', fontWeight:700 }}>Voice AI</span> · Zero bias screening
                  </span>
                </div>

                <h1 data-sr data-sr-delay="0.1" style={{ fontFamily:'var(--font-display,system-ui)', fontWeight:800, lineHeight:1.06, letterSpacing:'-0.04em', fontSize:'clamp(2.8rem,5.5vw,4.2rem)', color:T.t }}>
                  First-round<br />
                  interviews,{' '}
                  <Typewriter text="automated" /><br />
                  better than humans.
                </h1>

                <p data-sr data-sr-delay="0.18" style={{ fontSize:17, color:T.tm, lineHeight:1.65, maxWidth:480 }}>
                  Recruitation.io runs real voice interviews with every applicant — probes red flags, tests technical depth, verifies institutions, and delivers a ranked shortlist in under 2 minutes.
                </p>

                <div data-sr data-sr-delay="0.24" style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
                  <Link to="/signup/agency" className="land-btn-p">Start free — 20 credits →</Link>
                  <a href="#live" className="land-btn-g" style={{ border:`1px solid ${T.ghost}`, color:T.ghostT }}>See how it works ↓</a>
                </div>

                <div data-sr data-sr-delay="0.3" style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {['SOC 2 ready','GDPR aligned','Voice-clone detection','White-label'].map(tag => (
                    <span key={tag} style={{ fontSize:11, color:T.td, background:T.tag, border:`1px solid ${T.tagB}`, borderRadius:6, padding:'3px 9px' }}>{tag}</span>
                  ))}
                </div>
              </div>

              {/* Widget */}
              <div className="land-widget" style={{ display:'flex', justifyContent:'center', paddingBottom:40 }}>
                <HeroWidget />
              </div>
            </div>
          </div>
        </section>

        {/* ── TRUST BAR ─────────────────────────────────────────── */}
        <section style={{ padding:'0 32px 72px' }}>
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            <p data-sr style={{ textAlign:'center', fontSize:12, color:T.td, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:20 }}>Trusted by recruiting teams at</p>
            <div data-sr data-sr-delay="0.1" style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:48, flexWrap:'wrap', opacity: dark ? 0.4 : 0.55 }}>
              {['Talentify','HireLoop','Recruit360','TalentBridge','NexHire'].map(n => (
                <span key={n} style={{ fontSize:16, fontWeight:700, color:T.tm, letterSpacing:'-0.02em' }}>{n}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── STATS ─────────────────────────────────────────────── */}
        <section style={{ padding:'0 32px 80px' }}>
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            <div className="g4" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
              {[
                { n:'9×',      l:'More candidates screened per recruiter-hour' },
                { n:'27',      l:'Languages supported natively' },
                { n:'$0.50',   l:'Average AI cost per complete interview' },
                { n:'< 2 min', l:'From interview end to ranked shortlist' },
              ].map((s, i) => (
                <div key={s.l} className="land-card" data-sr data-sr-delay={String(i * 0.08)} style={{ padding:'28px 24px', textAlign:'center', background:T.card, border:`1px solid ${T.border}` }}>
                  <div style={{ fontFamily:'var(--font-display,system-ui)', fontSize:36, fontWeight:800, letterSpacing:'-0.03em', background:'linear-gradient(135deg,#39d98a,#1a7a3c)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{s.n}</div>
                  <div style={{ fontSize:12, color:T.td, marginTop:6, lineHeight:1.4 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SEE IT LIVE ───────────────────────────────────────── */}
        <section id="live" style={{ padding:'80px 0', background: dark ? `linear-gradient(180deg,${T.bg} 0%,${T.bg2} 50%,${T.bg} 100%)` : T.bg2 }}>
          <Pipeline T={T} dark={dark} />
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────────── */}
        <section id="how" style={{ padding:'100px 0' }}>
          <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 32px' }}>
            <div style={{ textAlign:'center', marginBottom:56 }} data-sr>
              <span className="land-chip" style={{ background:T.chip, border:`1px solid ${T.chipB}`, marginBottom:16, display:'inline-flex' }}>How it works</span>
              <h2 className="land-h2" style={{ color:T.t, marginTop:12 }}>
                Six steps from posting to{' '}
                <span className="brand-grad">placement.</span>
              </h2>
            </div>
            <div className="g3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
              {[
                { n:'01', t:'Agency onboarding',  d:'Sign up, upload your logo, pick a brand color. Admin approves + tops up credits. Your branded portal is live at /your-slug.' },
                { n:'02', t:'Job creation wizard', d:'Fill the form or drop a job-spec PDF — Gemini extracts every field. Add technical questions with images, and an optional handbook PDF.' },
                { n:'03', t:'Candidates apply',    d:'They land on your branded page, upload CV + LinkedIn, pick their language, and submit. No account friction.' },
                { n:'04', t:'Tailored AI prep',    d:'Gemini reads the CV. Groq writes 3–5 interview questions tailored to that exact candidate. Google CSE finds reference images.' },
                { n:'05', t:'Voice interview',     d:'ElevenLabs runs a real voice conversation — red-flag probing, live Signal Score™, technical tests, deepfake detection.' },
                { n:'06', t:'Ranked dashboard',    d:'Candidates sorted by score. Full transcripts, audio, institution verifications. One click to approve and unlock contact details.' },
              ].map((s, i) => (
                <div key={s.n} className="land-card" data-sr data-sr-delay={String(i * 0.07)} style={{ padding:'28px 24px', background:T.card, border:`1px solid ${T.border}` }}>
                  <div style={{ fontFamily:'monospace', fontSize:11, color:'#1a7a3c', letterSpacing:'0.1em', marginBottom:12 }}>{s.n}</div>
                  <div className="land-h3" style={{ color:T.t, marginBottom:8 }}>{s.t}</div>
                  <div style={{ fontSize:13, color:T.td, lineHeight:1.65 }}>{s.d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CORE FEATURES ─────────────────────────────────────── */}
        <section id="features" style={{ padding:'0 0 100px' }}>
          <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 32px' }}>
            <div style={{ textAlign:'center', marginBottom:56 }} data-sr>
              <span className="land-chip" style={{ background:T.chip, border:`1px solid ${T.chipB}`, marginBottom:16, display:'inline-flex' }}>Core Features</span>
              <h2 className="land-h2" style={{ color:T.t, marginTop:12 }}>
                Everything you need.{' '}
                <span className="brand-grad">Nothing you don't.</span>
              </h2>
            </div>
            <div className="g3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
              {CORE_FEAT.map((f, i) => (
                <div key={f.t} className="land-card" data-sr data-sr-delay={String(i * 0.07)} style={{ padding:'28px 24px', display:'flex', flexDirection:'column', gap:12, background:T.card, border:`1px solid ${T.border}` }}>
                  <div style={{ width:48, height:48, borderRadius:12, background:'rgba(26,122,60,0.10)', border:'1px solid rgba(26,122,60,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{f.icon}</div>
                  <div className="land-h3" style={{ color:T.t }}>{f.t}</div>
                  <div style={{ fontSize:13, color:T.td, lineHeight:1.65 }}>{f.d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── POWER FEATURES ────────────────────────────────────── */}
        <section style={{ padding:'0 0 100px', background: dark ? `linear-gradient(180deg,${T.bg} 0%,${T.bg2} 100%)` : T.bg2 }}>
          <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 32px' }}>
            <div style={{ textAlign:'center', marginBottom:56 }} data-sr>
              <span className="land-chip" style={{ background:T.chip, border:`1px solid ${T.chipB}`, marginBottom:16, display:'inline-flex' }}>Power Features</span>
              <h2 className="land-h2" style={{ color:T.t, marginTop:12 }}>
                Go deeper.{' '}
                <span className="brand-grad">Win faster.</span>
              </h2>
              <p style={{ color:T.tm, fontSize:15, marginTop:10, maxWidth:520, marginInline:'auto' }}>Advanced capabilities that separate top agencies from the rest.</p>
            </div>
            <div className="g2" style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:20 }}>
              {POWER_FEAT.map((f, i) => (
                <div key={f.t} className="land-card" data-sr data-sr-delay={String(i * 0.09)} style={{ padding:'32px 28px', display:'flex', gap:20, alignItems:'flex-start', background:T.card, border:`1px solid ${T.border}` }}>
                  <div style={{ width:52, height:52, borderRadius:14, background:'rgba(26,122,60,0.10)', border:'1px solid rgba(26,122,60,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>{f.icon}</div>
                  <div>
                    <div className="land-h3" style={{ color:T.t, marginBottom:8 }}>{f.t}</div>
                    <div style={{ fontSize:13, color:T.td, lineHeight:1.65 }}>{f.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SMALL WINS ────────────────────────────────────────── */}
        <section style={{ padding:'0 32px 100px' }}>
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:48 }} data-sr>
              <span className="land-chip" style={{ background:T.chip, border:`1px solid ${T.chipB}`, marginBottom:16, display:'inline-flex' }}>The small stuff matters</span>
              <h2 className="land-h2" style={{ color:T.t, marginTop:12 }}>
                Delights in every{' '}
                <span className="brand-grad">detail.</span>
              </h2>
            </div>
            <div className="g3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
              {SMALL_FEAT.map((f, i) => (
                <div key={f.t} className="sf-card" data-sr data-sr-delay={String(i * 0.07)} style={{ background:T.card, border:`1px solid ${T.border}` }}>
                  <div style={{ width:42, height:42, borderRadius:10, background:'rgba(26,122,60,0.10)', border:'1px solid rgba(26,122,60,0.22)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{f.icon}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:T.t, marginBottom:4 }}>{f.t}</div>
                    <div style={{ fontSize:12, color:T.td, lineHeight:1.5 }}>{f.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── JOB TEMPLATES ─────────────────────────────────────── */}
        <section style={{ padding:'0 32px 100px' }}>
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:48 }} data-sr>
              <span className="land-chip" style={{ background:T.chip, border:`1px solid ${T.chipB}`, marginBottom:16, display:'inline-flex' }}>Ready-made Templates</span>
              <h2 className="land-h2" style={{ color:T.t, marginTop:12 }}>
                Launch a job in{' '}
                <span className="brand-grad">90 seconds.</span>
              </h2>
              <p style={{ color:T.tm, fontSize:15, marginTop:10 }}>Pre-configured with tailored AI questions. Just fill in the details and go.</p>
            </div>
            <div className="g3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
              {TEMPLATES.map((tmpl, i) => (
                <div key={tmpl.role} className="tmpl-card" data-sr data-sr-delay={String(i * 0.09)} style={{ background:T.card, border:`1px solid ${T.border}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:15, color:T.t, marginBottom:4 }}>{tmpl.role}</div>
                      <div style={{ fontSize:12, color:T.td }}>{tmpl.level}</div>
                    </div>
                    <span style={{ background:'rgba(26,122,60,0.10)', border:'1px solid rgba(26,122,60,0.28)', borderRadius:6, padding:'3px 9px', fontSize:11, color:'#39d98a', fontWeight:600 }}>Template</span>
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:16 }}>
                    {tmpl.tags.map(tag => (
                      <span key={tag} style={{ background:T.tag, border:`1px solid ${T.tagB}`, borderRadius:6, padding:'2px 8px', fontSize:11, color:T.tagT }}>{tag}</span>
                    ))}
                  </div>
                  <div style={{ display:'flex', gap:16, fontSize:12, color:T.td, marginBottom:20 }}>
                    <span>🎙️ {tmpl.questions} AI Qs</span>
                    <span>⏱️ ~{tmpl.est}</span>
                    <span>🌍 {tmpl.lang}</span>
                  </div>
                  <Link to="/signup/agency" className="land-btn-p" style={{ width:'100%', justifyContent:'center', fontSize:13, padding:'10px 20px' }}>
                    Use this template →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ───────────────────────────────────────────── */}
        <section id="pricing" style={{ padding:'0 32px 100px' }}>
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:56 }} data-sr>
              <span className="land-chip" style={{ background:T.chip, border:`1px solid ${T.chipB}`, marginBottom:16, display:'inline-flex' }}>Pricing</span>
              <h2 className="land-h2" style={{ color:T.t, marginTop:12 }}>
                Credit-based.{' '}
                <span className="brand-grad">No surprises.</span>
              </h2>
              <p style={{ color:T.td, fontSize:15, marginTop:10 }}>Pay only for what you post and interview.</p>
            </div>
            <div className="g3" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, alignItems:'start' }}>
              {PLANS.map((p, i) => (
                <div key={p.name} className="land-card" data-sr data-sr-delay={String(i * 0.09)} style={{ padding:'32px 28px', position:'relative', background:T.card, border:`1px solid ${p.hot ? 'rgba(26,122,60,0.5)' : T.border}`, boxShadow: p.hot ? '0 0 40px rgba(26,122,60,0.15)' : 'none' }}>
                  {p.hot && (
                    <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background:'#1a7a3c', color:'#fff', fontSize:10, fontWeight:700, letterSpacing:'0.1em', padding:'3px 14px', borderRadius:9999, whiteSpace:'nowrap' }}>MOST POPULAR</div>
                  )}
                  <div style={{ fontFamily:'monospace', fontSize:11, color: p.hot ? '#39d98a' : T.td, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:12 }}>{p.name}</div>
                  <div style={{ fontFamily:'var(--font-display,system-ui)', fontWeight:800, fontSize:40, letterSpacing:'-0.04em', color:T.t }}>
                    {p.price}<span style={{ fontSize:16, fontWeight:500, color:T.td }}>{p.period}</span>
                  </div>
                  <div style={{ fontSize:12, color:T.td, marginTop:4, marginBottom:20 }}>{p.sub}</div>
                  <hr style={{ border:'none', borderTop:`1px solid ${T.border}`, marginBottom:20 }} />
                  <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
                    {p.feat.map(f => (
                      <div key={f} style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                        <span style={{ color:'#1a7a3c', fontSize:14, marginTop:1 }}>✓</span>
                        <span style={{ fontSize:13, color:T.tm, lineHeight:1.4 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  {p.name === 'Enterprise'
                    ? <a href="mailto:sales@recruitation.io" className="land-btn-g" style={{ display:'flex', justifyContent:'center', border:`1px solid ${T.ghost}`, color:T.ghostT }}>Talk to sales</a>
                    : <Link to="/signup/agency" className="land-btn-p" style={{ display:'flex', justifyContent:'center', ...(p.hot ? {} : { background:'rgba(26,122,60,0.12)', color:'#39d98a', boxShadow:'none' }) }}>Start free</Link>
                  }
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <section style={{ padding:'0 32px 100px' }}>
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            <div data-sr style={{
              background: dark
                ? 'linear-gradient(135deg,rgba(26,122,60,0.16) 0%,rgba(57,217,138,0.06) 100%)'
                : 'linear-gradient(135deg,rgba(26,122,60,0.07) 0%,rgba(57,217,138,0.03) 100%)',
              border:`1px solid ${T.chipB}`,
              borderRadius:24, padding:'72px 48px', textAlign:'center', position:'relative', overflow:'hidden',
            }}>
              <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 50%,rgba(26,122,60,0.10) 0%,transparent 60%)', pointerEvents:'none' }} />
              <h2 className="land-h2" style={{ color:T.t, fontSize:'clamp(1.8rem,3.5vw,3rem)', position:'relative' }}>
                Ready to screen 500 candidates<br />
                <span className="brand-grad">by lunch?</span>
              </h2>
              <p style={{ color:T.tm, fontSize:16, marginTop:14, maxWidth:480, marginInline:'auto', position:'relative' }}>
                Start free. Twenty credits. Four jobs. No credit card required.
              </p>
              <div style={{ display:'flex', justifyContent:'center', gap:12, marginTop:28, position:'relative' }}>
                <Link to="/signup/agency" className="land-btn-p" style={{ fontSize:16, padding:'14px 32px' }}>
                  Create agency account →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ────────────────────────────────────────────── */}
        <footer style={{ borderTop:`1px solid ${T.ft}`, padding:'32px', textAlign:'center' }}>
          <div style={{ fontSize:12, color:T.ftT }}>
            © 2025 Recruitation.io ·{' '}
            <a href="mailto:hello@recruitation.io" style={{ color:T.td, textDecoration:'none' }}>hello@recruitation.io</a>
          </div>
        </footer>

      </div>
    </>
  );
}
