# Recruitation.AI — developer guide

Multi-tenant B2B recruitment SaaS. Agencies get white-label portals; candidates do voice-AI first-round interviews; AI produces hiring recommendations; post-hire, a knowledge OS grows from every placement.

## Commands

```bash
npm install                  # install frontend deps
npm run dev                  # Vite dev server
npm run build                # tsc -b && vite build → dist/
npm run typecheck            # tsc --noEmit

# Functions
cd functions && npm install
npm run build                # compile to functions/lib/
firebase emulators:start
firebase deploy --only functions

# Firebase
firebase deploy              # hosting + rules + functions
firebase deploy --only hosting
firebase deploy --only firestore:rules,storage:rules
```

## Environment

Copy `.env.example` → `.env.local`. Populate VITE_FIREBASE_* from your project config.

Server-side secrets live in Functions:
```
firebase functions:secrets:set GEMINI_API_KEY
firebase functions:secrets:set ANTHROPIC_API_KEY
firebase functions:secrets:set RESEND_API_KEY
firebase functions:secrets:set APP_URL
```

## Architecture

### Path alias
`@/*` → `src/*` (set in `tsconfig.json` + `vite.config.ts`).

### Routing model
- **Marketing**: `/`, `/login/*`, `/signup/*`, `/pending`
- **Public apply**: `/:agencySlug/:jobSlug` (white-labelled via `applyBrand()`)
- **Candidate**: `/me`, `/jobs-open`, `/interview/:id`, `/thanks/:id`, `/onboarding`, `/logbook`, `/profile`
- **Agency**: `/dashboard`, `/jobs`, `/jobs/new`, `/jobs/:id`, `/pipeline`, `/reports/:id`, `/companies`, `/credits`, `/settings`
- **Admin**: `/admin`, `/admin/agencies`, `/admin/credits`, `/admin/activity`

Guards: `RequireAgency`, `RequireCandidate`, `RequireAdmin` in `src/routes/guards.tsx`.

### Role resolution (AuthContext)
1. Admin if `idTokenResult.claims.admin === true`
2. Agency if `agencies/{uid}` doc exists
3. Candidate if `candidates/{uid}` doc exists

Agency docs drive white-label — `brandColor` is injected into CSS vars on auth.

### Credit model
- Job create: **-5** credits
- Interview completion: **-1** credit (deducted inside `analyzeInterview` Function after work succeeds, so failures are free)
- Top-ups: admin writes `creditTransactions` + increments balance

### Data model
| Collection              | Key                | Notes                                         |
|-------------------------|--------------------|-----------------------------------------------|
| agencies                | uid                | status ∈ {pending, active, suspended}         |
| agencies_by_slug        | slug               | `{ agencyId }` — unique slug index            |
| candidates              | uid                |                                               |
| jobs                    | auto               | `jobs/{id}/testQuestions/{qid}` subcollection |
| applications            | auto               |                                               |
| creditTransactions      | auto               | ledger; admin-only writes                     |
| companyKnowledge        | auto               | `roles[roleName].facts[]` grows over time     |
| logbook                 | auto               | candidate daily entries                       |

### ElevenLabs integration
Dynamic import (`import('@elevenlabs/client')`) — absence is tolerated. When `VITE_ELEVENLABS_AGENT_ID` is unset or the package is missing, `Interview.tsx` falls back to `simulateInterview()` that drives the full UI with scripted turns.

### AI pipeline
`finalizeInterview()` → Function `analyzeInterview`:
1. Gemini scores 4 axes + extracts red flags + inconsistencies
2. Claude produces overall score + recommendation
3. Voice-authenticity heuristic stubbed at 10-25 (swap real model later)
4. Report written to `applications/{id}.report`; credits deducted

### Knowledge OS
- Agency uploads handbook PDF → `extractHandbook` Function → facts saved under `companyKnowledge/{id}/roles/{roleName}/facts`
- Placed candidate writes a daily log → `extractLogbookFacts` Function extracts 5 general facts → next person placed at this employer benefits

## White-label theming

`applyBrand(hex)` in `src/lib/theme.ts` derives a 7-step scale by mixing the brand hex with white (for `-50/100/200`) and black (for `-600/700/800`). Called automatically on agency sign-in and on the public apply page.

## Keyboard shortcuts

Pipeline page:
- **J** / **K** — next / previous candidate
- **A** — approve
- **R** — reject

## Creative features shipped (5+)

1. Signal Score™ live meter during interviews
2. Voice authenticity / deepfake check on report
3. Runway-at-current-burn on credits dashboard
4. Linear-style keyboard shortcuts on pipeline
5. Post-hire Knowledge OS (logbook → company knowledge)
6. Runtime CSS-variable white-label theming

## Deploy checklist

1. `firebase projects:list` → select target
2. `firebase use <project>`
3. Set secrets (`firebase functions:secrets:set ...`)
4. `npm run build` (root)
5. `cd functions && npm run build`
6. `firebase deploy`
7. In Firebase Auth console: enable Email/Password provider
8. Grant admin role: `admin.auth().setCustomUserClaims(uid, { admin: true })`

## Notes for future contributors

- Never push to a `prod` branch directly; use PRs only.
- Firestore rules deny everything by default; add new collections explicitly.
- Secrets must never land in the `src/` bundle. All API keys live in Function secrets.
- Dynamic imports for optional SDKs (`@elevenlabs/client`) keep builds green on fresh clones.
