// ============================================================
// Recruitation.AI — Landing v5
// ============================================================
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

/* ─── Theme ─────────────────────────────────────────────────── */
const D = {
  bg:'#05080f', bg2:'#0a1020',
  card:'rgba(255,255,255,0.032)', cardH:'rgba(255,255,255,0.06)',
  border:'rgba(255,255,255,0.08)', borderAcc:'rgba(26,122,60,0.55)',
  t:'#f1f5f9', tm:'#94a3b8', td:'#64748b',
  nav:'rgba(5,8,15,0.85)',
  chip:'rgba(26,122,60,0.12)', chipB:'rgba(26,122,60,0.35)',
  tag:'rgba(255,255,255,0.05)', tagB:'rgba(255,255,255,0.08)', tagT:'#475569',
  ghost:'rgba(255,255,255,0.10)', ghostT:'#94a3b8',
  ft:'rgba(255,255,255,0.06)', ftT:'#334155',
};
const L = {
  bg:'#f8fafc', bg2:'#f1f5f9',
  card:'rgba(255,255,255,0.9)', cardH:'#fff',
  border:'rgba(0,0,0,0.08)', borderAcc:'rgba(26,122,60,0.45)',
  t:'#0f172a', tm:'#475569', td:'#94a3b8',
  nav:'rgba(248,250,252,0.93)',
  chip:'rgba(26,122,60,0.07)', chipB:'rgba(26,122,60,0.25)',
  tag:'rgba(0,0,0,0.04)', tagB:'rgba(0,0,0,0.06)', tagT:'#64748b',
  ghost:'rgba(0,0,0,0.09)', ghostT:'#475569',
  ft:'rgba(0,0,0,0.06)', ftT:'#94a3b8',
};
type TH = typeof D;

/* ─── Data ──────────────────────────────────────────────────── */
const HEIGHTS = [18,28,14,36,22,32,16,26,38,20,30,12,34,24,40,18,28,22,36,16];

const TRANSCRIPT = [
  { role:'agent' as const, text:"Walk me through your biggest distributed systems challenge and what you did about it." },
  { role:'cand'  as const, text:"At my last role I led a full monolith-to-microservices migration — auth, rate-limiting, distributed tracing, the works." },
  { role:'agent' as const, text:"Be specific: how did you handle race conditions during the cutover?" },
  { role:'cand'  as const, text:"Redis distributed locks with TTL, circuit breakers for graceful degradation. Zero downtime on a 40M-user system." },
  { role:'agent' as const, text:"I noticed a 6-month gap on your LinkedIn. What were you working on?" },
];
const SCORES = [
  { l:'Technical Depth', v:94 },
  { l:'Communication',   v:88 },
  { l:'Confidence',      v:91 },
  { l:'Role Fit',        v:96 },
];


const PIPE_STEPS = [
  { icon:'📄', t:'CV Parsed',        detail:'Sarah Chen · Stanford MS · 6y ML at Google' },
  { icon:'🧠', t:'AI Analysis',      detail:'4 tailored questions · 2 red flags flagged' },
  { icon:'🎙️', t:'Voice Interview',  detail:'14 min · 47 exchanges · deepfake: clean' },
  { icon:'🔍', t:'Verified',         detail:'Stanford ✓ · Google ✓ · Patent claim ✓' },
  { icon:'📊', t:'Shortlisted',      detail:'Signal Score 94 · Recommendation: HIRE' },
];

const SPOTLIGHT_FEAT = [
  {
    icon:'🧠', t:'Tailored Questions Per CV',
    d:'Gemini reads the actual CV. AI writes 3–5 questions specific to that exact candidate — their gaps, their career jumps, their claimed skills. No generic scripts, ever.',
    stat:'2.3 sec', statL:'per CV tailored',
    detail:['Probes specific role transitions', 'Flags unverified claims automatically', 'Questions adapt mid-interview'],
  },
  {
    icon:'🎙️', t:'Real Voice Conversations',
    d:"ElevenLabs AI runs the full interview with a natural, unhurried voice. It probes red flags, digs into technical depth, asks follow-up questions — and candidates can't tell it's AI.",
    stat:'14 min', statL:'avg interview length',
    detail:['Natural follow-up questions', 'Red-flag probing built in', 'Deepfake detection live'],
  },
];

const CORE_FEAT = [
  { icon:'🏛️', t:'Institution Verification',    d:'Every university and employer is verified server-side after the call. No bluffing through.' },
  { icon:'🕵️', t:'Anti-Deepfake Detection',     d:'Synthetic voice markers analysed in real time. Caught deepfakes flagged red before they reach your desk.' },
  { icon:'📊', t:'Ranked Shortlist Dashboard',   d:'Every candidate ranked by Signal Score™. Full audio, transcript, and AI commentary.' },
  { icon:'🌍', t:'27 Languages Natively',        d:"Interview in the candidate's own language. Your team gets English transcripts. Zero translation fees." },
  { icon:'🏷️', t:'White-Label Branded Portals', d:'Your logo, brand colour, your domain. Candidates apply to your portal — not a generic third-party page.' },
  { icon:'⚔️', t:'Side-by-Side Comparison',     d:'Pick any 2–3 candidates and get an AI head-to-head matrix. Settle shortlist debates in 30 seconds.' },
  { icon:'💰', t:'Salary Intelligence',          d:"AI estimates fair market comp from verified experience. Never lose a candidate to a salary mismatch again." },
  { icon:'🔁', t:'Full Interview Replay',        d:'AI chapter markers jump to technical questions, red-flag moments, or culture fit signals instantly.' },
  { icon:'🎯', t:'Custom Scoring Rubrics',       d:"Define what 'excellent' means for your role. AI scores every answer against your rubric. Fully auditable." },
  { icon:'📈', t:'Pipeline & Skills Analytics',  d:'Skills heatmap, funnel drop-off, time-to-hire trends. Identify bottlenecks before they cost you a placement.' },
];

const PLANS = [
  { name:'Starter',    price:'Free',  period:'',    sub:'20 credits on approval',        hot:false, feat:['4 job postings','White-label portal','Tailored AI questions','Ranked dashboard','Full audio + transcripts'] },
  { name:'Growth',     price:'$495',  period:'/mo', sub:'300 credits · ~140 interviews', hot:true,  feat:['Everything in Starter','Deepfake detection','Institution verification','Signal Score™','Side-by-side comparison','Slack & ATS export'] },
  { name:'Enterprise', price:'Custom',period:'',    sub:'Volume + SSO + on-prem',        hot:false, feat:['Dedicated success team','Custom calibration model','On-prem data residency','SLA + priority support','API access'] },
];

const TEMPLATES = [
  { role:'Senior Software Engineer', level:'L5/L6',     questions:5, est:'12 min', lang:'English', tags:['System design','Distributed systems','Leadership'] },
  { role:'Product Manager',          level:'Senior',     questions:4, est:'10 min', lang:'English', tags:['Strategy','Prioritization','Metrics'] },
  { role:'Data Scientist',           level:'Mid–Senior', questions:5, est:'14 min', lang:'Multi',   tags:['ML/AI','Statistics','Python'] },
];

const TYPEWORDS = ['automated.', 'faster.', 'smarter.', 'cheaper.'];


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
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement;
          el.style.transitionDelay = (el.getAttribute('data-sr-delay') ?? '0') + 's';
          el.classList.add('sr-vis');
          io.unobserve(el);
        }
      });
    }, { threshold: 0.10 });
    document.querySelectorAll('[data-sr]').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useCounter(target: number, duration = 1800) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setVal(Math.round(ease * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [target, duration]);
  return { val, ref };
}

