# Recruitation.AI — Progress log

## Day 1 — initial build (2026-04-18)

### Scope
Full-stack multi-tenant recruitment SaaS with voice-AI interviews, AI analysis, white-label agency portals, post-hire knowledge OS, and super-admin panel.

### Stack
- **Frontend**: React 18 + Vite 5 + TypeScript (strict) + React Router v6. No Tailwind; hand-crafted CSS variables for design tokens, white-label friendly.
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **AI**: Gemini 1.5 Flash (structured extraction + interview scoring) + Claude Sonnet 4 (final recommendation, handbook extraction, onboarding chat)
- **Voice**: ElevenLabs Conversational AI (dynamic import; simulation fallback when agent ID not set)
- **Email**: Resend

### Completed today

#### Core infrastructure
- `package.json`, `tsconfig.json`, `vite.config.ts` — strict TS, `@/*` path alias
- `src/lib/firebase.ts` — lazy init with `firebaseConfigured` guard so app renders even when env is blank
- `src/lib/types.ts` — full domain model (Agency, Job, JobConfig, Candidate, Application, AnalysisReport, CreditTransaction, CompanyKnowledge, LogbookEntry)
- `src/lib/util.ts` — cx, slugify (NFKD), formatRelative, scoreClass, randomId, readFileAsDataUrl, isValidHexColor
- `src/lib/theme.ts` — `applyBrand(hex)` injects `--brand/-50/-100/-200/-600/-700/-800` CSS vars via RGB mixing
- `src/lib/toast.tsx` — ToastProvider + `useToast()`
- `src/styles/globals.css` — full design system (buttons, cards, badges, metrics, app-shell, marketing, signal meter, skeletons, pulse-dot, chip, qbox, score classes)
- `src/contexts/AuthContext.tsx` — resolves role (admin claim → agency doc → candidate doc) and auto-applies agency brand color on load
- `src/routes/guards.tsx` — RequireAgency (redirects pending→/pending), RequireCandidate, RequireAdmin, FullLoader

#### UI primitives
- Button (primary/secondary/ghost/danger, sm/md/lg, block, loading)
- Field, Input, Textarea, Select
- Avatar with initials fallback and photoUrl
- Badge (success/info/warn/danger/neutral)
- Logo (SVG with brand gradient)
- SignalMeter — 16-bar animated live confidence indicator
- AppShell — role-aware sidebar with user card + sign-out
- MarketingShell — blurred sticky nav + footer

#### Services layer
- `agencies.ts` — signup, unique-slug allocation via `agencies_by_slug` index, list pending/active, status toggles
- `jobs.ts` — CRUD + `extractJobFromPdf` callable + credit deduction on job_create (-5)
- `applications.ts` — CRUD, live listener, approve (+ email), reject, finalizeInterview
- `candidates.ts` — signup with parallel uploads, PDF-extraction callable
- `credits.ts` — ledger record + atomic balance increment
- `knowledge.ts` — companies, handbook upload, logbook, onboarding chat

#### Pages — marketing & auth
- Landing — gradient hero, 3 pricing tiers, 8-card how-it-works, 3 testimonials
- AgencySignup — 2-step wizard with live brand preview
- AgencyLogin, AdminLogin
- CandidateAuth — unified login/signup with mode prop, `?next` deep-link support
- PendingAgency — awaiting approval state

#### Pages — agency (8)
- Dashboard — 4 metrics incl. **Runway at current burn** (credits / (30d burn / 30))
- Jobs, JobDetail, NewJob (3-step wizard with Gemini PDF extraction + test-question subcollection)
- Pipeline — **Linear-grade keyboard shortcuts (J/K, A, R)** with recommendation-filter chips
- Report — 4 axis metrics, summary, red flags, inconsistencies, tests, institution pills, **Voice authenticity score**, transcript, audio, Approve→notify
- Companies — knowledge base with per-role handbook upload + chip-list of AI-extracted facts
- Credits — balance, 30d burn, runway, 4 pack tiles, full ledger
- Settings — brand colour picker with live preview, logo upload, public URL copy, contact info

#### Pages — candidate (8)
- Portal — My Applications with status badges
- BrowseJobs — public job index
- Apply — white-label agency+job public page at `/[agencySlug]/[jobSlug]`
- Interview — live ElevenLabs voice session (dynamic import, simulation fallback), transcript bubbles, test-question image overlay, signal meter, MM:SS timer
- ThankYou — real-time status pipeline (interview → transcript → cross-ref → verification → scoring → decision)
- Onboarding — chat grounded on company knowledge via Claude
- Logbook — daily reflections, AI-extracted fact chips flow back to company knowledge
- Profile — edit name/phone/language/skills, re-upload CV/LinkedIn/photo

#### Pages — admin (4)
- AdminDashboard — pending count, active count, credits in circulation
- Agencies — tabbed pending/active with approve/suspend controls
- Credits — per-agency manual top-ups with invoice note
- Activity — real-time credit ledger feed via Firestore onSnapshot

#### Backend — Firebase Functions (7 callables)
- `extractJobFromPdf` — Gemini → structured JobConfig
- `extractCandidateDocs` — Gemini → cvText, linkedinText, skills
- `analyzeInterview` — Gemini scoring → Claude recommendation (two-stage), deducts 1 credit
- `sendSelectionEmail` — Resend with agency-branded HTML
- `extractHandbook` — Claude → facts per role
- `extractLogbookFacts` — Claude → facts back to company knowledge
- `onboardingChat` — Claude grounded on role facts

#### Firebase config
- `firebase.json` — Firestore, Storage, Functions, Hosting (SPA rewrite), Emulators
- `firestore.rules` — self-scoped reads/writes, admin escape hatch, cred balance immutable client-side, default deny
- `storage.rules` — PDF+image only, size caps (10–25 MB per bucket), self-scoped writes
- `firestore.indexes.json` — 8 composite indexes for common queries
- `functions/package.json` + `tsconfig.json` + `src/index.ts`

### Creative features added (5+)
1. **Signal Score™** — proprietary live confidence meter during interviews (1 Hz jitter on agent turns, steady climb on candidate turns)
2. **Voice authenticity check** — deepfake/clone heuristic (0–100, lower = more suspicious) shown on report
3. **Runway at current burn** — 30d burn-rate projection on credits dashboard
4. **Linear-grade keyboard shortcuts** — J/K navigate, A approve, R reject on pipeline
5. **Post-hire Knowledge OS** — every logbook entry's extracted facts auto-populate the employer's role-specific knowledge base for the next hire
6. **White-label runtime theming** — CSS variable injection with RGB-mixed scale (brand-50 through brand-800)

### Open / next
- Wire real ElevenLabs agent ID to remove simulation fallback
- Stripe top-up integration (UI ready; admin manual top-up live)
- Multi-lingual transcript translation (field reserved; `transcriptEnglish`)
- Institution verification API (field reserved)
- PDF export on Report.tsx uses `window.print()`; swap for designed PDF later
- Deploy: `firebase deploy` after setting project + secrets
