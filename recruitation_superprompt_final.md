# RECRUITATION.AI — CLAUDE CODE SUPER-PROMPT
## Model: Claude Opus 4.7 | One-shot full platform build | QA-verified

---

## YOUR MANDATE

You are building **Recruitation.AI** — a production-grade, multi-tenant B2B SaaS recruitment platform — from scratch, end-to-end, in one session. This is not a prototype. This is a real, deployable product.

You have **complete creative freedom**:
- Choose or change the tech stack if you see a better fit
- Add surprise features that genuinely improve the product
- Restructure the architecture if it makes the system stronger
- Pick any language, framework, or library you see fit
- Spin up sub-agents to parallelize work across phases
- Invent UI patterns that exceed the described designs
- Make the design world-class — this needs to look like a funded startup product

The only non-negotiables are the **vision** and **user journeys** described below. Everything else is yours to own and improve.

**Print detailed progress updates after every major step:**
```
[PROGRESS] ✓ Phase 2 complete — Auth + agency onboarding live
[NEXT] Starting Phase 3 — Job creation wizard + ElevenLabs integration
[BLOCKER] None — proceeding
```

---

## VISUAL REFERENCE

Below is a full HTML mockup of every screen in the platform. This is the design reference — not the final code. Use it to understand the exact layout, information architecture, and UX of every dashboard. You are encouraged to dramatically improve the visual design beyond this mockup. The mockup shows WHAT to build; you decide HOW it looks at production quality.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
*{box-sizing:border-box;margin:0;padding:0;font-family:system-ui,sans-serif}
body{background:#f5f5f3;color:#1a1a1a;font-size:13px;padding:1rem}
.tabs{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:1.25rem}
.tab{padding:5px 12px;border-radius:6px;border:1px solid #ddd;background:#fff;cursor:pointer;font-size:11px;color:#666;font-weight:500}
.tab.on{background:#1a7a3c;color:#fff;border-color:#1a7a3c}
.view{display:none}.view.on{display:block}
.card{background:#fff;border:1px solid #e5e5e3;border-radius:12px;padding:1rem 1.25rem;margin-bottom:10px}
.sm{background:#fff;border:1px solid #e5e5e3;border-radius:8px;padding:10px 14px}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
.met{background:#f5f5f3;border-radius:8px;padding:10px;text-align:center}
.met .n{font-size:20px;font-weight:500;margin:2px 0}
.met .l{font-size:11px;color:#888}
.b{display:inline-block;font-size:11px;font-weight:500;padding:2px 7px;border-radius:4px}
.bg{background:#e8f5ee;color:#1a7a3c}
.bb{background:#e8f0fb;color:#1a56a0}
.ba{background:#fef3e2;color:#92500a}
.br{background:#fde8e8;color:#9b1c1c}
.bx{background:#f5f5f3;color:#666}
.nm{font-weight:500;font-size:13px}
.sb{font-size:12px;color:#666;margin-top:1px}
.row{display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid #f0f0ee}
.row:last-child{border-bottom:none}
.av{width:30px;height:30px;border-radius:50%;background:#e8f0fb;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:500;color:#1a56a0;flex-shrink:0}
.sc{font-size:18px;font-weight:500}.hi{color:#1a7a3c}.mi{color:#92500a}.lo{color:#9b1c1c}
.hr{border:none;border-top:1px solid #f0f0ee;margin:10px 0}
.lbl{font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.06em;color:#888;margin:0 0 8px}
.step{display:flex;gap:10px;padding:9px 0;border-bottom:1px solid #f0f0ee}
.step:last-child{border-bottom:none}
.sn{width:22px;height:22px;border-radius:50%;background:#1a7a3c;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:500;flex-shrink:0}
.sd{background:#e8f5ee;color:#1a7a3c}
.fl{font-size:11px;padding:2px 7px;border-radius:3px;background:#fde8e8;color:#9b1c1c;font-weight:500}
.vr{font-size:11px;padding:2px 7px;border-radius:3px;background:#e8f5ee;color:#1a7a3c;font-weight:500}
.qb{background:#f5f5f3;border-radius:6px;padding:9px 12px;margin-bottom:7px;border-left:3px solid #ccc}
.qb.ok{border-left-color:#1a7a3c}
.qb.g{border-left-color:#1a7a3c}
.lg{border-left:2px solid #1a7a3c;padding:5px 10px;margin-bottom:7px;font-size:12px}
.ld{font-size:11px;color:#888;margin-bottom:2px}
.tech{background:#f5f5f3;border-radius:10px;padding:14px;margin-top:4px;border:1px dashed #ccc}
.tech-title{font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.07em;color:#666;margin-bottom:10px}
.api-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:6px;margin-bottom:10px}
.api-chip{background:#fff;border:1px solid #e5e5e3;border-radius:6px;padding:7px 10px}
.api-name{font-size:12px;font-weight:500}
.api-use{font-size:11px;color:#666;margin-top:2px}
.flow-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:11px;color:#666;margin-bottom:6px}
.flow-box{background:#fff;border:1px solid #e5e5e3;border-radius:4px;padding:3px 8px;color:#1a1a1a;font-weight:500;font-size:11px}
.db-chip{display:inline-flex;align-items:center;gap:4px;background:#fff;border:1px solid #e5e5e3;border-radius:4px;padding:2px 8px;font-size:11px;font-family:monospace;margin:2px}
.note{font-size:11px;color:#666;line-height:1.6;margin-top:6px}
.pr{height:5px;border-radius:3px;background:#e5e5e3;overflow:hidden;margin:3px 0}
.pf{height:100%;border-radius:3px;background:#1a7a3c}
</style>
</head>
<body>
<div class="tabs">
  <div class="tab on" onclick="sv('ov',this)">Overview</div>
  <div class="tab" onclick="sv('ag',this)">Agency dashboard</div>
  <div class="tab" onclick="sv('jb',this)">Job creation</div>
  <div class="tab" onclick="sv('cp',this)">Candidate portal</div>
  <div class="tab" onclick="sv('iv',this)">Interview + tests</div>
  <div class="tab" onclick="sv('rp',this)">AI report</div>
  <div class="tab" onclick="sv('ob',this)">Post-hire OS</div>
  <div class="tab" onclick="sv('ad',this)">Admin panel</div>
</div>

<!-- OVERVIEW -->
<div class="view on" id="v-ov">
<div class="g3" style="margin-bottom:10px">
  <div class="sm"><div class="b br" style="margin-bottom:5px">Super admin</div><div class="nm">Recruitation.AI team</div><div class="sb">Approve agencies · top up credits</div></div>
  <div class="sm"><div class="b bb" style="margin-bottom:5px">Agency</div><div class="nm">Recruitment companies</div><div class="sb">Post jobs · view results · white-label</div></div>
  <div class="sm"><div class="b bx" style="margin-bottom:5px">Candidate</div><div class="nm">Applicants (account required)</div><div class="sb">Apply · interview · track status · onboard</div></div>
</div>
<div class="card">
  <p class="lbl">Complete end-to-end flow</p>
  <div class="step"><div class="sn sd">✓</div><div><div class="nm">Agency signs up → pending → admin approves + tops up credits</div><div class="sb">White-label at /[agencySlug] · their logo · their color · zero Recruitation.AI branding visible</div></div></div>
  <div class="step"><div class="sn">2</div><div><div class="nm">Agency creates job (3-step wizard)</div><div class="sb">Title · method (form/PDF upload) · full config: requirements, tone, language, custom Qs, red flags, technical test questions + images</div></div></div>
  <div class="step"><div class="sn">3</div><div><div class="nm">Candidate clicks branded link → must create account</div><div class="sb">Name · email · phone · CV PDF · LinkedIn PDF · photo · language. Email + phone for selection notifications.</div></div></div>
  <div class="step"><div class="sn">4</div><div><div class="nm">ElevenLabs voice interview (8–15 min, multilingual)</div><div class="sb">Role-specific Qs · red flag probing · technical tests with optional images · silently logs Q/A correctness</div></div></div>
  <div class="step"><div class="sn">5</div><div><div class="nm">AI analysis pipeline (Firebase Function)</div><div class="sb">Gemini: translate + extract institutions + web-verify · Claude Sonnet 4: cross-reference + score + recommend</div></div></div>
  <div class="step"><div class="sn">6</div><div><div class="nm">Recruiter reviews ranked dashboard → clicks Approve</div><div class="sb">Candidate account shows "Selected" live · Resend fires selection email to candidate</div></div></div>
  <div class="step"><div class="sn">7</div><div><div class="nm">Post-hire Knowledge OS activates</div><div class="sb">Agency shares role PDF · AI extracts + onboards · daily logbook · AI builds role knowledge per company</div></div></div>
</div>
<div class="tech">
  <div class="tech-title">Full stack</div>
  <div class="api-grid">
    <div class="api-chip"><div class="api-name">React 18 + Vite 5</div><div class="api-use">Frontend</div></div>
    <div class="api-chip"><div class="api-name">Firebase Auth</div><div class="api-use">Agency + candidate login</div></div>
    <div class="api-chip"><div class="api-name">Firestore</div><div class="api-use">All data storage</div></div>
    <div class="api-chip"><div class="api-name">Firebase Storage</div><div class="api-use">CV, LinkedIn, logos, test images</div></div>
    <div class="api-chip"><div class="api-name">Firebase Functions</div><div class="api-use">AI proxy — keys never in browser</div></div>
    <div class="api-chip"><div class="api-name">ElevenLabs Conv. AI</div><div class="api-use">Voice interview WebRTC</div></div>
    <div class="api-chip"><div class="api-name">Claude Sonnet 4</div><div class="api-use">Scoring · inconsistency · report</div></div>
    <div class="api-chip"><div class="api-name">Gemini 1.5 Flash</div><div class="api-use">PDF extract · translate · verify</div></div>
    <div class="api-chip"><div class="api-name">Resend</div><div class="api-use">Selection + approval emails</div></div>
  </div>
  <div class="note">All Claude, Gemini, Resend API keys in Firebase Functions secrets — never in browser. Only ElevenLabs agent ID is client-side (WebRTC handshake).</div>
</div>
</div>

<!-- AGENCY DASHBOARD -->
<div class="view" id="v-ag">
<div class="card">
  <p class="lbl">Agency dashboard</p>
  <div class="g3" style="margin-bottom:10px">
    <div class="met"><div class="n">8</div><div class="l">Active jobs</div></div>
    <div class="met"><div class="n">247</div><div class="l">Total applicants</div></div>
    <div class="met"><div class="n">165</div><div class="l">Credits left</div></div>
  </div>
  <p class="lbl">Active jobs</p>
  <div class="row"><div style="flex:1"><div class="nm">Radiologist — Dubai</div><div class="sb">43 applicants · 31 interviewed</div></div><span class="b bg">Active</span></div>
  <div class="row"><div style="flex:1"><div class="nm">Head Nurse — Abu Dhabi</div><div class="sb">67 applicants · 54 interviewed</div></div><span class="b bg">Active</span></div>
  <div class="row"><div style="flex:1"><div class="nm">Civil Engineer — Riyadh</div><div class="sb">28 applicants · 18 interviewed</div></div><span class="b bg">Active</span></div>
  <div class="row"><div style="flex:1"><div class="nm">Accountant — Kuwait</div><div class="sb">19 applicants · 11 interviewed</div></div><span class="b ba">Paused</span></div>
  <div class="hr"></div>
  <p class="lbl">Recent candidates</p>
  <div class="row"><div class="av">RK</div><div style="flex:1"><div class="nm">Rania Khalil</div><div class="sb">Radiologist · 3 mins ago</div></div><span class="sc hi">87</span><span class="b bg">Strong yes</span></div>
  <div class="row"><div class="av">MF</div><div style="flex:1"><div class="nm">Mohamed Farook</div><div class="sb">Head Nurse · 22 mins ago</div></div><span class="sc mi">61</span><span class="b ba">Maybe</span></div>
  <div class="row"><div class="av">JP</div><div style="flex:1"><div class="nm">James Pacheco</div><div class="sb">Civil Eng · 1 hr ago</div></div><span class="sc lo">34</span><span class="b br">No</span></div>
</div>
</div>

<!-- JOB CREATION -->
<div class="view" id="v-jb">
<div class="card">
  <p class="lbl">New job · Step 2 of 3</p>
  <div class="g2" style="margin-bottom:10px">
    <div><div class="sb">Job title</div><div class="nm">Radiologist</div></div>
    <div><div class="sb">Industry</div><div class="nm">Healthcare</div></div>
    <div><div class="sb">Location</div><div class="nm">Dubai, UAE</div></div>
    <div><div class="sb">Interview tone</div><div class="nm">Professional</div></div>
  </div>
  <div class="hr"></div>
  <p class="lbl">Custom questions + red flags</p>
  <div class="qb"><div class="nm" style="font-size:12px">Ask about MRI vs CT experience ratio</div><div class="sb">Custom question</div></div>
  <div class="qb"><div class="nm" style="font-size:12px">Probe the 2019–2021 employment gap</div><div class="sb">Red flag probe</div></div>
  <div class="hr"></div>
  <p class="lbl">Technical test questions</p>
  <div class="qb g">
    <div style="display:flex;gap:10px">
      <div style="width:48px;height:36px;background:#e5e5e3;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#888;flex-shrink:0">img</div>
      <div><div class="nm" style="font-size:12px">Diagnose this chest X-ray</div><div class="sb">Correct answer stored · displayed to candidate mid-interview · logged silently</div></div>
    </div>
  </div>
  <div class="qb g"><div class="nm" style="font-size:12px">GFR of 18 — what contrast protocol?</div><div class="sb">Text only · correct: avoid iodinated contrast</div></div>
  <div class="sm" style="margin-top:8px;background:#f5f5f3">
    <div class="nm" style="color:#1a7a3c">Generated link: recruitation.ai/alhind/radiologist</div>
    <div class="sb" style="margin-top:4px">Agency branding only · –5 credits on creation</div>
  </div>
</div>
</div>

<!-- CANDIDATE PORTAL -->
<div class="view" id="v-cp">
<div class="card">
  <div style="background:#e8f5ee;border-radius:8px;padding:10px 12px;margin-bottom:12px;border-left:3px solid #1a7a3c">
    <div class="nm" style="font-size:12px;color:#1a7a3c">Account required before interview</div>
    <div class="sb" style="margin-top:3px">Must sign up: name, email, phone, CV PDF, LinkedIn PDF, photo, language</div>
  </div>
  <p class="lbl">My applications</p>
  <div class="row"><div style="flex:1"><div class="nm">Radiologist — Dubai</div><div class="sb">Applied Apr 18</div></div><span class="b ba">Under review</span></div>
  <div class="row" style="background:#e8f5ee;border-radius:8px;padding:8px 10px;border-bottom:none">
    <div style="flex:1"><div class="nm">Senior Radiologist — Abu Dhabi</div></div>
    <div style="text-align:right"><span class="b bg">Selected</span><div class="sb" style="font-size:11px">Email sent ✓</div></div>
  </div>
  <div class="hr"></div>
  <p class="lbl">Browse open jobs</p>
  <div class="row"><div style="flex:1"><div class="nm">Head Nurse — Abu Dhabi</div><div class="sb">2 days ago</div></div><button style="font-size:11px;padding:4px 10px">One-click apply</button></div>
</div>
</div>

<!-- INTERVIEW -->
<div class="view" id="v-iv">
<div class="card">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
    <div style="width:8px;height:8px;border-radius:50%;background:#1a7a3c"></div>
    <div class="nm">Live — Rania Khalil · Radiologist</div>
  </div>
  <div style="background:#f5f5f3;border-radius:8px;padding:12px;margin-bottom:10px;font-size:12px;line-height:1.8">
    <div><span style="color:#1a7a3c;font-weight:500">Agent:</span> Walk me through your imaging modalities at King Faisal.</div>
    <div style="margin-top:5px"><span style="font-weight:500">Rania:</span> Primarily CT and MRI — mostly thoracic and abdominal. High oncology volume.</div>
    <div style="margin-top:5px"><span style="color:#1a7a3c;font-weight:500">Agent:</span> I'm displaying an image now. [Chest X-ray shown] What is your assessment?</div>
    <div style="margin-top:5px"><span style="font-weight:500">Rania:</span> Right lower lobe consolidation — likely pneumonia.</div>
  </div>
  <p class="lbl">Technical test log (internal only)</p>
  <div class="qb ok"><div class="nm" style="font-size:12px">Q: Diagnose chest X-ray</div><div style="display:flex;gap:6px;margin-top:3px"><span class="vr">Correct</span><span class="sb">Expected: RLL pneumonia · Said: RLL consolidation/pneumonia</span></div></div>
  <div class="qb"><div class="nm" style="font-size:12px">Q: GFR 18 contrast protocol</div><span class="b bx" style="font-size:11px;margin-top:3px;display:inline-block">Pending</span></div>
</div>
</div>

<!-- AI REPORT -->
<div class="view" id="v-rp">
<div class="card">
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
    <div class="av" style="width:40px;height:40px;font-size:13px">RK</div>
    <div style="flex:1"><div class="nm" style="font-size:14px">Rania Khalil</div><div class="sb">Radiologist — Dubai · Arabic interview</div></div>
    <div style="text-align:right"><div class="sc hi" style="font-size:26px">87</div><div class="b bg">Strong yes</div></div>
  </div>
  <div class="g3" style="margin-bottom:10px">
    <div class="met"><div class="n" style="font-size:16px;color:#1a7a3c">91</div><div class="l">Qualification</div></div>
    <div class="met"><div class="n" style="font-size:16px;color:#1a7a3c">88</div><div class="l">Communication</div></div>
    <div class="met"><div class="n" style="font-size:16px;color:#92500a">72</div><div class="l">Role fit</div></div>
  </div>
  <div class="hr"></div>
  <p class="lbl">Technical test results</p>
  <div class="qb ok"><div class="nm" style="font-size:12px">Chest X-ray — Correct</div></div>
  <div class="qb ok"><div class="nm" style="font-size:12px">GFR contrast protocol — Correct</div></div>
  <div class="hr"></div>
  <p class="lbl">Institution verification</p>
  <span class="vr">King Faisal Hospital ✓</span> <span class="vr">Cairo University ✓</span> <span class="vr">Saudi Health Council ✓</span>
  <div class="hr"></div>
  <p class="lbl">LinkedIn inconsistencies</p>
  <span class="fl">LinkedIn: 2 yrs at KFSH · Spoken: 6 yrs — investigate</span>
  <div style="display:flex;gap:7px;margin-top:12px">
    <button style="background:#1a7a3c;color:#fff;border:none;border-radius:6px;font-size:12px;padding:6px 12px;cursor:pointer">Approve → notify candidate</button>
    <button style="font-size:12px;padding:6px 12px;border-radius:6px;border:1px solid #ddd;cursor:pointer">Export PDF</button>
  </div>
</div>
</div>

<!-- POST-HIRE OS -->
<div class="view" id="v-ob">
<div class="card">
  <p class="lbl">Post-hire knowledge OS</p>
  <div class="step"><div class="sn sd">✓</div><div><div class="nm">Agency shared company + role handbook PDF</div><div class="sb">Gemini extracted: policies, workflows, team, equipment, escalation procedures</div></div></div>
  <div class="step"><div class="sn sd">✓</div><div><div class="nm">Candidate onboarding chat live</div><div class="sb">AI knows her role, company, team, equipment — answers any question from handbook</div></div></div>
  <div class="step"><div class="sn">3</div><div><div class="nm">Daily logbook (mandatory)</div><div class="sb">AI ingests entries → updates role knowledge base for this company</div></div></div>
  <div class="hr"></div>
  <p class="lbl">Logbook entries</p>
  <div class="lg"><div class="ld">Day 1</div>Attended induction. Learned PACS (Philips IntelliSpace). Key: contrast approvals for GFR &lt; 30 need consultant sign-off.</div>
  <div class="lg"><div class="ld">Day 2</div>14 CT chests, 6 MRI abdomens. Urgent findings → direct call to referring consultant.</div>
  <div class="hr"></div>
  <p class="lbl">Company dropdown (repeat postings)</p>
  <select style="width:100%;font-size:12px;padding:5px 8px;border-radius:6px;border:1px solid #ddd">
    <option>Dubai General Hospital (3 placements · knowledge base: 47 facts)</option>
    <option>King Faisal Specialist (1 placement)</option>
    <option>+ New company</option>
  </select>
  <div class="sb" style="margin-top:5px;font-size:11px">Pre-loaded into next interview agent automatically</div>
</div>
</div>

<!-- ADMIN -->
<div class="view" id="v-ad">
<div class="card">
  <p class="lbl">Admin panel</p>
  <div class="g3" style="margin-bottom:10px">
    <div class="met"><div class="n">14</div><div class="l">Active agencies</div></div>
    <div class="met"><div class="n">3</div><div class="l">Pending</div></div>
    <div class="met"><div class="n">1,847</div><div class="l">Total interviews</div></div>
  </div>
  <p class="lbl">Pending agencies</p>
  <div class="row">
    <div style="flex:1"><div class="nm">Global Staffing FZE</div><div class="sb">Dubai · Applied Apr 17</div></div>
    <button style="font-size:11px;padding:3px 9px;background:#1a7a3c;color:#fff;border:none;border-radius:4px;cursor:pointer;margin-right:4px">Approve</button>
    <button style="font-size:11px;padding:3px 9px;border-radius:4px;border:1px solid #ddd;cursor:pointer">Reject</button>
  </div>
  <div class="hr"></div>
  <p class="lbl">Credit management</p>
  <div class="row"><div style="flex:1"><div class="nm">Al-Hind Foreign Agency</div><div class="pr" style="width:160px"><div class="pf" style="width:55%"></div></div><div class="sb">165 / 300 credits</div></div><button style="font-size:11px;padding:3px 9px;border-radius:4px;border:1px solid #ddd;cursor:pointer">Top up</button></div>
</div>
</div>

<script>
function sv(id,el){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('on'));
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('on'));
  document.getElementById('v-'+id).classList.add('on');
  el.classList.add('on');
}
</script>
</body>
</html>
```

---

## THE VISION

Recruitment agencies spend 70% of their time on the wrong candidates. A recruiter posts a job, gets 500 applications, and manually calls every single one — 30–45 minutes each, capped at ~8 per day.

**Recruitation.AI replaces that first screening interview with an AI voice agent that is better than a human at it.** Not a chatbot. Not a form. A real voice conversation, in the candidate's preferred language, that adapts to the specific job and the specific CV.

The recruiter opens their dashboard and sees candidates pre-ranked 0–100 with hiring recommendations, red flags flagged, institutions verified, and full transcripts. They spend time on the 10 worth it, not the 500 who aren't.

---

## BUSINESS MODEL

Multi-tenant B2B SaaS. Any recruitment agency signs up and gets their own white-label portal.

| Tier | Who | What |
|------|-----|-------|
| Super Admin | Recruitation.AI team | Approve agencies, top up credits, monitor platform |
| Agency | Recruitment companies | Create jobs, view results, manage credits |
| Candidate | Job applicants | Account required — apply, interview, track status, post-hire onboarding |

**Revenue: credit-based**
- Create job post: –5 credits
- Complete interview: –10 credits
- API cost ~$0.50 → sells for $5–10 in credits
- Admin tops up manually (v1 — no self-serve payments yet)

---

## WHITE-LABEL MECHANIC

Every agency gets `/[agencySlug]`. Al-Hind is at `/alhind`. On that domain:
- Agency's logo and brand color (from Firestore)
- Agency's jobs
- Zero mention of Recruitation.AI anywhere on candidate-facing pages

Main `recruitation.ai` domain: green-first (#1a7a3c), Plus Jakarta Sans, white/black/green. No agency branding ever leaks here.

---

## COMPLETE USER JOURNEYS

### AGENCY JOURNEY
1. Signs up at `/signup` — name, email, password, phone, website, description, logo upload, brand color picker
2. Status: **pending** — locked out until admin approves
3. Admin approves → adds credits
4. Agency at `/dashboard` — sees jobs, candidate pipeline, credits
5. **New Job** → 3-step wizard:
   - Step 1: Job title
   - Step 2: Method — fill form OR upload PDF (Gemini extracts all fields automatically)
   - Step 3: Full config — description, qualifications, experience, salary, location, work type, industry, interview tone, language, duration, custom questions, red flags to probe, **technical test questions + optional images**
6. Job live → link generated → –5 credits
7. Agency shares link
8. Each completed interview → –10 credits
9. Dashboard shows ranked candidates: score, recommendation, red flags at a glance
10. Click candidate → full report: transcript (original + English), audio playback, Claude's analysis, institution verifications, LinkedIn inconsistencies, technical test results, hiring recommendation, PDF export button
11. **Approve** → candidate notified on account + Resend email fires

### TECHNICAL TEST QUESTIONS (key feature)
When creating a job, agency adds:
- Question text
- Optional image upload (X-ray, diagram, document, screenshot — anything)
- Correct answer (stored server-side only)

During interview:
- Agent presents question verbally
- If image attached → React frontend displays it to candidate
- Candidate answers verbally
- Agent logs: question, correct answer, candidate's answer, correct/wrong
- **Agent gives ZERO feedback** — no right/wrong signal — just moves on naturally
- All test results appear in the candidate report

### CANDIDATE JOURNEY
1. Clicks agency's branded link → lands on `/[agencySlug]/[jobSlug]`
2. **Must create account before interview:**
   - Full name
   - Email address (used for selection notification)
   - Phone number (used for selection notification)
   - CV/Resume PDF
   - LinkedIn PDF export
   - Profile photo
   - Preferred interview language
   - Additional skills
3. Gemini extracts CV + LinkedIn text server-side
4. Clicks **Start Interview** → mic permission → ElevenLabs WebRTC
5. Agent loaded with: agency info, full job config, custom questions, red flags, test questions + image URLs, candidate CV text, LinkedIn text, name, preferred language
6. 8–15 minute real conversation in their language
7. "Thank you" page with agency branding
8. Candidate can log back in anytime:
   - Application status: Applied → Interview Complete → Under Review → **Selected** / Rejected
   - Browse other jobs → one-click apply (all profile data pre-fills)
   - If approved: prominent "You have been selected for [Job Title]" + email sent

### ON APPROVAL
- Agency clicks Approve
- Firestore: candidates/{uid}/applications/{appId}.status = "approved"
- Firebase Function triggers → Resend email to candidate's email address
- Email branded with agency logo/color — not Recruitation.AI
- Candidate's account shows "Selected" live via onSnapshot

---

## AI ANALYSIS PIPELINE
Runs as Firebase Function. All AI keys are secrets — never in browser.

**Step 1 — Gemini 1.5 Flash:**
- Translate transcript to English if needed
- Extract all institution names mentioned
- Web search each institution to verify it exists and is legitimate
- Structure key claims

**Step 2 — Claude Sonnet 4:**
- Cross-reference LinkedIn PDF vs spoken answers → flag inconsistencies
- Cross-reference CV claims vs interview answers
- Score on 4 dimensions (0–100 each):
  1. Communication (clarity, coherence, language)
  2. Confidence (delivery, decisiveness)
  3. Qualification match (claimed experience vs requirements)
  4. Role fit (attitude, motivations, culture signals)
- Weighted overall score 0–100
- Hiring recommendation: **Strong Yes / Yes / Maybe / No**
- List all red flags found
- Summary paragraph for the recruiter

---

## POST-HIRE KNOWLEDGE OS

After agency approves a candidate:
1. Agency clicks **Share company + role details**
2. Selects company from dropdown (existing companies they've placed with before, or adds new)
3. Uploads a role handbook PDF (policies, workflows, team structure, equipment, escalation procedures — anything)
4. Gemini extracts structured facts from the PDF
5. Candidate's onboarding chat is live — AI answers any question from the extracted handbook

**Daily logbook (mandatory for hired candidates):**
- Candidate logs: what they did today, what they learned
- Stored in Firestore: `logbook/{uid}/{date}`
- Background Firebase Function: Gemini extracts new facts from each entry
- Merges into `companyKnowledge/{companyId}/roles/{role}`

**Next time the same job is posted for the same company:**
- Agency selects company from dropdown
- `companyKnowledge` facts auto-inject into the interview agent's system prompt
- Agent now knows exactly what the role involves day-to-day from real employee experience

---

## FIRESTORE DATA MODEL

```
agencies/{agencyId}
  - name, slug, logoUrl, brandColor, credits, status (pending/active/suspended)
  - email, phone, website, description

jobs/{jobId}
  - agencyId, title, slug, method
  - jobConfig: { description, qualifications, experience, salary, location,
                 workType, industry, tone, language, duration,
                 customQuestions[], redFlags[], topics[] }

jobs/{jobId}/testQuestions/{qId}
  - question, correctAnswer, imageUrl (nullable), weight

candidates/{uid}
  - name, email, phone, cvUrl, linkedinUrl, photoUrl, cvText, linkedinText, skills

candidates/{uid}/applications/{appId}
  - agencyId, jobId, status, score, recommendation, reportUrl, audioUrl
  - transcript (original + english), institutionVerifications[], inconsistencies[]
  - testResults: [{ qId, question, correctAnswer, candidateAnswer, correct }]
  - createdAt, completedAt

companyKnowledge/{companyId}
  - agencyId, name, logoUrl
companyKnowledge/{companyId}/roles/{role}
  - facts[], lastUpdated, placementCount

logbook/{uid}/{date}
  - entry, extractedFacts[], jobId, companyId

creditTransactions/{txId}
  - agencyId, amount, type (topup/jobCreate/interview), createdAt

```

---

## DESIGN REQUIREMENTS

This needs to look like a **funded startup**, not a side project. The visual bar is high.

**Recruitation.AI brand:**
- Primary: #1a7a3c (green)
- Font: Plus Jakarta Sans (display), Inter (body), JetBrains Mono (code/IDs)
- Hiring recommendation colors: Strong Yes = green, Yes = blue, Maybe = amber, No = red
- No CSS modules, no Tailwind — CSS variables in globals.css

**Agency white-label:**
- Their brand color replaces #1a7a3c on all candidate-facing pages
- Their logo replaces Recruitation.AI logo
- Loaded from Firestore on page load via CSS variable injection

**Candidate-facing pages:** Clean, trust-building, professional. Candidates are applying for real jobs — it must feel legitimate and polished.

**Agency dashboard:** Data-dense but readable. Think Linear or Notion — minimal chrome, maximum information density.

---

## TECHNICAL ARCHITECTURE

**Suggested stack (change freely if you see better):**
- Frontend: React 18 + Vite 5
- Routing: React Router v6
- Auth/DB/Storage: Firebase
- Voice: ElevenLabs Conversational AI (WebRTC)
- Analysis: Claude Sonnet 4 (via Firebase Function)
- PDF/Translation/Verify: Gemini 1.5 Flash (via Firebase Function)
- Email: Resend (via Firebase Function)
- Hosting: Firebase App Hosting

**Security — CRITICAL:**
- Claude, Gemini, Resend API keys: Firebase Functions secrets only
- ElevenLabs agent ID: client-side only (needed for WebRTC)
- Firestore rules: agencies read/write own agencyId only · candidates read/write own uid only · admin collection: isAdmin custom claim only

---

## QA EXPERT SYSTEM

After building the full platform, run a complete QA pass using this expert system architecture:

**Knowledge Base (KB):** All expected behaviors, routes, and data flows in the system.

**Rules Base:** Derived assertions — e.g. "if candidate status is approved, Resend email must have fired", "if interview complete, analysis pipeline must have run", "if job created, credits must have decreased by 5".

**Inference Engine:** For each rule, check actual system state against expected state.

**Evidence Engine:** Log every test result with: test name, expected, actual, pass/fail, fix applied.

Run QA across all critical paths:
1. Agency signup → pending → admin approval → credit top-up
2. Job creation via form → job creation via PDF upload
3. Technical test question creation with image upload
4. Candidate signup → profile storage → CV/LinkedIn extraction
5. Interview start → ElevenLabs connects → test image displays correctly
6. Interview end → analysis pipeline fires → score + report generated
7. Agency approves → candidate status updates live → Resend email fires
8. Post-hire: handbook upload → extraction → onboarding chat answers correctly
9. Logbook entry → fact extraction → knowledge base update
10. White-label: agency color/logo renders correctly on candidate pages
11. Credits deduct correctly on job create (–5) and interview complete (–10)
12. Admin panel: approve agency → top up credits → audit log entry

Fix all failures before marking the build complete.

---

## BUILD PHASES (suggested — adapt freely)

```
Phase 1: Project setup, Firebase config, auth (agency + candidate + admin)
Phase 2: Agency onboarding — signup, pending state, white-label foundation
Phase 3: Admin panel — approve agencies, top up credits, audit log
Phase 4: Job creation wizard — form + PDF upload (Gemini extract) + test questions
Phase 5: Candidate portal — signup (mandatory before interview), profile, job browsing
Phase 6: ElevenLabs voice interview — WebRTC, system prompt injection, test image display
Phase 7: AI analysis pipeline — Gemini translate/verify + Claude score/report (Firebase Functions)
Phase 8: Agency results dashboard — ranked candidates, full report view, approve button
Phase 9: Selection notification — Resend email + live Firestore status update
Phase 10: Post-hire Knowledge OS — handbook upload, onboarding chat, daily logbook, knowledge base
Phase 11: Design polish — production-quality UI across all pages
Phase 12: QA expert system — full end-to-end test suite, fix all failures
Phase 13: Firebase App Hosting deployment — live on recruitation.ai
```

Print progress updates throughout. Never stop without explaining why. If you hit a blocker, state it clearly and propose a solution before proceeding.

**Build the whole thing. This is Day 1. Let's go.**