/* ─── WaveBar ────────────────────────────────────────────────── */
function WaveBar({ i, act }: { i: number; act: boolean }) {
  const h = HEIGHTS[i % HEIGHTS.length];
  const col = i % 3 === 0 ? '#39d98a' : i % 3 === 1 ? '#1a7a3c' : 'rgba(57,217,138,0.35)';
  return <div style={{ width:3, borderRadius:3, background:col, height:act?h:3, transition:`height ${0.3+(i%5)*0.08}s ease ${(i*0.04)%0.4}s`, flexShrink:0 }} />;
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
    const tick = setInterval(() => setElapsed(t => t+1), 1000);
    const addMsg = () => {
      if (idx.current >= TRANSCRIPT.length) { idx.current=0; setMsgs([]); return; }
      const m = TRANSCRIPT[idx.current++];
      setWave(true); setTimeout(()=>setWave(false), 1200);
      setMsgs(p=>[...p,m]);
    };
    const mt = setInterval(addMsg, 2800);
    addMsg();
    setTimeout(()=>setScores(SCORES.map(s=>s.v)), 4000);
    return ()=>{clearInterval(tick); clearInterval(mt);};
  }, []);
  useEffect(()=>{if(scrollRef.current) scrollRef.current.scrollTop=scrollRef.current.scrollHeight;},[msgs]);
  const mm = Math.floor(elapsed/60).toString().padStart(2,'0');
  const ss = (elapsed%60).toString().padStart(2,'0');
  return (
    <div style={{position:'relative',width:'100%',maxWidth:460}}>
      <div style={{position:'absolute',inset:-60,borderRadius:'50%',background:'radial-gradient(ellipse at center,rgba(26,122,60,0.30) 0%,transparent 70%)',filter:'blur(32px)',pointerEvents:'none'}}/>
      <div style={{position:'relative',background:'rgba(8,14,26,0.92)',border:'1px solid rgba(26,122,60,0.40)',borderRadius:22,backdropFilter:'blur(24px)',boxShadow:'0 16px 48px rgba(0,0,0,0.6),inset 0 0 0 1px rgba(255,255,255,0.04)',overflow:'hidden'}}>
        <div style={{height:2,background:'linear-gradient(90deg,transparent,#1a7a3c,#39d98a,#1a7a3c,transparent)'}}/>
        <div style={{padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:38,height:38,borderRadius:11,background:'rgba(26,122,60,0.15)',border:'1px solid rgba(26,122,60,0.35)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>🎙️</div>
            <div>
              <div style={{fontWeight:700,fontSize:13,color:'#f1f5f9'}}>Live Interview</div>
              <div style={{display:'flex',alignItems:'center',gap:5,marginTop:2}}>
                <div style={{width:7,height:7,borderRadius:'50%',background:'#22c55e',boxShadow:'0 0 10px rgba(34,197,94,0.9)',animation:'pulseDot 1.5s ease-in-out infinite'}}/>
                <span style={{fontFamily:'monospace',fontSize:10,color:'#22c55e',letterSpacing:'0.05em'}}>ACTIVE</span>
              </div>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:6,background:'rgba(26,122,60,0.12)',border:'1px solid rgba(26,122,60,0.28)',borderRadius:20,padding:'5px 12px'}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:'#ef4444',animation:'pulseDot 1s ease-in-out infinite'}}/>
            <span style={{fontFamily:'monospace',fontSize:10,color:'#39d98a',fontWeight:600}}>REC {mm}:{ss}</span>
          </div>
        </div>
        <div style={{padding:'14px 20px',display:'flex',alignItems:'center',gap:3,height:56,borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
          {Array.from({length:20}).map((_,i)=><WaveBar key={i} i={i} act={wave}/>)}
        </div>
        <div ref={scrollRef} style={{padding:'12px 16px',height:190,overflowY:'auto',display:'flex',flexDirection:'column',gap:10,scrollbarWidth:'none'}}>
          {msgs.length===0&&<div style={{margin:'auto',color:'#475569',fontSize:12}}>Connecting…</div>}
          {msgs.map((m,i)=>(
            <div key={i} style={{display:'flex',flexDirection:'column',alignItems:m.role==='agent'?'flex-start':'flex-end',animation:'fadeUp 0.35s ease forwards'}}>
              <span style={{fontSize:9,color:'#475569',marginBottom:3,paddingInline:4}}>{m.role==='agent'?'Recruitation AI':'Candidate · Sarah K.'}</span>
              <div style={{maxWidth:'88%',padding:'8px 12px',borderRadius:m.role==='agent'?'4px 14px 14px 14px':'14px 4px 14px 14px',background:m.role==='agent'?'rgba(26,122,60,0.16)':'rgba(30,40,60,0.85)',border:`1px solid ${m.role==='agent'?'rgba(26,122,60,0.28)':'rgba(255,255,255,0.07)'}`,fontSize:12,color:m.role==='agent'?'#86efac':'#cbd5e1',lineHeight:1.55}}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div style={{padding:'14px 20px',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
          <div style={{fontFamily:'monospace',fontSize:9,color:'#475569',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:10}}>Signal Score™ — Live</div>
          {SCORES.map((s,i)=>(
            <div key={s.l} style={{display:'flex',alignItems:'center',gap:10,marginBottom:7}}>
              <span style={{fontSize:10,color:'#64748b',width:114,flexShrink:0}}>{s.l}</span>
              <div style={{flex:1,height:4,background:'rgba(255,255,255,0.06)',borderRadius:2,overflow:'hidden'}}>
                <div style={{height:'100%',borderRadius:2,background:'linear-gradient(90deg,#1a7a3c,#39d98a)',width:`${scores[i]}%`,transition:`width 1.3s cubic-bezier(0.22,0.61,0.36,1) ${i*0.15}s`,boxShadow:'0 0 8px rgba(57,217,138,0.5)'}}/>
              </div>
              <span style={{fontFamily:'monospace',fontSize:10,color:'#39d98a',width:28,textAlign:'right',fontWeight:700}}>{scores[i]}</span>
            </div>
          ))}
        </div>
        <div style={{position:'absolute',bottom:-22,right:-14,background:'rgba(8,14,26,0.95)',border:'1px solid rgba(26,122,60,0.25)',borderRadius:14,backdropFilter:'blur(16px)',padding:'9px 16px',display:'flex',alignItems:'center',gap:8}}>
          <span style={{width:8,height:8,borderRadius:'50%',background:'#22c55e',boxShadow:'0 0 10px rgba(34,197,94,0.9)',display:'inline-block',animation:'pulseDot 1.5s ease-in-out infinite'}}/>
          <span style={{fontSize:11,color:'#94a3b8'}}>Shortlist ready in ~90 sec</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Cycling typewriter word ────────────────────────────────── */
function TypeWord() {
  const [wordIdx, setWordIdx] = useState(0);
  const [shown, setShown] = useState('');
  const [phase, setPhase] = useState<'typing'|'waiting'|'deleting'>('typing');

  useEffect(() => {
    const word = TYPEWORDS[wordIdx];
    let timer: ReturnType<typeof setTimeout>;
    if (phase === 'typing') {
      if (shown.length < word.length) {
        timer = setTimeout(() => setShown(word.slice(0, shown.length+1)), 65);
      } else {
        timer = setTimeout(() => setPhase('waiting'), 1800);
      }
    } else if (phase === 'waiting') {
      timer = setTimeout(() => setPhase('deleting'), 400);
    } else {
      if (shown.length > 0) {
        timer = setTimeout(() => setShown(w => w.slice(0,-1)), 35);
      } else {
        setWordIdx(i => (i+1) % TYPEWORDS.length);
        setPhase('typing');
      }
    }
    return () => clearTimeout(timer);
  }, [shown, phase, wordIdx]);

  return (
    <span className="brand-grad">
      {shown}
      <span style={{borderRight:'3px solid #39d98a',marginLeft:2,animation:'blink 0.75s step-end infinite'}}/>
    </span>
  );
}

/* ─── Live activity feed ─────────────────────────────────────── */
type FeedItem = { name: string; role: string; live: boolean; t?: string; rec?: 'HIRE' | 'PASS' };
const LIVE_FEED_SEED: FeedItem[] = [
  { name: 'Aisha K.',  role: 'Senior Software Engineer', live: true,  t: '04:21' },
  { name: 'Daniel M.', role: 'Frontend Engineer',         live: false, rec: 'HIRE' },
  { name: 'Priya S.',  role: 'Data Analyst',              live: false, rec: 'HIRE' },
  { name: 'Omar R.',   role: 'DevOps Engineer',           live: true,  t: '02:08' },
  { name: 'Lina T.',   role: 'Product Designer',          live: false, rec: 'PASS' },
  { name: 'Yusuf A.',  role: 'Backend Engineer',          live: false, rec: 'HIRE' },
  { name: 'Maya B.',   role: 'QA Lead',                   live: true,  t: '06:42' },
  { name: 'Hasan I.',  role: 'iOS Engineer',              live: false, rec: 'HIRE' },
];
const NEW_INTERVIEWS: FeedItem[] = [
  { name: 'Sara N.',   role: 'Mobile Developer',          live: true,  t: '00:12' },
  { name: 'Karan P.',  role: 'Full-Stack Engineer',       live: false, rec: 'HIRE' },
  { name: 'Fatima Z.', role: 'ML Engineer',               live: true,  t: '00:45' },
  { name: 'Noah G.',   role: 'Site Reliability Engineer', live: false, rec: 'PASS' },
  { name: 'Imran K.',  role: 'Security Engineer',         live: false, rec: 'HIRE' },
  { name: 'Tanya V.',  role: 'Technical Writer',          live: true,  t: '01:33' },
];

function LiveFeed({ T }: { T: TH }) {
  const [feed, setFeed] = useState<FeedItem[]>(LIVE_FEED_SEED);
  const newIdx = useRef(0);
  useEffect(() => {
    const iv = setInterval(() => {
      const next = NEW_INTERVIEWS[newIdx.current % NEW_INTERVIEWS.length];
      newIdx.current++;
      setFeed((f: FeedItem[]) => [next, ...f.slice(0, 7)]);
    }, 3200);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{borderTop:`1px solid ${T.ft}`,borderBottom:`1px solid ${T.ft}`,padding:'14px 0',overflow:'hidden',position:'relative'}}>
      <div style={{position:'absolute',left:0,top:0,bottom:0,width:80,background:`linear-gradient(90deg,${T.bg},transparent)`,zIndex:2,pointerEvents:'none'}}/>
      <div style={{position:'absolute',right:0,top:0,bottom:0,width:80,background:`linear-gradient(270deg,${T.bg},transparent)`,zIndex:2,pointerEvents:'none'}}/>
      <div style={{padding:'0 32px',display:'flex',gap:10,overflowX:'hidden',flexWrap:'nowrap'}}>
        {feed.map((item: FeedItem, i: number) => (
          <div key={`${item.name}-${i}`} style={{
            display:'inline-flex',alignItems:'center',gap:10,flexShrink:0,
            background: item.live ? 'rgba(26,122,60,0.10)' : T.card,
            border:`1px solid ${item.live ? 'rgba(26,122,60,0.4)' : T.border}`,
            borderRadius:10,padding:'8px 14px',
            animation: i === 0 ? 'feedSlide 0.4s ease' : 'none',
          }}>
            {item.live ? (
              <span style={{width:8,height:8,borderRadius:'50%',background:'#22c55e',boxShadow:'0 0 8px rgba(34,197,94,0.9)',animation:'pulseDot 1s ease-in-out infinite',flexShrink:0}}/>
            ) : (
              <span style={{color:'#39d98a',fontSize:12,fontWeight:700}}>✓</span>
            )}
            <div>
              <div style={{fontSize:12,fontWeight:600,color:T.t,whiteSpace:'nowrap'}}>{item.name}</div>
              <div style={{fontSize:10,color:T.td}}>{item.role}</div>
            </div>
            {item.live ? (
              <span style={{fontFamily:'monospace',fontSize:11,color:'#39d98a',fontWeight:700,letterSpacing:'0.05em'}}>{item.t}</span>
            ) : (
              <span style={{background: item.rec==='HIRE'?'rgba(26,122,60,0.15)':'rgba(234,179,8,0.12)',border:`1px solid ${item.rec==='HIRE'?'rgba(26,122,60,0.3)':'rgba(234,179,8,0.3)'}`,borderRadius:6,padding:'2px 8px',fontSize:10,fontWeight:700,color:item.rec==='HIRE'?'#39d98a':'#ca8a04'}}>{item.rec}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── The Math section ───────────────────────────────────────── */
function TheMath({ T, dark }: { T: TH; dark: boolean }) {
  const OLD = [
    { icon:'📋', l:'Review 20 CVs manually',   t:'2.5 hrs' },
    { icon:'📅', l:'Schedule 20 phone screens', t:'1.5 hrs' },
    { icon:'📞', l:'Run 20 phone screens',      t:'10 hrs' },
    { icon:'📝', l:'Write up notes & rank',     t:'2 hrs' },
  ];
  const NEW = [
    { icon:'📤', l:'Upload 20 CVs to Recruitation', t:'4 min' },
    { icon:'🧠', l:'AI tailors questions per CV',   t:'instant' },
    { icon:'🎙️', l:'AI runs 20 voice interviews',   t:'~40 min' },
    { icon:'📊', l:'Ranked shortlist delivered',    t:'automatic' },
  ];
  return (
    <section style={{padding:'100px 32px',background:dark?`linear-gradient(180deg,${T.bg} 0%,${T.bg2} 50%,${T.bg} 100%)`:T.bg2}}>
      <div style={{maxWidth:1100,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:64}} data-sr>
          <span className="land-chip" style={{background:T.chip,border:`1px solid ${T.chipB}`,marginBottom:16,display:'inline-flex'}}>The Math</span>
          <h2 className="land-h2" style={{color:T.t,marginTop:12}}>
            The old way costs you{' '}
            <span style={{color:'#ef4444',WebkitTextFillColor:'#ef4444'}}>16 hours.</span><br/>
            Recruitation costs you{' '}
            <span className="brand-grad">44 minutes.</span>
          </h2>
          <p style={{color:T.tm,fontSize:16,marginTop:14,maxWidth:540,marginInline:'auto'}}>Same 20 candidates. Same quality bar. Radically different time and cost.</p>
        </div>
        <div className="math-g" style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:0,alignItems:'stretch'}}>
          <div data-sr data-sr-delay="0.05" style={{background: dark?'rgba(239,68,68,0.04)':'rgba(239,68,68,0.03)',border:`1px solid rgba(239,68,68,0.15)`,borderRadius:'20px 0 0 20px',padding:'32px 28px'}}>
            <div style={{fontWeight:700,fontSize:12,color:'#ef4444',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:24}}>🐢 The Old Way</div>
            {OLD.map(r=>(
              <div key={r.l} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,gap:16}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:16}}>{r.icon}</span>
                  <span style={{fontSize:14,color:T.tm}}>{r.l}</span>
                </div>
                <span style={{fontFamily:'monospace',fontSize:13,color:'#ef4444',fontWeight:700,flexShrink:0}}>{r.t}</span>
              </div>
            ))}
            <div style={{borderTop:`1px solid rgba(239,68,68,0.15)`,marginTop:20,paddingTop:20}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontWeight:700,color:T.t}}>Total time</span>
                <span style={{fontFamily:'monospace',fontSize:20,fontWeight:800,color:'#ef4444'}}>~16 hrs</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
                <span style={{fontWeight:700,color:T.t}}>Cost (at $50/hr)</span>
                <span style={{fontFamily:'monospace',fontSize:20,fontWeight:800,color:'#ef4444'}}>~$800</span>
              </div>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',width:64,background:dark?T.bg2:T.bg,zIndex:1}}>
            <span style={{fontWeight:900,fontSize:18,color:T.td,background:T.card,border:`1px solid ${T.border}`,borderRadius:'50%',width:44,height:44,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>VS</span>
          </div>
          <div data-sr data-sr-delay="0.1" style={{background:'rgba(26,122,60,0.06)',border:`1px solid rgba(26,122,60,0.25)`,borderRadius:'0 20px 20px 0',padding:'32px 28px',boxShadow:'0 0 48px rgba(26,122,60,0.08)'}}>
            <div style={{fontWeight:700,fontSize:12,color:'#39d98a',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:24}}>⚡ Recruitation</div>
            {NEW.map(r=>(
              <div key={r.l} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,gap:16}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:16}}>{r.icon}</span>
                  <span style={{fontSize:14,color:T.tm}}>{r.l}</span>
                </div>
                <span style={{fontFamily:'monospace',fontSize:13,color:'#39d98a',fontWeight:700,flexShrink:0}}>{r.t}</span>
              </div>
            ))}
            <div style={{borderTop:`1px solid rgba(26,122,60,0.2)`,marginTop:20,paddingTop:20}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontWeight:700,color:T.t}}>Total time</span>
                <span style={{fontFamily:'monospace',fontSize:20,fontWeight:800,color:'#39d98a'}}>~44 min</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
                <span style={{fontWeight:700,color:T.t}}>Cost (20 × $0.50)</span>
                <span style={{fontFamily:'monospace',fontSize:20,fontWeight:800,color:'#39d98a'}}>$10.00</span>
              </div>
            </div>
          </div>
        </div>
        <div data-sr data-sr-delay="0.15" style={{textAlign:'center',marginTop:40}}>
          <span style={{display:'inline-flex',alignItems:'center',gap:12,background:'rgba(26,122,60,0.08)',border:`1px solid rgba(26,122,60,0.25)`,borderRadius:9999,padding:'12px 28px',fontSize:15,fontWeight:700,color:T.t}}>
            <span className="brand-grad" style={{fontSize:22}}>95% faster</span>
            <span style={{color:T.td}}>·</span>
            <span className="brand-grad" style={{fontSize:22}}>98.75% cheaper</span>
            <span style={{color:T.td}}>·</span>
            <span style={{color:T.tm}}>zero scheduling</span>
          </span>
        </div>
      </div>
    </section>
  );
}

/* ─── Pipeline ───────────────────────────────────────────────── */
function Pipeline({ T, dark }: { T: TH; dark: boolean }) {
  const [active, setActive] = useState(0);
  const [done, setDone] = useState<number[]>([]);
  useEffect(() => {
    const iv = setInterval(() => {
      setActive(a => {
        const next = (a+1) % PIPE_STEPS.length;
        if (next===0) setDone([]); else setDone(d=>[...d,a]);
        return next;
      });
    }, 2600);
    return ()=>clearInterval(iv);
  },[]);
  return (
    <section id="live" style={{padding:'100px 32px',background:T.bg}}>
      <div style={{maxWidth:1280,margin:'0 auto'}}>
        <div style={{textAlign:'center',marginBottom:52}} data-sr>
          <span className="land-chip" style={{background:T.chip,border:`1px solid ${T.chipB}`,marginBottom:16,display:'inline-flex'}}>Watch it run</span>
          <h2 className="land-h2" style={{color:T.t,marginTop:12}}>
            CV to ranked report in{' '}
            <span className="brand-grad">under 2 minutes.</span>
          </h2>
        </div>
        <div data-sr data-sr-delay="0.1" style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:0,position:'relative'}}>
          {PIPE_STEPS.map((s,i)=>{
            const isA = i===active, isDone = done.includes(i);
            return (
              <div key={i} style={{position:'relative'}}>
                {i<PIPE_STEPS.length-1&&(
                  <div style={{position:'absolute',top:32,left:'50%',right:'-50%',height:2,background:T.border,zIndex:0}}>
                    <div style={{height:'100%',background:'linear-gradient(90deg,#1a7a3c,#39d98a)',width:isDone?'100%':isA?'55%':'0%',transition:'width 0.8s ease'}}/>
                  </div>
                )}
                <div style={{margin:'0 6px',padding:'20px 14px',borderRadius:16,border:`1px solid ${isA?'rgba(26,122,60,0.6)':isDone?'rgba(26,122,60,0.2)':T.border}`,background:isA?(dark?'rgba(26,122,60,0.10)':'rgba(26,122,60,0.05)'):T.card,transition:'all 0.4s ease',boxShadow:isA?'0 0 32px rgba(26,122,60,0.2)':'none',transform:isA?'translateY(-6px)':'none',position:'relative',zIndex:1}}>
                  <div style={{fontSize:26,marginBottom:12,filter:!isA&&!isDone?'grayscale(0.7)':'none',transition:'filter 0.4s'}}>{s.icon}</div>
                  <div style={{fontSize:12,fontWeight:700,color:isA?'#39d98a':T.t,marginBottom:6,transition:'color 0.4s'}}>{s.t}</div>
                  <div style={{fontSize:11,color:T.td,lineHeight:1.5,minHeight:32,opacity:isA?1:0.4,transition:'opacity 0.4s'}}>{s.detail}</div>
                  {isDone&&<div style={{position:'absolute',top:10,right:10,width:20,height:20,borderRadius:'50%',background:'rgba(26,122,60,0.2)',border:'1px solid rgba(26,122,60,0.5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'#39d98a',fontWeight:700}}>✓</div>}
                </div>
              </div>
            );
          })}
        </div>
        <div data-sr data-sr-delay="0.15" style={{display:'flex',justifyContent:'center',gap:8,marginTop:28}}>
          {PIPE_STEPS.map((_,i)=>(
            <div key={i} style={{width:i===active?28:8,height:8,borderRadius:4,background:i===active?'#39d98a':done.includes(i)?'rgba(26,122,60,0.4)':T.border,transition:'all 0.4s ease'}}/>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Stat counter card ──────────────────────────────────────── */
function StatCard({ n, suffix='', label, T }: { n:number; suffix?:string; label:string; T:TH }) {
  const { val, ref } = useCounter(n);
  return (
    <div ref={ref} style={{
      padding:'32px 24px',textAlign:'center',
      background:T.card,border:`1px solid ${T.border}`,
      borderRadius:20, position:'relative', overflow:'hidden',
      transition:'border-color 0.28s,box-shadow 0.28s,transform 0.22s',
    }}
    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(-4px)';(e.currentTarget as HTMLElement).style.borderColor='rgba(26,122,60,0.50)';(e.currentTarget as HTMLElement).style.boxShadow='0 0 40px rgba(26,122,60,0.16)';}}
    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='';(e.currentTarget as HTMLElement).style.borderColor=T.border;(e.currentTarget as HTMLElement).style.boxShadow='';}}
    >
      <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 0%,rgba(26,122,60,0.08) 0%,transparent 70%)',pointerEvents:'none'}}/>
      <div style={{fontFamily:'var(--font-display,system-ui)',fontSize:52,fontWeight:900,letterSpacing:'-0.04em',background:'linear-gradient(135deg,#39d98a,#1a7a3c)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',lineHeight:1}}>{val}{suffix}</div>
      <div style={{fontSize:13,color:T.td,marginTop:10,lineHeight:1.5}}>{label}</div>
    </div>
  );
}

/* ─── Orbs ───────────────────────────────────────────────────── */
function Orbs({ dark }: { dark:boolean }) {
  return (
    <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none',zIndex:0}}>
      {([
        {w:800,h:800,top:'-20%',left:'-15%', d:'0s', dur:'9s',  a: dark?.22:.08},
        {w:500,h:500,top:'30%', right:'-8%', d:'2s', dur:'11s', a: dark?.10:.04},
        {w:350,h:350,bottom:'5%',left:'15%', d:'4s', dur:'8s',  a: dark?.14:.05},
        {w:220,h:220,top:'60%', right:'20%', d:'1s', dur:'12s', a: dark?.08:.03},
      ] as {w:number;h:number;top?:string;bottom?:string;left?:string;right?:string;d:string;dur:string;a:number}[]).map((o,i)=>(
        <div key={i} style={{
          position:'absolute',width:o.w,height:o.h,
          top:o.top,bottom:o.bottom,left:o.left,right:o.right,
          borderRadius:'50%',
          background:`radial-gradient(ellipse at center,rgba(26,122,60,${o.a}) 0%,transparent 70%)`,
          filter:'blur(48px)',
          animation:`orbFloat ${o.dur} ease-in-out ${o.d} infinite alternate`,
        }}/>
      ))}
    </div>
  );
}


/* ─── Main ───────────────────────────────────────────────────── */
export default function Landing() {
  const dark = useDark();
  const T = dark ? D : L;
  useReveal();

  useEffect(()=>{
    document.body.style.background=T.bg;
    document.body.style.color=T.t;
    return()=>{document.body.style.background='';document.body.style.color='';};
  },[dark,T.bg,T.t]);

  return (
    <>
      <style>{`
        @keyframes pulseDot  {0%,100%{opacity:1;}50%{opacity:0.4;}}
        @keyframes fadeUp    {from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
        @keyframes blink     {50%{opacity:0;}}
        @keyframes orbFloat  {from{transform:translateY(0) scale(1);}to{transform:translateY(-50px) scale(1.06);}}
        @keyframes feedSlide {from{opacity:0;transform:translateX(-20px);}to{opacity:1;transform:none;}}
        @keyframes marquee   {from{transform:translateX(0);}to{transform:translateX(-50%);}  }
        @keyframes shimmer   {0%{background-position:0% 50%;}100%{background-position:200% 50%;}}
        @keyframes heroFloat {0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

        .brand-grad{background:linear-gradient(135deg,#39d98a,#1a7a3c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}

        .land-h2{font-family:var(--font-display,system-ui);font-weight:800;font-size:clamp(2rem,3.8vw,3rem);letter-spacing:-0.03em;line-height:1.12;}
        .land-h3{font-family:var(--font-display,system-ui);font-weight:700;font-size:1rem;line-height:1.3;}

        [data-sr]{opacity:0;transform:translateY(30px);transition:opacity 0.7s ease,transform 0.7s ease;}
        [data-sr].sr-vis{opacity:1;transform:none;}

        .land-chip{display:inline-flex;align-items:center;gap:7px;border-radius:9999px;padding:5px 16px;font-size:11px;font-weight:700;letter-spacing:0.07em;text-transform:uppercase;color:#39d98a;}

        .dot-grid{background-image:radial-gradient(circle,rgba(26,122,60,0.18) 1px,transparent 1px);background-size:28px 28px;}

        .land-card{border-radius:20px;transition:border-color 0.28s,box-shadow 0.28s,transform 0.22s;}
        .land-card:hover{border-color:rgba(26,122,60,0.50)!important;box-shadow:0 0 36px rgba(26,122,60,0.16)!important;transform:translateY(-4px);}

        .land-btn-p{display:inline-flex;align-items:center;gap:8px;background:#1a7a3c;color:#fff;border:none;border-radius:9999px;padding:14px 28px;font-size:15px;font-weight:700;cursor:pointer;text-decoration:none;transition:background 0.2s,box-shadow 0.2s,transform 0.15s;box-shadow:0 0 24px rgba(26,122,60,0.45);}
        .land-btn-p:hover{background:#156430;transform:translateY(-2px);box-shadow:0 0 40px rgba(26,122,60,0.65);}
        .land-btn-p.lg{padding:16px 36px;font-size:17px;}

        .land-btn-g{display:inline-flex;align-items:center;gap:6px;background:transparent;border-radius:9999px;padding:13px 24px;font-size:15px;font-weight:500;cursor:pointer;text-decoration:none;transition:border-color 0.2s,color 0.2s;}
        .land-btn-g:hover{color:#39d98a!important;border-color:rgba(26,122,60,0.55)!important;}

        .land-nl{font-size:12px;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;transition:color 0.2s;}
        .land-nl:hover{color:#39d98a!important;}

        .feat-card{border-radius:18px;padding:28px 24px;display:flex;flex-direction:column;gap:12px;transition:border-color 0.28s,box-shadow 0.28s,transform 0.22s;}
        .feat-card:hover{border-color:rgba(26,122,60,0.50)!important;box-shadow:0 0 36px rgba(26,122,60,0.14)!important;transform:translateY(-4px);}

        .tmpl-card{border-radius:18px;padding:26px;transition:border-color 0.25s,box-shadow 0.25s,transform 0.25s;}
        .tmpl-card:hover{border-color:rgba(26,122,60,0.55)!important;box-shadow:0 8px 40px rgba(26,122,60,0.15)!important;transform:translateY(-5px);}

        @media(max-width:1000px){
          .hero-g{grid-template-columns:1fr!important;}
          .wid-hide{display:none!important;}
          .g3{grid-template-columns:1fr!important;}
          .g2{grid-template-columns:1fr!important;}
          .g4{grid-template-columns:1fr 1fr!important;}
          .g5{grid-template-columns:1fr 1fr!important;}
          .math-g{grid-template-columns:1fr!important;}
          .spot-g{grid-template-columns:1fr!important;}
        }
        @media(max-width:600px){
          .g4{grid-template-columns:1fr!important;}
          .nav-links{display:none!important;}
        }
      `}</style>

      <div style={{background:T.bg,color:T.t,minHeight:'100vh',position:'relative',overflowX:'hidden'}}>

        {/* ── NAV ───────────────────────────────────────────── */}
        <nav style={{position:'sticky',top:0,zIndex:50,borderBottom:`1px solid ${T.ft}`,backdropFilter:'blur(24px)',background:T.nav}}>
          <div style={{maxWidth:1280,margin:'0 auto',padding:'0 32px',height:68,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span style={{fontWeight:900,fontSize:21,color:T.t,fontFamily:'var(--font-display,system-ui)',letterSpacing:'-0.03em'}}>
              Recruitation<span className="brand-grad">.io</span>
            </span>
            <div className="nav-links" style={{display:'flex',alignItems:'center',gap:32}}>
              <a href="#live"     className="land-nl" style={{color:T.td}}>Watch it</a>
              <a href="#features" className="land-nl" style={{color:T.td}}>Features</a>
              <a href="#pricing"  className="land-nl" style={{color:T.td}}>Pricing</a>
            </div>
            <div style={{display:'flex',gap:10}}>
              <Link to="/login/agency"  className="land-btn-g" style={{border:`1px solid ${T.ghost}`,color:T.ghostT}}>Log in</Link>
              <Link to="/signup/agency" className="land-btn-p" style={{padding:'10px 20px',fontSize:14}}>Start free →</Link>
            </div>
          </div>
        </nav>

        {/* ── HERO ──────────────────────────────────────────── */}
        <section style={{padding:'120px 32px 100px',position:'relative',overflow:'hidden',minHeight:'88vh',display:'flex',alignItems:'center'}}>
          {/* Background layers */}
          {dark && <div className="dot-grid" style={{position:'absolute',inset:0,opacity:0.5,pointerEvents:'none'}}/>}
          <Orbs dark={dark}/>
          {/* Dramatic top-center spotlight */}
          <div style={{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:900,height:500,background:'radial-gradient(ellipse at 50% 0%,rgba(26,122,60,0.22) 0%,transparent 70%)',pointerEvents:'none',zIndex:0}}/>
          {/* Thin top-border beam */}
          <div style={{position:'absolute',top:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent 0%,rgba(57,217,138,0.5) 30%,rgba(57,217,138,0.8) 50%,rgba(57,217,138,0.5) 70%,transparent 100%)',zIndex:1}}/>

          <div style={{maxWidth:1280,margin:'0 auto',position:'relative',zIndex:1,width:'100%'}}>
            <div className="hero-g" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,alignItems:'center'}}>

              {/* ── Copy column ── */}
              <div style={{display:'flex',flexDirection:'column',gap:0}}>

                {/* Live status badge */}
                <div data-sr style={{marginBottom:28}}>
                  <div style={{
                    display:'inline-flex',alignItems:'center',gap:10,
                    padding:'7px 16px 7px 10px',
                    background:'rgba(57,217,138,0.06)',
                    border:'1px solid rgba(57,217,138,0.22)',
                    borderRadius:9999,
                  }}>
                    <div style={{display:'flex',alignItems:'center',gap:6,background:'rgba(34,197,94,0.12)',border:'1px solid rgba(34,197,94,0.3)',borderRadius:999,padding:'3px 10px'}}>
                      <span style={{width:6,height:6,borderRadius:'50%',background:'#22c55e',display:'inline-block',boxShadow:'0 0 8px #22c55e',animation:'pulseDot 1.5s ease-in-out infinite'}}/>
                      <span style={{fontSize:10,fontWeight:800,color:'#22c55e',letterSpacing:'0.08em'}}>LIVE</span>
                    </div>
                    <span style={{fontSize:12,color:T.tm}}>142 agencies screening candidates right now</span>
                  </div>
                </div>

                {/* Headline */}
                <div data-sr data-sr-delay="0.06" style={{marginBottom:28}}>
                  {/* Pre-line */}
                  <div style={{
                    fontFamily:'var(--font-display,system-ui)',fontWeight:700,
                    fontSize:'clamp(1rem,1.4vw,1.25rem)',
                    color:T.td,letterSpacing:'0.01em',marginBottom:6,
                  }}>
                    Every applicant. Every role.
                  </div>
                  {/* Main line 1 - giant outlined number */}
                  <h1 style={{
                    fontFamily:'var(--font-display,system-ui)',fontWeight:900,
                    letterSpacing:'-0.05em',lineHeight:0.95,margin:0,
                    fontSize:'clamp(4.5rem,8vw,7.2rem)',
                  }}>
                    <span style={{color:T.t,display:'block'}}>Screen</span>
                    <span style={{display:'block',
                      WebkitTextStroke:`3px #39d98a`,
                      color:'transparent',
                      textShadow:`0 0 80px rgba(57,217,138,0.25)`,
                      lineHeight:1,
                    }}>500.</span>
                    <span style={{display:'block',
                      fontSize:'clamp(2.4rem,4.2vw,3.8rem)',
                      color:T.t,letterSpacing:'-0.03em',lineHeight:1.1,marginTop:4,
                    }}>Hire the best <TypeWord/></span>
                  </h1>
                </div>

                {/* Body */}
                <p data-sr data-sr-delay="0.14" style={{
                  fontSize:17,color:T.tm,lineHeight:1.75,maxWidth:480,marginBottom:28,
                }}>
                  Real AI voice interviews for every applicant — tailored questions,
                  red-flag probing, credential verification, and a{' '}
                  <strong style={{color:T.t,fontWeight:600}}>ranked shortlist in under 2 minutes.</strong>
                </p>

                {/* Micro-metrics strip */}
                <div data-sr data-sr-delay="0.18" style={{
                  display:'flex',flexWrap:'wrap',gap:0,marginBottom:32,
                  background:T.card,border:`1px solid ${T.border}`,
                  borderRadius:12,overflow:'hidden',width:'fit-content',
                }}>
                  {[
                    {n:'95%',  l:'faster than phone screens'},
                    {n:'27',   l:'languages supported'},
                    {n:'2 min',l:'to full ranked shortlist'},
                  ].map((m,i)=>(
                    <div key={m.n} style={{
                      padding:'12px 20px',display:'flex',flexDirection:'column',
                      borderRight: i < 2 ? `1px solid ${T.border}` : 'none',
                    }}>
                      <span style={{fontFamily:'var(--font-display,system-ui)',fontSize:18,fontWeight:800,color:'#39d98a',letterSpacing:'-0.02em',lineHeight:1}}>{m.n}</span>
                      <span style={{fontSize:11,color:T.td,marginTop:3,whiteSpace:'nowrap'}}>{m.l}</span>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <div data-sr data-sr-delay="0.22" style={{display:'flex',flexWrap:'wrap',gap:12,marginBottom:24,alignItems:'center'}}>
                  {/* Primary CTA with glow ring */}
                  <div style={{position:'relative',display:'inline-flex'}}>
                    <div style={{
                      position:'absolute',inset:-3,borderRadius:9999,
                      background:'linear-gradient(135deg,#39d98a,#1a7a3c,#39d98a)',
                      backgroundSize:'200% 200%',
                      animation:'shimmer 2.5s linear infinite',
                      opacity:0.6,filter:'blur(6px)',
                    }}/>
                    <Link to="/signup/agency" className="land-btn-p lg" style={{position:'relative'}}>
                      Start free — 20 credits →
                    </Link>
                  </div>
                  <a href="#live" className="land-btn-g" style={{border:`1px solid ${T.ghost}`,color:T.ghostT}}>
                    Watch it run ↓
                  </a>
                </div>

                {/* Trust tags */}
                <div data-sr data-sr-delay="0.26" style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:32}}>
                  {['SOC 2 ready','GDPR aligned','Anti-deepfake','White-label portals','No credit card'].map(tag=>(
                    <span key={tag} style={{
                      fontSize:11,color:T.td,
                      background:T.tag,border:`1px solid ${T.tagB}`,
                      borderRadius:6,padding:'3px 10px',
                    }}>{tag}</span>
                  ))}
                </div>

                {/* Completion notification card */}
                <div data-sr data-sr-delay="0.30" style={{
                  display:'inline-flex',alignItems:'center',gap:14,
                  padding:'12px 18px',
                  background:T.card,
                  border:`1px solid rgba(26,122,60,0.35)`,
                  borderRadius:14,width:'fit-content',
                  animation:'heroFloat 6s ease-in-out infinite',
                  boxShadow:dark?'0 8px 32px rgba(0,0,0,0.3)':'0 8px 24px rgba(0,0,0,0.08)',
                }}>
                  <div style={{
                    width:36,height:36,borderRadius:10,
                    background:'rgba(26,122,60,0.12)',border:'1px solid rgba(26,122,60,0.25)',
                    display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0,
                  }}>📊</div>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:T.t,marginBottom:2}}>Interview complete · Signal Score 94</div>
                    <div style={{fontSize:11,color:T.td}}>Sarah Chen · Data Scientist · <span style={{color:'#39d98a',fontWeight:700}}>HIRE</span></div>
                  </div>
                  <div style={{
                    padding:'3px 10px',borderRadius:999,
                    background:'rgba(26,122,60,0.12)',border:'1px solid rgba(26,122,60,0.3)',
                    fontSize:10,fontWeight:800,color:'#39d98a',letterSpacing:'0.05em',flexShrink:0,
                  }}>+1 done</div>
                </div>
              </div>

              {/* ── Widget column ── */}
              <div className="wid-hide" style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16,paddingBottom:44}}>
                <HeroWidget/>
                {/* Second floating card - positioned below widget */}
                <div style={{
                  display:'inline-flex',alignItems:'center',gap:12,
                  padding:'10px 16px',
                  background:T.card,border:`1px solid ${T.border}`,
                  borderRadius:12,alignSelf:'flex-end',
                  animation:'heroFloat 7s ease-in-out 1s infinite',
                }}>
                  <div style={{display:'flex',gap:0}}>
                    {['#1a7a3c','#1a56a0','#7c3aed','#c2410c'].map((c,i)=>(
                      <div key={c} style={{
                        width:22,height:22,borderRadius:'50%',background:c,
                        border:`2px solid ${T.bg}`,marginLeft:i?-6:0,
                        display:'flex',alignItems:'center',justifyContent:'center',
                        fontSize:8,color:'#fff',fontWeight:800,flexShrink:0,
                      }}>
                        {['YA','CH','RK','AM'][i]}
                      </div>
                    ))}
                  </div>
                  <div style={{fontSize:11,color:T.tm}}>
                    <span style={{fontWeight:700,color:T.t}}>4 agencies</span> reviewed this candidate
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── LIVE FEED ─────────────────────────────────────── */}
        <LiveFeed T={T}/>

        {/* ── STATS ─────────────────────────────────────────── */}
        <section style={{padding:'80px 32px'}}>
          <div style={{maxWidth:1280,margin:'0 auto'}}>
            <div className="g4" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
              <StatCard n={500}  suffix="+"   label="Candidates screened per agency per month" T={T}/>
              <StatCard n={27}   suffix=""    label="Languages — interview in any of them" T={T}/>
              <StatCard n={95}   suffix="%"   label="Faster than a manual phone-screen process" T={T}/>
              <StatCard n={2}    suffix=" min" label="From interview end to full ranked shortlist" T={T}/>
            </div>
          </div>
        </section>

        {/* ── THE MATH ──────────────────────────────────────── */}
        <TheMath T={T} dark={dark}/>

        {/* ── PIPELINE DEMO ─────────────────────────────────── */}
        <Pipeline T={T} dark={dark}/>

        {/* ── FEATURES ──────────────────────────────────────── */}
        <section id="features" style={{padding:'100px 32px',background:dark?`linear-gradient(180deg,${T.bg} 0%,${T.bg2} 50%,${T.bg} 100%)`:T.bg2}}>
          <div style={{maxWidth:1280,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:56}} data-sr>
              <span className="land-chip" style={{background:T.chip,border:`1px solid ${T.chipB}`,marginBottom:16,display:'inline-flex'}}>Everything in the platform</span>
              <h2 className="land-h2" style={{color:T.t,marginTop:12}}>
                12 capabilities.{' '}
                <span className="brand-grad">All included.</span>
              </h2>
              <p style={{color:T.tm,fontSize:16,marginTop:12,maxWidth:520,marginInline:'auto'}}>No add-ons, no hidden tiers. Every Growth plan includes the full stack.</p>
            </div>

            {/* Spotlight features */}
            <div className="spot-g" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
              {SPOTLIGHT_FEAT.map((f,i)=>(
                <div key={f.t} className="land-card" data-sr data-sr-delay={String(i*0.08)} style={{
                  padding:'36px 32px',background:T.card,border:`1px solid ${T.border}`,
                  position:'relative',overflow:'hidden',
                }}>
                  <div style={{position:'absolute',inset:0,background:'radial-gradient(600px 400px at 0% 0%,rgba(26,122,60,0.06) 0%,transparent 65%)',pointerEvents:'none'}}/>
                  <div style={{position:'relative'}}>
                    <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:20}}>
                      <div style={{width:60,height:60,borderRadius:16,background:'rgba(26,122,60,0.10)',border:'1px solid rgba(26,122,60,0.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>{f.icon}</div>
                      <div>
                        <div style={{fontFamily:'var(--font-display,system-ui)',fontSize:18,fontWeight:700,color:T.t,letterSpacing:'-0.02em'}}>{f.t}</div>
                        <div style={{display:'flex',alignItems:'baseline',gap:6,marginTop:4}}>
                          <span style={{fontFamily:'monospace',fontSize:20,fontWeight:800,color:'#39d98a'}}>{f.stat}</span>
                          <span style={{fontSize:11,color:T.td}}>{f.statL}</span>
                        </div>
                      </div>
                    </div>
                    <p style={{fontSize:14,color:T.tm,lineHeight:1.75,marginBottom:20}}>{f.d}</p>
                    <div style={{display:'flex',flexDirection:'column',gap:8}}>
                      {f.detail.map(d=>(
                        <div key={d} style={{display:'flex',alignItems:'center',gap:10}}>
                          <span style={{color:'#39d98a',fontSize:13,fontWeight:700,flexShrink:0}}>✓</span>
                          <span style={{fontSize:13,color:T.td}}>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Compact feature grid */}
            <div className="g4" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
              {CORE_FEAT.map((f,i)=>(
                <div key={f.t} className="feat-card" data-sr data-sr-delay={String(i*0.04)} style={{background:T.card,border:`1px solid ${T.border}`}}>
                  <div style={{width:40,height:40,borderRadius:10,background:'rgba(26,122,60,0.10)',border:'1px solid rgba(26,122,60,0.20)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{f.icon}</div>
                  <div className="land-h3" style={{color:T.t,fontSize:13.5}}>{f.t}</div>
                  <div style={{fontSize:12.5,color:T.td,lineHeight:1.65}}>{f.d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── JOB TEMPLATES ─────────────────────────────────── */}
        <section style={{padding:'0 32px 100px',background:dark?`linear-gradient(180deg,${T.bg} 0%,${T.bg2} 50%,${T.bg} 100%)`:T.bg2}}>
          <div style={{maxWidth:1280,margin:'0 auto',paddingTop:100}}>
            <div style={{textAlign:'center',marginBottom:48}} data-sr>
              <span className="land-chip" style={{background:T.chip,border:`1px solid ${T.chipB}`,marginBottom:16,display:'inline-flex'}}>Ready-made templates</span>
              <h2 className="land-h2" style={{color:T.t,marginTop:12}}>
                Launch a job in{' '}
                <span className="brand-grad">90 seconds.</span>
              </h2>
              <p style={{color:T.tm,fontSize:15,marginTop:10}}>Pre-loaded with AI questions. Fill in the details and go live immediately.</p>
            </div>
            <div className="g3" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
              {TEMPLATES.map((tmpl,i)=>(
                <div key={tmpl.role} className="tmpl-card" data-sr data-sr-delay={String(i*0.09)} style={{background:T.card,border:`1px solid ${T.border}`}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:15,color:T.t,marginBottom:4}}>{tmpl.role}</div>
                      <div style={{fontSize:12,color:T.td}}>{tmpl.level}</div>
                    </div>
                    <span style={{background:'rgba(26,122,60,0.10)',border:'1px solid rgba(26,122,60,0.28)',borderRadius:6,padding:'3px 9px',fontSize:11,color:'#39d98a',fontWeight:700}}>Template</span>
                  </div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:16}}>
                    {tmpl.tags.map(tag=>(
                      <span key={tag} style={{background:T.tag,border:`1px solid ${T.tagB}`,borderRadius:6,padding:'2px 8px',fontSize:11,color:T.tagT}}>{tag}</span>
                    ))}
                  </div>
                  <div style={{display:'flex',gap:16,fontSize:12,color:T.td,marginBottom:20}}>
                    <span>🎙️ {tmpl.questions} AI questions</span>
                    <span>⏱️ ~{tmpl.est}</span>
                    <span>🌍 {tmpl.lang}</span>
                  </div>
                  <Link to="/signup/agency" className="land-btn-p" style={{width:'100%',justifyContent:'center',fontSize:13,padding:'10px 20px'}}>Use template →</Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ───────────────────────────────────────── */}
        <section id="pricing" style={{padding:'100px 32px'}}>
          <div style={{maxWidth:1280,margin:'0 auto'}}>
            <div style={{textAlign:'center',marginBottom:56}} data-sr>
              <span className="land-chip" style={{background:T.chip,border:`1px solid ${T.chipB}`,marginBottom:16,display:'inline-flex'}}>Pricing</span>
              <h2 className="land-h2" style={{color:T.t,marginTop:12}}>
                Credit-based.{' '}
                <span className="brand-grad">No surprises.</span>
              </h2>
              <p style={{color:T.td,fontSize:15,marginTop:10}}>Pay only for what you post and interview. Cancel any time.</p>
            </div>
            <div className="g3" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,alignItems:'start'}}>
              {PLANS.map((p,i)=>(
                <div key={p.name} data-sr data-sr-delay={String(i*0.09)} style={{
                  padding:'36px 30px',position:'relative',borderRadius:24,
                  background:p.hot?(dark?'rgba(26,122,60,0.07)':'rgba(26,122,60,0.03)'):T.card,
                  border:`1px solid ${p.hot?'rgba(26,122,60,0.55)':T.border}`,
                  boxShadow:p.hot?'0 0 60px rgba(26,122,60,0.14), 0 0 0 1px rgba(26,122,60,0.1)':'none',
                  transition:'transform 0.22s,box-shadow 0.28s',
                }}
                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(-4px)';}}
                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='';}}
                >
                  {p.hot&&(
                    <div style={{
                      position:'absolute',top:-14,left:'50%',transform:'translateX(-50%)',
                      background:'linear-gradient(135deg,#1a7a3c,#39d98a)',color:'#fff',
                      fontSize:10,fontWeight:800,letterSpacing:'0.1em',
                      padding:'5px 18px',borderRadius:9999,whiteSpace:'nowrap',
                      boxShadow:'0 4px 16px rgba(26,122,60,0.4)',
                    }}>⚡ MOST POPULAR</div>
                  )}

                  <div style={{fontFamily:'monospace',fontSize:11,color:p.hot?'#39d98a':T.td,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:12}}>{p.name}</div>
                  <div style={{fontFamily:'var(--font-display,system-ui)',fontWeight:900,fontSize:44,letterSpacing:'-0.04em',color:T.t,lineHeight:1}}>
                    {p.price}<span style={{fontSize:16,fontWeight:500,color:T.td}}>{p.period}</span>
                  </div>
                  <div style={{fontSize:12,color:T.td,marginTop:6,marginBottom:24}}>{p.sub}</div>

                  <hr style={{border:'none',borderTop:`1px solid ${T.border}`,marginBottom:24}}/>

                  <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:28}}>
                    {p.feat.map(f=>(
                      <div key={f} style={{display:'flex',alignItems:'flex-start',gap:10}}>
                        <div style={{
                          width:18,height:18,borderRadius:'50%',flexShrink:0,marginTop:1,
                          background:p.hot?'rgba(26,122,60,0.15)':'rgba(26,122,60,0.08)',
                          border:`1px solid ${p.hot?'rgba(26,122,60,0.35)':'rgba(26,122,60,0.15)'}`,
                          display:'flex',alignItems:'center',justifyContent:'center',
                          fontSize:10,color:p.hot?'#39d98a':'#1a7a3c',fontWeight:700,
                        }}>✓</div>
                        <span style={{fontSize:13,color:T.tm,lineHeight:1.4}}>{f}</span>
                      </div>
                    ))}
                  </div>

                  {p.name==='Enterprise'
                    ?<a href="mailto:sales@recruitation.io" className="land-btn-g" style={{display:'flex',justifyContent:'center',border:`1px solid ${T.ghost}`,color:T.ghostT}}>Talk to sales</a>
                    :<Link to="/signup/agency" className="land-btn-p" style={{display:'flex',justifyContent:'center',...(p.hot?{}:{background:'rgba(26,122,60,0.12)',color:'#39d98a',boxShadow:'none'})}}>Start free →</Link>
                  }
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────── */}
        <section style={{padding:'0 32px 120px'}}>
          <div style={{maxWidth:1280,margin:'0 auto'}}>
            <div data-sr style={{
              position:'relative',borderRadius:32,overflow:'hidden',
              padding:'100px 48px',textAlign:'center',
              background:dark?'linear-gradient(135deg,rgba(26,122,60,0.18) 0%,rgba(57,217,138,0.06) 100%)':'linear-gradient(135deg,rgba(26,122,60,0.08) 0%,rgba(57,217,138,0.03) 100%)',
              border:`1px solid ${T.chipB}`,
            }}>
              {/* Dot grid bg */}
              {dark&&<div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle,rgba(26,122,60,0.15) 1px,transparent 1px)',backgroundSize:'24px 24px',opacity:0.5,pointerEvents:'none'}}/>}
              {/* Glow */}
              <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 120%,rgba(26,122,60,0.28) 0%,transparent 60%)',pointerEvents:'none'}}/>
              {/* Corner orbs */}
              <div style={{position:'absolute',top:-80,left:-80,width:300,height:300,borderRadius:'50%',background:'radial-gradient(ellipse,rgba(26,122,60,0.18),transparent 70%)',filter:'blur(40px)',pointerEvents:'none'}}/>
              <div style={{position:'absolute',bottom:-80,right:-80,width:300,height:300,borderRadius:'50%',background:'radial-gradient(ellipse,rgba(57,217,138,0.12),transparent 70%)',filter:'blur(40px)',pointerEvents:'none'}}/>

              <div style={{position:'relative'}}>
                <div style={{fontFamily:'monospace',fontSize:12,color:'#39d98a',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:20}}>
                  <span style={{display:'inline-flex',alignItems:'center',gap:8}}>
                    <span style={{width:8,height:8,borderRadius:'50%',background:'#22c55e',boxShadow:'0 0 8px #22c55e',display:'inline-block',animation:'pulseDot 1.5s ease-in-out infinite'}}/>
                    {dark?'142 agencies screening right now':'Join the platform'}
                  </span>
                </div>
                <h2 style={{fontFamily:'var(--font-display,system-ui)',fontWeight:900,fontSize:'clamp(2.2rem,4vw,3.8rem)',color:T.t,letterSpacing:'-0.04em',lineHeight:1.08,marginBottom:20}}>
                  Ready to screen 500 candidates<br/>
                  <span className="brand-grad">before your competitors screen 5?</span>
                </h2>
                <p style={{color:T.tm,fontSize:17,maxWidth:500,marginInline:'auto',lineHeight:1.65,marginBottom:36}}>
                  Start free. 20 credits. 4 jobs. No credit card. Your shortlist in under 2 minutes.
                </p>
                <div style={{display:'flex',justifyContent:'center',gap:14,flexWrap:'wrap',marginBottom:20}}>
                  <Link to="/signup/agency" className="land-btn-p lg">Create your free account →</Link>
                  <a href="mailto:sales@recruitation.io" className="land-btn-g" style={{border:`1px solid ${T.ghost}`,color:T.ghostT,padding:'16px 28px',fontSize:15}}>Talk to sales</a>
                </div>
                <p style={{fontSize:12,color:T.td}}>No credit card · Approved within 24 hours · Cancel any time</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ────────────────────────────────────────── */}
        <footer style={{borderTop:`1px solid ${T.ft}`,padding:'56px 32px 40px'}}>
          <div style={{maxWidth:1280,margin:'0 auto'}}>
            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:40,marginBottom:48}}>
              {/* Brand */}
              <div>
                <div style={{fontWeight:900,fontSize:20,color:T.t,fontFamily:'var(--font-display,system-ui)',letterSpacing:'-0.02em',marginBottom:12}}>
                  Recruitation<span className="brand-grad">.io</span>
                </div>
                <p style={{fontSize:13,color:T.td,lineHeight:1.7,maxWidth:260}}>
                  AI-powered voice interviews for recruitment agencies. Screen faster, hire smarter.
                </p>
                <div style={{display:'flex',gap:8,marginTop:16}}>
                  {['SOC 2','GDPR','ISO 27001'].map(b=>(
                    <span key={b} style={{fontSize:10,fontWeight:600,color:T.td,background:T.tag,border:`1px solid ${T.tagB}`,borderRadius:5,padding:'3px 8px'}}>{b}</span>
                  ))}
                </div>
              </div>
              {/* Product */}
              <div>
                <div style={{fontSize:11,fontWeight:700,color:T.td,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:16}}>Product</div>
                {[['Features','#features'],['Pricing','#pricing'],['Templates','#'],['Watch it run','#live']].map(([l,h])=>(
                  <a key={l} href={h} style={{display:'block',fontSize:13,color:T.tm,textDecoration:'none',marginBottom:10,transition:'color 0.2s'}}
                    onMouseEnter={e=>(e.target as HTMLElement).style.color='#39d98a'}
                    onMouseLeave={e=>(e.target as HTMLElement).style.color=T.tm}>{l}</a>
                ))}
              </div>
              {/* Company */}
              <div>
                <div style={{fontSize:11,fontWeight:700,color:T.td,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:16}}>Company</div>
                {[['About','mailto:hello@recruitation.io'],['Blog','mailto:hello@recruitation.io'],['Contact','mailto:hello@recruitation.io'],['Sales','mailto:sales@recruitation.io']].map(([l,h])=>(
                  <a key={l} href={h} style={{display:'block',fontSize:13,color:T.tm,textDecoration:'none',marginBottom:10,transition:'color 0.2s'}}
                    onMouseEnter={e=>(e.target as HTMLElement).style.color='#39d98a'}
                    onMouseLeave={e=>(e.target as HTMLElement).style.color=T.tm}>{l}</a>
                ))}
              </div>
              {/* Legal */}
              <div>
                <div style={{fontSize:11,fontWeight:700,color:T.td,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:16}}>Legal</div>
                {[['Privacy Policy','mailto:legal@recruitation.io'],['Terms of Service','mailto:legal@recruitation.io'],['Cookie Policy','mailto:legal@recruitation.io'],['Security','mailto:legal@recruitation.io']].map(([l,h])=>(
                  <a key={l} href={h} style={{display:'block',fontSize:13,color:T.tm,textDecoration:'none',marginBottom:10,transition:'color 0.2s'}}
                    onMouseEnter={e=>(e.target as HTMLElement).style.color='#39d98a'}
                    onMouseLeave={e=>(e.target as HTMLElement).style.color=T.tm}>{l}</a>
                ))}
              </div>
            </div>
            <div style={{borderTop:`1px solid ${T.ft}`,paddingTop:24,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
              <div style={{fontSize:12,color:T.ftT}}>© 2025 Recruitation.io · All rights reserved</div>
              <div style={{fontSize:12,color:T.ftT}}>Built with AI · Powered by ElevenLabs, Gemini & Claude</div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
