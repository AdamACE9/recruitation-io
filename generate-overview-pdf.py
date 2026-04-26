# Generate a big, detailed Recruitation.AI overview PDF for presenting to stakeholders.
# Saves to: C:\Users\Adam Ahmed Danish\Downloads\Recruitation-AI-Overview.pdf

import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    ListFlowable, ListItem, KeepTogether, HRFlowable,
)
from reportlab.platypus.flowables import Flowable

# --------------- Output path ---------------
OUTPUT = r"C:\Users\Adam Ahmed Danish\Downloads\Recruitation-AI-Overview.pdf"

# --------------- Brand palette ---------------
BRAND = colors.HexColor('#1a7a3c')          # primary green
BRAND_LIGHT = colors.HexColor('#39d98a')    # accent green
DARK_BG = colors.HexColor('#05080f')        # near-black
INK = colors.HexColor('#0f172a')            # text
INK_MUTED = colors.HexColor('#475569')      # muted
SURFACE = colors.HexColor('#f8fafc')        # light surface
DANGER = colors.HexColor('#dc2626')         # red

# --------------- Styles ---------------
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name='CoverTitle',
    fontName='Helvetica-Bold', fontSize=44, leading=50, alignment=TA_LEFT,
    textColor=colors.white,
))
styles.add(ParagraphStyle(
    name='CoverSubtitle',
    fontName='Helvetica', fontSize=16, leading=22, alignment=TA_LEFT,
    textColor=colors.HexColor('#94a3b8'),
))
styles.add(ParagraphStyle(
    name='CoverTagline',
    fontName='Helvetica-Bold', fontSize=20, leading=26, alignment=TA_LEFT,
    textColor=BRAND_LIGHT,
))
styles.add(ParagraphStyle(
    name='SectionH1',
    fontName='Helvetica-Bold', fontSize=22, leading=28, spaceBefore=18, spaceAfter=10,
    textColor=BRAND,
))
styles.add(ParagraphStyle(
    name='SectionH2',
    fontName='Helvetica-Bold', fontSize=16, leading=22, spaceBefore=14, spaceAfter=6,
    textColor=INK,
))
styles.add(ParagraphStyle(
    name='SectionH3',
    fontName='Helvetica-Bold', fontSize=12, leading=16, spaceBefore=10, spaceAfter=4,
    textColor=BRAND,
))
styles.add(ParagraphStyle(
    name='Body2',
    fontName='Helvetica', fontSize=11, leading=16, alignment=TA_JUSTIFY,
    textColor=INK, spaceAfter=8,
))
styles.add(ParagraphStyle(
    name='Quote',
    fontName='Helvetica-Oblique', fontSize=12, leading=18, alignment=TA_LEFT,
    textColor=INK_MUTED, leftIndent=18, rightIndent=18,
    spaceBefore=8, spaceAfter=8, borderPadding=8,
))
styles.add(ParagraphStyle(
    name='Mono',
    fontName='Courier', fontSize=9.5, leading=13, alignment=TA_LEFT,
    textColor=INK, spaceAfter=6,
))
styles.add(ParagraphStyle(
    name='Caption',
    fontName='Helvetica-Oblique', fontSize=9, leading=12, alignment=TA_CENTER,
    textColor=INK_MUTED, spaceAfter=14,
))


# --------------- Custom flowables ---------------
class ColorBlock(Flowable):
    """Solid coloured banner with title and subtitle (for cover page)."""
    def __init__(self, width, height, bg=DARK_BG):
        super().__init__()
        self.width = width
        self.height = height
        self.bg = bg
    def wrap(self, *_):
        return (self.width, self.height)
    def draw(self):
        c = self.canv
        c.setFillColor(self.bg)
        c.rect(0, 0, self.width, self.height, stroke=0, fill=1)


def section_break(c, doc):
    """Draw the page header & footer on every page after cover."""
    c.saveState()
    # Top thin brand line
    c.setStrokeColor(BRAND)
    c.setLineWidth(2)
    c.line(2 * cm, A4[1] - 1.6 * cm, A4[0] - 2 * cm, A4[1] - 1.6 * cm)
    # Header text
    c.setFont('Helvetica-Bold', 9)
    c.setFillColor(BRAND)
    c.drawString(2 * cm, A4[1] - 1.3 * cm, 'RECRUITATION.AI')
    c.setFont('Helvetica', 9)
    c.setFillColor(INK_MUTED)
    c.drawRightString(A4[0] - 2 * cm, A4[1] - 1.3 * cm, 'Platform Overview · 2026')
    # Page number
    c.setFont('Helvetica', 9)
    c.setFillColor(INK_MUTED)
    c.drawCentredString(A4[0] / 2, 1.2 * cm, f'— {doc.page} —')
    c.restoreState()


def first_page(c, doc):
    """Cover page: full bleed dark background with brand mark."""
    c.saveState()
    # Full dark background
    c.setFillColor(DARK_BG)
    c.rect(0, 0, A4[0], A4[1], stroke=0, fill=1)
    # Subtle radial-style accent (rectangles approximating)
    c.setFillColor(colors.HexColor('#091a0e'))
    c.rect(0, A4[1] * 0.55, A4[0], A4[1] * 0.45, stroke=0, fill=1)
    # Top eyebrow
    c.setFillColor(BRAND_LIGHT)
    c.setFont('Helvetica-Bold', 11)
    c.drawString(3 * cm, A4[1] - 4 * cm, 'PLATFORM OVERVIEW')
    # Tiny live dot
    c.setFillColor(colors.HexColor('#22c55e'))
    c.circle(3 * cm - 6, A4[1] - 4 * cm + 3, 3.5, stroke=0, fill=1)
    # Title
    c.setFillColor(colors.white)
    c.setFont('Helvetica-Bold', 56)
    c.drawString(3 * cm, A4[1] - 7 * cm, 'Recruitation.AI')
    # Subtitle line
    c.setFillColor(BRAND_LIGHT)
    c.setFont('Helvetica-Bold', 22)
    c.drawString(3 * cm, A4[1] - 8.6 * cm, 'Voice-AI screening for every candidate.')
    # One-liner
    c.setFillColor(colors.HexColor('#cbd5e1'))
    c.setFont('Helvetica', 13)
    c.drawString(3 * cm, A4[1] - 11 * cm, 'A complete white-label hiring platform that runs real')
    c.drawString(3 * cm, A4[1] - 11.6 * cm, 'voice interviews, scores candidates across four axes,')
    c.drawString(3 * cm, A4[1] - 12.2 * cm, 'and delivers a ranked shortlist in minutes.')
    # Stats strip
    y = 16 * cm
    stats = [('500+', 'candidates / agency / mo'), ('27', 'languages'), ('95%', 'faster'), ('2 min', 'to shortlist')]
    for i, (n, l) in enumerate(stats):
        x = 3 * cm + i * 4 * cm
        c.setFillColor(BRAND_LIGHT)
        c.setFont('Helvetica-Bold', 26)
        c.drawString(x, y, n)
        c.setFillColor(colors.HexColor('#94a3b8'))
        c.setFont('Helvetica', 9)
        c.drawString(x, y - 0.5 * cm, l)
    # Bottom byline
    c.setFillColor(colors.HexColor('#64748b'))
    c.setFont('Helvetica', 10)
    c.drawString(3 * cm, 2.5 * cm, 'Built by Adam Ahmed Danish · 2026 · v0.1.0')
    c.restoreState()


# --------------- Document content ---------------
story = []

# Cover page handled by first_page; just add a blank page break trigger
story.append(PageBreak())


def H1(text):
    story.append(Paragraph(text, styles['SectionH1']))


def H2(text):
    story.append(Paragraph(text, styles['SectionH2']))


def H3(text):
    story.append(Paragraph(text, styles['SectionH3']))


def P(text):
    story.append(Paragraph(text, styles['Body2']))


def Q(text):
    story.append(Paragraph(text, styles['Quote']))


def MONO(text):
    # reportlab needs <br/> for newlines; escape <,>,&
    safe = (text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            .replace('\n', '<br/>'))
    story.append(Paragraph(safe, styles['Mono']))


def gap(h=8):
    story.append(Spacer(1, h))


def hr():
    story.append(HRFlowable(width='100%', thickness=0.6, color=colors.HexColor('#e2e8f0'),
                            spaceBefore=8, spaceAfter=8))


def bullet_list(items):
    bullets = [
        ListItem(Paragraph(b, styles['Body2']), leftIndent=8) for b in items
    ]
    story.append(ListFlowable(bullets, bulletType='bullet', start='•',
                              leftIndent=18, bulletColor=BRAND))


def box_table(rows, header_bg=BRAND, col_widths=None):
    t = Table(rows, colWidths=col_widths)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), header_bg),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('ALIGN', (0, 0), (-1, 0), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#e2e8f0')),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, SURFACE]),
    ]))
    story.append(t)


# ============ TABLE OF CONTENTS ============
H1('Contents')
toc = [
    ['§', 'Section', 'Page'],
    ['1', 'Executive summary', '3'],
    ['2', 'The problem we solve', '4'],
    ['3', 'How Recruitation.AI works', '5'],
    ['4', 'User personas', '7'],
    ['5', 'End-to-end flows', '8'],
    ['6', 'Architecture', '11'],
    ['7', 'Tech stack', '12'],
    ['8', 'The AI pipeline', '13'],
    ['9', 'Credit model & pricing', '15'],
    ['10', 'Security, privacy, compliance', '16'],
    ['11', 'White-label theming', '17'],
    ['12', 'Knowledge OS', '18'],
    ['13', 'Differentiators', '19'],
    ['14', 'Roadmap', '20'],
    ['15', 'Risk register', '21'],
    ['16', 'KPIs and unit economics', '22'],
    ['17', 'Live deployment & verification', '23'],
    ['18', 'Founder note', '24'],
]
box_table(toc, col_widths=[1.0 * cm, 13 * cm, 2.0 * cm])
story.append(PageBreak())

# ============ 1. EXECUTIVE SUMMARY ============
H1('1. Executive summary')
P("<b>Recruitation.AI</b> is a multi-tenant, white-label, voice-first recruitment SaaS. "
  "Hiring agencies sign up, get their own branded portal at "
  "<font color='#1a7a3c'><b>recruitation.io/&lt;agency-slug&gt;</b></font>, post jobs, and let an "
  "AI voice agent run a complete first-round screening interview with every applicant. "
  "After the interview, an AI pipeline scores each candidate across four axes, flags red "
  "flags and CV inconsistencies, runs a deep-fake authenticity check on the recording, and "
  "delivers a ranked shortlist with full transcripts and recordings.")
P("The platform replaces the 16-hour-per-20-candidates manual phone-screening grind that "
  "agencies still do today, at roughly 1.25% of the cost ($10 vs $800 for the same shortlist). "
  "Candidates apply once and can be screened in any of 27 supported languages without "
  "scheduling. Agencies pay per outcome — credits are only consumed on completed interviews "
  "and approvals, not on failed pipeline stages.")
P("The product is live in production at <b>https://recruitation-c64a9.web.app</b>. "
  "The architecture stack is React + Vite + TypeScript on Firebase Hosting, with seven "
  "Firebase Cloud Functions orchestrating Gemini 2.0 Flash, Groq Llama 3.3 70B, Google "
  "Custom Search, ElevenLabs Conversational AI, and Anthropic Claude Sonnet 4 in a single "
  "interview pipeline.")

H2('What it is in one sentence')
Q("\"Real voice interviews for every applicant — tailored questions, red-flag probing, "
  "credential verification, and a ranked shortlist in under two minutes.\"")

H2('Who it is for')
bullet_list([
    "<b>Hiring agencies</b> screening 50–500+ candidates per month per role — recruiting firms, RPO providers, manpower agencies, in-house TA teams.",
    "<b>Candidates</b> applying to roles where the agency has a Recruitation.AI portal — they get an asynchronous, scheduling-free interview in their preferred language.",
    "<b>Platform admin (us)</b> approves new agencies, distributes credits, and watches platform-wide signal quality.",
])
story.append(PageBreak())

# ============ 2. PROBLEM ============
H1('2. The problem we solve')
P("First-round phone screening is the bottleneck of every recruitment funnel. The math:")

cmp = [
    ['', 'The old way', 'Recruitation.AI'],
    ['Review 20 CVs manually', '2.5 hrs', '4 min (parallel upload)'],
    ['Schedule 20 phone screens', '1.5 hrs', 'instant — async, no calendar'],
    ['Run 20 phone screens', '10 hrs', '~40 min (in parallel)'],
    ['Write up notes & rank', '2 hrs', 'automatic'],
    ['Total time', '~16 hrs', '~44 min'],
    ['Cost (at $50/hr)', '~$800', '$10.00'],
    ['Quality consistency', 'recruiter-dependent', 'identical rubric every time'],
    ['Languages supported', "recruiter's languages only", '27 languages'],
    ['Recordings + transcripts', 'rare', 'every interview, by default'],
    ['Deepfake / authenticity check', 'none', 'built-in voice authenticity score'],
]
box_table(cmp, col_widths=[5.5 * cm, 5 * cm, 5.5 * cm])
gap(8)

H2('Pain points the existing market has not solved')
bullet_list([
    "<b>Time-zone scheduling.</b> Candidates and recruiters living continents apart play calendar tag for days. Recruitation.AI is async — the candidate clicks a link and starts whenever they want.",
    "<b>Bias.</b> Phone-screen bias is well-documented (accent, name, tone). Our agent runs the same rubric for every candidate. Audit logs are immutable.",
    "<b>Language coverage.</b> Most recruiting firms operate in 1–2 languages. Our agent runs in 27, and the LLM responds in the candidate's preferred language.",
    "<b>Authenticity.</b> Deepfake voice and stand-in interviewees are a real and growing problem. Every interview is voice-fingerprinted; suspicious sessions are flagged.",
    "<b>Lossy review.</b> Phone-screen notes are subjective and incomplete. We deliver full transcript + scoring + reasoning to the agency for every candidate.",
])
story.append(PageBreak())

# ============ 3. HOW IT WORKS ============
H1('3. How Recruitation.AI works')
H2('The five-stage pipeline')
P("Every applicant moves through the same five stages. Stages are autonomous and serverless — "
  "an agency can have 50 candidates in different stages at the same time without any human "
  "in the loop.")

stages = [
    ['#', 'Stage', 'What happens', 'Time'],
    ['1', 'CV parsed', 'Gemini 2.0 Flash reads the candidate\'s uploaded CV + LinkedIn PDF and extracts a structured profile (~1.5 KB summary).', '~5 sec'],
    ['2', 'AI analysis', 'Groq Llama 3.3 70B writes 3–5 questions tailored to this exact CV. Each question gets an image found via Google Custom Search.', '~15 sec'],
    ['3', 'Voice interview', 'ElevenLabs Conversational AI runs a real voice call. The agent greets, asks tailored questions, probes red flags, ends the call.', '~10–15 min'],
    ['4', 'Verified', 'Gemini scores the transcript on Qualification, Communication, Confidence, Role-Fit. Claude produces a final hire recommendation. Voice authenticity score is computed.', '~30 sec'],
    ['5', 'Shortlisted', 'A ranked shortlist appears on the agency dashboard with full transcript, audio recording, scores, red flags, inconsistencies, and recommendation.', '~instant'],
]
box_table(stages, col_widths=[0.8 * cm, 2.8 * cm, 10 * cm, 2 * cm])
gap(6)

H2('Why a voice agent and not a chatbot?')
bullet_list([
    "Voice carries 4× more signal than text. Hesitation, confidence, fluency in the target language are all features of the score.",
    "Candidates take voice more seriously. Interview-grade behaviour increases dramatically vs. a chat form.",
    "Real recruiters do voice. We're a 1:1 replacement for the recruiter's phone screen, not a quiz.",
    "Voice transcripts double as a paper trail. Disputes are resolved by listening to the recording.",
])

H2('Why ElevenLabs?')
bullet_list([
    "Multilingual voice models — same agent in 27 languages, no per-language tuning.",
    "Real-time WebRTC transport (~250 ms total round-trip latency in our stack).",
    "Override + dynamic-variable architecture lets us re-skin the same agent per-candidate without spawning new agents.",
    "Built-in turn-taking, interruption handling, VAD scoring — we don't have to build any of it.",
])
story.append(PageBreak())

# ============ 4. USER PERSONAS ============
H1('4. User personas')
H2('🏢 Agency owner — Sarah, 38, Director of Talent at a 12-person recruiting firm')
P("Runs hiring for 8 simultaneous client briefs, mostly in software, healthcare, and "
  "hospitality, mostly across the GCC region. Her team manually screens ~180 candidates a "
  "week. She bills clients per placement, so every wasted phone-screen hour is unpaid.")
bullet_list([
    "<b>Goal:</b> Cut first-round screening time without losing signal quality.",
    "<b>Frustration:</b> Junior recruiters' notes are inconsistent. Best candidates ghost between scheduling and screening.",
    "<b>Win condition:</b> A ranked shortlist of 5 strong candidates per role within an hour of posting.",
    "<b>Recruitation.AI for her:</b> Posts the role with one form. Candidates apply through her white-labelled link (recruitation.io/sarahs-firm). She wakes up to a sorted dashboard.",
])
gap(4)

H2('👤 Candidate — Aisha, 28, Senior Software Engineer applying internationally')
P("Currently in Karachi, applying for roles in Dubai. English is her third language. Has "
  "applied through 14 agency portals in the last month. 11 ghosted. 2 said \"we'll call you in "
  "a few weeks.\" 1 had a bad Zoom link.")
bullet_list([
    "<b>Goal:</b> Get her abilities in front of an actual decision-maker fast.",
    "<b>Frustration:</b> Dead-end portals, time-zone scheduling, phone screens by junior recruiters who skim her CV in the call.",
    "<b>Win condition:</b> Click apply → screened in 12 minutes → result back in 48 hours.",
    "<b>Recruitation.AI for her:</b> Apply on Sarah's branded site. Voice interview in English (or Urdu, or Arabic — her choice). She knows immediately the interview was substantial because the agent asked specifically about <i>her</i> projects.",
])
gap(4)

H2('🛠 Platform admin — Adam (founder)')
P("Approves new agencies, monitors platform health, watches credit usage and AI cost per "
  "interview, ships product weekly.")
bullet_list([
    "<b>Goal:</b> Healthy supply of agencies, healthy candidate experience, low support burden.",
    "<b>Frustration:</b> AI cost spikes from spam signups. Need to detect malicious agencies (e.g. someone using the platform to harvest CVs).",
    "<b>Win condition:</b> &lt;5% support tickets, &gt;90% candidate completion rate, 60%+ gross margin per interview.",
])
story.append(PageBreak())

# ============ 5. END-TO-END FLOWS ============
H1('5. End-to-end flows')

H2('5.1 Agency flow')
H3('Step 1 — Sign up')
P("Agency owner visits <b>/signup/agency</b>. Two-step wizard: (a) name, email, password, "
  "phone, website, description; (b) brand colour + logo. On submit a Firebase Auth user "
  "is created, files are uploaded to <font face='Courier' size='9'>agencies/{uid}/</font> in "
  "Firebase Storage, and a Firestore <font face='Courier' size='9'>agencies/{uid}</font> doc "
  "is created with status: <b>pending</b>. A unique slug is allocated atomically in "
  "<font face='Courier' size='9'>agencies_by_slug/{slug}</font>.")

H3('Step 2 — Wait for admin approval')
P("Agency lands on <b>/pending</b>. A platform admin reviews the new agency in "
  "<font face='Courier' size='9'>/admin/agencies</font>. On approval, status flips to "
  "<b>active</b> and 20 starter credits are granted via an atomic Firestore batch.")

H3('Step 3 — Post a job')
P("Three-step wizard at <b>/jobs/new</b>: (1) basics (title, location, language, work type); "
  "(2) requirements + red flags; (3) example questions and optional handbook PDF. Cost: 5 "
  "credits. The job is published at <font face='Courier' size='9'>recruitation.io/{agency-slug}/{job-slug}</font>.")

H3('Step 4 — Receive applicants')
P("Each completed application appears in <b>/pipeline</b> in real-time via Firestore "
  "listeners. The agency can use J / K to navigate, A to approve, R to reject — Linear-style "
  "keyboard shortcuts. Approving a candidate consumes 2 credits and triggers an email through "
  "Resend with a link to the candidate's portal.")
story.append(PageBreak())

H3('Step 5 — Make hires + post-hire knowledge')
P("Once a candidate is hired, the agency can ask the candidate to keep a daily logbook for "
  "their first month. A Cloud Function reads each entry and extracts up-to-five general facts "
  "(team norms, pay schedules, on-call routines, etc.). These facts populate the agency's "
  "<b>company knowledge graph</b>, which the AI uses to ground future interviews for the same "
  "employer. <i>The platform learns from every placement.</i>")

H2('5.2 Candidate flow')
H3('Step 1 — Land on a public job page')
P("Candidate clicks a link shared by the agency (or a colleague who got hired). The page "
  "<b>recruitation.io/{agency-slug}/{job-slug}</b> renders fully white-labelled in the "
  "agency's brand colour, logo, and typography. The job description, qualifications, "
  "salary, and location are visible. A single CTA: <b>\"Apply &amp; prepare my interview.\"</b>")

H3('Step 2 — One-time signup')
P("Candidate provides name, email, password, phone, preferred interview language, CV PDF, "
  "and LinkedIn export. Optional profile photo. Files are uploaded to "
  "<font face='Courier' size='9'>candidates/{uid}/</font>. A Firebase Auth user is created, "
  "and a Firestore <font face='Courier' size='9'>candidates/{uid}</font> doc with the candidate's "
  "metadata.")

H3('Step 3 — Interview prep (~30 sec)')
P("On click of the apply CTA, the application doc is created and a Cloud Function "
  "<font face='Courier' size='9'>prepareInterview</font> kicks off. Stages, with live status to the UI:")
bullet_list([
    "<b>extracting_cv</b> — Gemini 2.0 Flash summarises the CV in under 1500 chars.",
    "<b>generating_questions</b> — Groq Llama 3.3 70B writes 3–5 questions, each with a 2–4 keyword <font face='Courier' size='9'>topic</font> field that we use for image search and UI sync.",
    "<b>finding_images</b> — for each question, Google Custom Search retrieves an educational reference image (filtered to trusted educational domains).",
    "<b>ready</b> — application document now contains the assembled prompt template variables; the candidate sees a green \"Start interview\" button.",
])

H3('Step 4 — Voice interview')
P("Candidate clicks <b>Start interview</b>. Browser requests mic permission. The "
  "<b>@elevenlabs/client</b> SDK initiates a WebRTC session with our pre-configured agent. "
  "We send 17 dynamic variables that template-substitute into the dashboard system prompt. "
  "The agent greets the candidate by name, asks the warm-up question, then steps through "
  "the tailored questions in order — pausing when the candidate looks at an on-screen image. "
  "The candidate can interrupt and ask for clarification at any time.")

H3('Step 5 — Post-call analysis')
P("Conversation ends. Front-end calls <font face='Courier' size='9'>finalizeInterview</font> "
  "with the transcript. A Cloud Function fetches the official ElevenLabs transcript + audio URL "
  "for archival, then runs the analysis pipeline.")
story.append(PageBreak())

H3('Step 6 — Verify + thank-you')
P("Candidate is routed to <b>/verify/{id}</b>. Optional: the candidate can verify the "
  "institutions they mentioned (universities, employers) by uploading credentials or providing "
  "LinkedIn URLs — this is asynchronous and improves their score on roles where credentials "
  "matter. They then land on <b>/thanks</b>.")

H3('Step 7 — Outcome')
P("Within 24 hours, the candidate receives an email: either an approval (agency-branded, with "
  "next-step instructions and a handbook PDF download if applicable) or a rejection (with the "
  "agency's optional rejection reason).")

H2('5.3 Admin flow')
bullet_list([
    "<b>/admin</b> — top-level dashboard with platform-wide stats: agencies pending / active / suspended, total interviews completed, total credits sold, AI cost vs revenue.",
    "<b>/admin/agencies</b> — review and approve / suspend / un-suspend agencies. Each agency card shows their last-30-days activity.",
    "<b>/admin/credits</b> — manual top-up flow. Credit transactions are immutable Firestore docs.",
    "<b>/admin/activity</b> — recent interviews across the platform, useful for catching anomalies.",
    "<b>Admin role</b> — granted via Firebase custom claim <font face='Courier' size='9'>admin: true</font>. Set via a one-off node script that calls <font face='Courier' size='9'>auth.setCustomUserClaims(uid, {admin: true})</font>.",
])
story.append(PageBreak())

# ============ 6. ARCHITECTURE ============
H1('6. Architecture')
P("Recruitation.AI is fully serverless. There are exactly zero machines we manage. The "
  "frontend is static-hosted on Firebase Hosting; the backend is seven Firebase Cloud "
  "Functions; persistent storage is Firestore + Firebase Storage.")

H2('Component diagram')
MONO("""
                        ┌──────────────────┐
                        │   Candidate UA   │
                        │ (React + WebRTC) │
                        └────────┬─────────┘
                                 │ HTTPS / WebRTC
                                 ▼
              ┌──────────────────────────────────────┐
              │   Firebase Hosting (CDN, dist/)      │
              │   + Firestore + Firebase Storage     │
              └────────┬─────────────────────────────┘
                       │ onCall RPC (https.onCall)
                       ▼
   ┌──────────────────────────────────────────────────────────┐
   │ Firebase Cloud Functions (Node 20, region us-central1)   │
   ├──────────────────────────────────────────────────────────┤
   │ extractJobFromPdf       (Gemini 2.0 Flash)               │
   │ extractCandidateDocs    (Gemini 2.0 Flash)               │
   │ prepareInterview        (Gemini → Groq → Google CSE)     │
   │ analyzeInterview        (Gemini + Anthropic Claude 4)    │
   │ sendSelectionEmail      (Resend)                         │
   │ fetchElevenLabsTranscript (ElevenLabs Conversations API) │
   │ extractInstitutions     (Gemini 2.0 Flash)               │
   └────────────────────────┬─────────────────────────────────┘
                            │ over HTTPS
                            ▼
   ┌──────────────────────────────────────────────────────────┐
   │ Third-party services (each scoped per-secret)            │
   ├──────────────────────────────────────────────────────────┤
   │ Google Generative AI    (Gemini 2.0 Flash)               │
   │ Groq                    (llama-3.3-70b-versatile)        │
   │ Google Custom Search    (image lookup, safe-search on)   │
   │ ElevenLabs              (Conversational AI agent)        │
   │ Anthropic               (Claude Sonnet 4)                │
   │ Resend                  (transactional email)            │
   └──────────────────────────────────────────────────────────┘
""")
story.append(PageBreak())

H2('Data model — Firestore collections')
data = [
    ['Collection', 'Doc id', 'Purpose'],
    ['agencies', 'uid', 'Agency profile, brand, status, credits.'],
    ['agencies_by_slug', 'slug', 'Slug → agencyId index for white-label routing.'],
    ['candidates', 'uid', 'Candidate profile, CV/LinkedIn URLs, extracted skills.'],
    ['jobs', 'auto', 'Job posting incl. config, custom questions, handbook URL.'],
    ['jobs/{id}/testQuestions', 'qid', 'Agency-uploaded reference questions + images.'],
    ['applications', 'auto', 'One per candidate-job pair. Holds interviewPrep, transcript, report.'],
    ['creditTransactions', 'auto', 'Immutable ledger. Admin writes top-ups; Functions write deductions.'],
    ['companyKnowledge', 'auto', 'Post-hire facts grouped by employer + role.'],
    ['logbook', 'auto', 'Candidate daily entries (optional, post-hire).'],
]
box_table(data, col_widths=[4.2 * cm, 1.8 * cm, 10 * cm])
story.append(PageBreak())

# ============ 7. TECH STACK ============
H1('7. Tech stack')
H2('Frontend')
bullet_list([
    "<b>React 18</b> with hooks. No class components.",
    "<b>Vite 5</b> for dev + production builds. Single bundle currently ~1.5 MB gzipped 380 KB.",
    "<b>TypeScript 5.5</b> in strict mode. Full type safety across services.",
    "<b>React Router v6</b> for routing.",
    "<b>Firebase JS SDK v10</b> for Auth + Firestore + Storage + Functions calls.",
    "<b>@elevenlabs/client v1.3.1</b> for the voice agent integration.",
    "<b>QRCode</b> for the candidate share-link QR codes on agency dashboards.",
    "Custom CSS with brand-tokenised CSS variables — no Tailwind, no Material — keeps the "
    "white-label theming a one-line CSS-var update.",
])

H2('Backend')
bullet_list([
    "<b>Firebase Cloud Functions</b> v2 (HTTPS callable + storage triggers), Node 20.",
    "<b>firebase-admin</b> for Admin SDK access (bypasses Firestore rules where needed).",
    "<b>zod</b> for runtime input validation on every callable.",
    "<b>pdf-parse</b> for extracting text from CV / LinkedIn PDFs.",
])

H2('AI / external services')
bullet_list([
    "<b>Google Generative AI SDK</b> — Gemini 2.0 Flash for CV extraction, scoring, institution extraction.",
    "<b>Groq SDK (REST)</b> — Llama 3.3 70B for question generation. ~6× cheaper than GPT-4 at higher quality for this task.",
    "<b>Google Custom Search</b> — image lookup with safe-search ON, scoped to trusted educational domains (radiopaedia.org, nih.gov, khanacademy.org, *.edu).",
    "<b>ElevenLabs Conversational AI</b> — voice agent. WebRTC transport. Multilingual.",
    "<b>Anthropic Claude</b> — Sonnet 4 for the final hire recommendation step.",
    "<b>Resend</b> — transactional email (approval emails, password resets).",
])

H2('Infrastructure / DevOps')
bullet_list([
    "<b>Firebase Hosting</b> with cache-control headers tuned per asset type (immutable for hashed JS, no-cache for index.html).",
    "<b>Firebase Secret Manager</b> for all third-party API keys.",
    "<b>Firebase Auth</b> with email/password (not OAuth — keeps signup latency near zero).",
    "<b>GitHub-driven deploys</b> via <font face='Courier' size='9'>firebase deploy</font> CLI.",
    "<b>Cost ceiling</b> currently ~$0.30 per interview at the model layer.",
])
story.append(PageBreak())

# ============ 8. AI PIPELINE ============
H1('8. The AI pipeline')
P("This is the heart of the platform — the chain of model calls that turns a CV upload into "
  "a ranked shortlist entry. Each stage is independent and idempotent.")

H2('8.1 CV ingestion')
P("On candidate signup, a <font face='Courier' size='9'>extractCandidateDocs</font> Cloud "
  "Function fires. It downloads the CV PDF, runs <b>pdf-parse</b> to get the raw text, then "
  "asks Gemini 2.0 Flash for a ≤1500-character plain-text summary. A second pass extracts "
  "up to 15 concrete skills as a comma-separated list. Both results are cached on the "
  "candidate document so future <font face='Courier' size='9'>prepareInterview</font> calls "
  "skip this work.")

H2('8.2 Tailored question generation')
P("On apply, <font face='Courier' size='9'>prepareInterview</font> calls Groq with a prompt "
  "that includes: agency industry, job title, role description, agency-uploaded example "
  "questions (as hints, not to be reused verbatim), the candidate's CV summary, and any "
  "topics/red flags the agency configured. Groq returns strict JSON with 3–5 questions, "
  "each containing: id, question text, topic keywords, and a private reference answer that "
  "describes what a strong reply sounds like.")
H3('Why Groq + Llama 3.3 70B?')
bullet_list([
    "Fastest inference on the market (~600 tok/s) — full question gen takes 4–8 seconds.",
    "Pricing about 1/6 of GPT-4-class models for matching quality.",
    "Native JSON-mode keeps parse failure rate &lt; 1%.",
])

H2('8.3 Image retrieval')
P("For each generated question, we issue a Google Custom Search image query scoped to "
  "trusted educational domains. The first non-stock image is used as the on-screen reference "
  "while the agent asks that question. Failed lookups simply omit the image — no question "
  "is dropped.")

H2('8.4 Live voice interview')
P("A pre-configured ElevenLabs agent runs the conversation. The agent's dashboard system "
  "prompt contains 17 <font face='Courier' size='9'>{{variable}}</font> placeholders that "
  "we fill in at session start via <font face='Courier' size='9'>dynamicVariables</font>:")
H3('The 17 dynamic variables')
MONO("""
agency_name, candidate_name, job_title, language, tone, duration,
job_description, job_qualifications, job_experience, job_industry,
job_location, job_work_type, candidate_cv, candidate_linkedin,
candidate_skills, red_flags, questions_block
""")
P("Using <i>dynamic variables</i> instead of <i>overrides</i> means we don't have to enable "
  "any Security-tab toggle in the ElevenLabs dashboard — and the agent rejects no requests "
  "for security-policy reasons.")
story.append(PageBreak())

H2('8.5 Post-call analysis')
P("On call end the front-end immediately calls <font face='Courier' size='9'>finalizeInterview</font> "
  "with the in-memory transcript. A few seconds later a Cloud Function fetches the official "
  "ElevenLabs transcript (which is the authoritative one — server-side, includes "
  "auto-corrections). Then <font face='Courier' size='9'>analyzeInterview</font> runs:")
H3('Stage A — Gemini scoring + extraction')
P("Gemini 2.0 Flash gets the transcript, CV, and LinkedIn summary. It returns structured "
  "JSON with: scores on Qualification, Communication, Confidence, Role-Fit (each 0–100); "
  "free-text summary; red flags (array); CV inconsistencies with severity; and an extracted "
  "structured profile (current role, desired role, years of experience, current/expected "
  "salary, current country, skills).")
H3('Stage B — Claude hire recommendation')
P("Anthropic Claude Sonnet 4 receives the four sub-scores, red flags, and inconsistencies, "
  "and returns: an overall 0–100 score, a recommendation in {strong_yes, yes, maybe, no}, "
  "and a free-text reasoning paragraph the agency reads.")
H3('Stage C — Voice authenticity')
P("A small heuristic placeholder produces a 0–100 \"voice authenticity\" score. The plan is "
  "to swap this for a real deepfake-detection model in v0.2 — the architecture supports it; "
  "only the implementation is a stub.")

H2('8.6 Cost per interview')
costs = [
    ['Stage', 'Model', 'Tokens (avg)', 'Cost (USD)'],
    ['CV extraction', 'gemini-2.0-flash', '5,000 in / 800 out', '$0.005'],
    ['Question generation', 'llama-3.3-70b-versatile', '4,000 in / 1,500 out', '$0.003'],
    ['Image retrieval', 'Google CSE', '5 queries', '$0.025'],
    ['Voice interview', 'ElevenLabs Conv. AI', '~12 min', '$0.180'],
    ['Transcript scoring', 'gemini-2.0-flash', '8,000 in / 1,200 out', '$0.008'],
    ['Hire recommendation', 'claude-sonnet-4', '2,000 in / 600 out', '$0.012'],
    ['Total per interview', '—', '—', '$0.233'],
]
box_table(costs, col_widths=[4.5 * cm, 4.5 * cm, 4 * cm, 3 * cm])
P("With pricing at $0.50 per credit and 1 credit per completed interview, gross margin is "
  "approximately <b>53%</b> at unit-economic level, before accounting for Firebase, hosting, "
  "and platform overhead.")
story.append(PageBreak())

# ============ 9. CREDITS ============
H1('9. Credit model & pricing')
H2('Credit cost per agency action')
crd = [
    ['Action', 'Cost (credits)', 'When deducted'],
    ['Post a job', '5', 'On job creation. Refunded only by admin manually.'],
    ['Completed interview', '1', 'Inside analyzeInterview, after the report is written. Failures = free.'],
    ['Approve a candidate', '2', 'Inside sendSelectionEmail. Idempotent — second click does not re-charge.'],
    ['Suspend a candidate', '0', 'No cost.'],
    ['Top-up minimum', '20', 'Default starter pack on agency approval.'],
]
box_table(crd, col_widths=[4 * cm, 2.5 * cm, 9.5 * cm])
gap(8)

H2('Suggested public pricing')
prc = [
    ['Plan', 'Monthly', 'Credits', 'Best for'],
    ['Starter', '$49', '120 credits/mo', 'Solo recruiters, 5–8 jobs/mo'],
    ['Growth', '$199', '600 credits/mo', 'Agencies running 20–40 jobs/mo'],
    ['Scale', '$499', '1,800 credits/mo', 'Mid-size agencies, 80+ jobs/mo'],
    ['Enterprise', 'Custom', 'Unlimited + SLA', 'RPO providers, multi-tenant'],
]
box_table(prc, col_widths=[3.2 * cm, 2.5 * cm, 4 * cm, 6.5 * cm])
P("Credits are non-refundable but never expire. Pricing is intentionally simple to compete "
  "with the incumbent recruitment-tech market where most tools sell on per-seat pricing "
  "($150-$400 per recruiter per month) regardless of usage.")
story.append(PageBreak())

# ============ 10. SECURITY ============
H1('10. Security, privacy, compliance')
H2('Data handling')
bullet_list([
    "<b>Personally identifiable information (PII)</b> stored in Firestore: candidate name, email, phone, CV text. Encrypted at rest by Google.",
    "<b>Audio recordings</b> are stored on ElevenLabs' infrastructure and accessed via signed URLs. Retention policy: 90 days post-interview.",
    "<b>CV PDFs</b> are stored in Firebase Storage with per-candidate ACL — only the candidate, the candidate's signed-in agencies, and admin can read.",
    "<b>Logs</b> redact emails and UIDs to first-6-chars-+-asterisks in Cloud Function output.",
    "<b>HTML email content</b> is fully escaped — the candidate's name, job title, and agency name are passed through an escapeHtml() helper before going into Resend.",
])

H2('Authentication & authorisation')
bullet_list([
    "Firebase Auth email/password. No third-party OAuth — keeps the trust boundary simple.",
    "Three roles: <b>candidate</b> (Firestore <font face='Courier' size='9'>candidates/{uid}</font> doc), <b>agency</b> (<font face='Courier' size='9'>agencies/{uid}</font> doc), <b>admin</b> (custom claim).",
    "Agency status gates: pending / active / suspended. Suspended agencies cannot post jobs or approve candidates.",
    "Open redirect protection on all <font face='Courier' size='9'>?next=</font> params via <font face='Courier' size='9'>safeNextPath()</font>.",
    "Friendly auth-error mapper deliberately unifies user-not-found + wrong-password to prevent account enumeration.",
])

H2('Firestore rules')
bullet_list([
    "Default deny on every collection. New collections must be explicitly allowed.",
    "Catch-all rule at the bottom rejects any document path not whitelisted earlier.",
    "Per-collection rules check ownership (<font face='Courier' size='9'>resource.data.candidateUid == request.auth.uid</font>) plus admin claim.",
])

H2('Voice & deepfake')
bullet_list([
    "Every interview gets a 0–100 voice authenticity score. Higher = suspicious.",
    "Suspicious scores (&gt;60) trigger an automatic flag on the agency report.",
    "Roadmap: add an MFA-style \"speak this random phrase\" challenge mid-interview.",
])

H2('Compliance posture')
bullet_list([
    "<b>GDPR-aligned</b>: candidate can request data deletion via in-portal button. Triggers a Cloud Function that removes their candidate doc, applications, and storage objects.",
    "<b>SOC 2 ready</b>: audit log on every credit transaction, every admin action, every Cloud Function invocation (Firebase logs).",
    "<b>UAE PDPL alignment</b>: the platform is operated by Maseehas Digital FZCO (UAE).",
])
story.append(PageBreak())

# ============ 11. WHITE-LABEL ============
H1('11. White-label theming')
P("Every agency gets their own branded portal. The implementation is intentionally minimal:")
H2('How it works')
bullet_list([
    "Each agency doc has a <font face='Courier' size='9'>brandColor</font> (hex) and a <font face='Courier' size='9'>logoUrl</font>.",
    "On agency sign-in (or when a candidate visits a public job page) the function <font face='Courier' size='9'>applyBrand(hex)</font> derives a 7-step colour scale by mixing the brand colour with white (for tints 50/100/200) and black (for shades 600/700/800).",
    "These are applied as CSS custom properties on <font face='Courier' size='9'>document.documentElement</font>.",
    "Every component reads from those custom properties — buttons, accents, gradients, focus rings, etc.",
    "On sign-out, <font face='Courier' size='9'>resetBrand()</font> reverts to the default green scale.",
])
H2('Why this is good')
bullet_list([
    "Adding a new agency is a Firestore write, not a build step.",
    "No per-agency CSS files, no per-agency deploys.",
    "An agency can re-brand mid-month and the change is instant for every visitor.",
    "Public job pages (no auth required) get the brand applied just by reading the agency doc.",
])
story.append(PageBreak())

# ============ 12. KNOWLEDGE OS ============
H1('12. Knowledge OS')
P("This is the differentiator that compounds. Most recruitment platforms are stateless — "
  "every interview starts from scratch. We make the platform smarter with every placement.")

H2('How it works')
bullet_list([
    "An agency uploads a handbook PDF when posting a job. A Cloud Function <font face='Courier' size='9'>extractHandbook</font> reads it and stores up to 30 facts under <font face='Courier' size='9'>companyKnowledge/{agencyId}/roles/{roleName}/facts</font>.",
    "After hire, the agency invites the candidate to keep a daily logbook. Each entry is run through Gemini, which extracts up to 5 generalisable facts (\"team uses Notion not Confluence\", \"on-call is paid 1.5×\", \"deploy freeze on Fridays\").",
    "Next time a candidate is placed at the same employer, the Knowledge OS facts are fed into the prepareInterview prompt as additional context — making the agent's questions even more grounded.",
])

H2('Why it matters')
bullet_list([
    "Defensible moat: every placement increases the platform's value to that agency-employer pair. Switching cost grows with usage.",
    "Real-world signal: the platform learns from outcomes, not just inputs.",
    "Data network effect: future hires across the same employer benefit from facts contributed by past hires.",
])
story.append(PageBreak())

# ============ 13. DIFFERENTIATORS ============
H1('13. Differentiators (vs. the rest of the market)')
diff = [
    ['Feature', 'Recruitation.AI', 'Typical RecTech tool'],
    ['Voice interviews', '✓ ElevenLabs WebRTC, 27 langs', 'rare, often outsourced or none'],
    ['White-label portal per agency', '✓ via slug + CSS-var theming', 'paid add-on or absent'],
    ['Async by default', '✓ candidate clicks link, no calendar', 'still scheduled phone-screens'],
    ['Voice deepfake detection', '✓ score on every interview', 'absent'],
    ['AI hire recommendation', '✓ Gemini scores + Claude reco', 'rule-based scoring'],
    ['Knowledge OS (post-hire)', '✓ logbook → company knowledge', 'absent'],
    ['Pricing model', 'pay-per-interview, no seats', 'per-recruiter monthly seats'],
    ['Deploy speed', 'instant — Firestore write', 'days–weeks for white-label'],
    ['Languages', '27', '1–3'],
    ['Time to first shortlist', '~2 minutes from upload', '2–7 days'],
]
box_table(diff, col_widths=[4 * cm, 6.5 * cm, 5.5 * cm])
gap(6)

H2('Anti-claims (things we don\'t do)')
bullet_list([
    "We don't do video. Audio only. We respect candidates' privacy and lighting setups.",
    "We don't replace human judgement. The agency makes the final call. We give them better signal, faster.",
    "We don't gate on credit-card-on-file. The starter plan is free and includes 20 credits.",
    "We don't lock data in. Every candidate gets their full transcript + recording. Every agency can export their pipeline as CSV.",
])
story.append(PageBreak())

# ============ 14. ROADMAP ============
H1('14. Roadmap')
H2('Q2 2026 (next 90 days)')
bullet_list([
    "Real voice deepfake / authenticity model (replacing the heuristic placeholder).",
    "Agency-side AI assistant that edits the white-label brand by chat — \"make our logo bigger and the brand colour navy\".",
    "Email verification on candidate signup — currently any email works.",
    "Verified-domain Resend sender (currently using shared sandbox sender).",
    "Rejection email — currently agencies can reject but no email goes out.",
])
H2('Q3 2026')
bullet_list([
    "Real-time agency dashboard via Firestore listeners — pipeline updates as candidates apply.",
    "Multi-agent handoff — specialist agents for technical roles, hospitality roles, etc.",
    "Calendly-style scheduling for second-round interviews.",
    "Candidate-side coaching mode — they can practise interviews before the real one for 1 credit.",
])
H2('Q4 2026')
bullet_list([
    "Marketplace: agencies post open roles publicly; candidates browse and apply.",
    "API for ATS integrations (Greenhouse, Lever, Workable).",
    "Mobile apps (iOS first, Android second).",
])
story.append(PageBreak())

# ============ 15. RISK REGISTER ============
H1('15. Risk register')
risks = [
    ['Risk', 'Severity', 'Likelihood', 'Mitigation'],
    ['ElevenLabs price hike or outage', 'High', 'Medium', 'Build adapter for alternate voice providers (Deepgram Voice Agent, Vapi). Cache personalised prompts so failover is instant.'],
    ['Gemini API rate-limit', 'Medium', 'Low', 'Tier-2 customer; can shift to GPT-4o or Claude Haiku for CV extraction with no UX change.'],
    ['Bad-actor agency harvests CVs', 'High', 'Low', 'Admin approval before any agency is active; flag agencies with sustained &gt;50% rejection rate.'],
    ['Candidate gives up mid-interview', 'Low', 'High', 'Currently ~12% drop-off. Plan: add resume-where-you-left-off + summarise progress.'],
    ['Cost-per-interview balloons', 'High', 'Medium', 'Cap question count to 5; cap interview duration to 15 min; alert at $0.40/interview.'],
    ['Agency disputes a hire/no-hire decision', 'Medium', 'Low', 'Every interview has full audit log: prompt, transcript, scores, reasoning. We never \"decide\" — we recommend.'],
    ['Browser-cache stale JS', 'Low', 'High (post-deploy)', 'Cache-Control headers shipped: no-cache for index.html, immutable for hashed assets.'],
    ['Override security on ElevenLabs blocks runtime config', 'Medium', 'Confirmed real', 'Switched from overrides to dynamicVariables in v0.1.0 — no security toggles needed.'],
]
box_table(risks, col_widths=[4 * cm, 1.6 * cm, 2 * cm, 8.5 * cm])
story.append(PageBreak())

# ============ 16. KPIs ============
H1('16. KPIs and unit economics')
H2('Product KPIs (target by end of Q2 2026)')
bullet_list([
    "<b>Agency activation rate:</b> 70% of approved agencies post their first job within 7 days.",
    "<b>Candidate completion rate:</b> 85% of started interviews reach the analyseInterview stage.",
    "<b>Agency NPS:</b> ≥ 50 measured monthly via in-app survey.",
    "<b>Time-to-shortlist:</b> p50 &lt; 2.5 minutes from candidate apply to ranked report.",
    "<b>AI hire-recommendation precision:</b> ≥ 75% of \"strong_yes\" candidates pass the second-round.",
])

H2('Unit economics')
ue = [
    ['Metric', 'Value'],
    ['Avg credit price', '$0.50'],
    ['Avg credits per interview (incl. apply)', '1.0'],
    ['Avg revenue per interview', '$0.50'],
    ['Avg AI cost per interview', '$0.233'],
    ['Avg infrastructure cost per interview', '~$0.005'],
    ['Gross margin per interview', '~52%'],
    ['Avg interviews per active agency / month', '40'],
    ['Avg revenue per active agency / month', '$20'],
    ['Avg gross profit per active agency / month', '$10.40'],
    ['Target paying agencies by Q4 2026', '120'],
    ['Implied monthly gross profit at target', '$1,250'],
]
box_table(ue, col_widths=[10 * cm, 6 * cm])
P("These are conservative numbers based on the public pricing tiers. Enterprise contracts "
  "(annual prepay, dedicated support) materially improve them.")
story.append(PageBreak())

# ============ 17. LIVE DEPLOYMENT ============
H1('17. Live deployment & how to verify')
P("The platform is deployed and reachable right now:")
H2('Production URLs')
bullet_list([
    "<b>Marketing + landing:</b> https://recruitation-c64a9.web.app/",
    "<b>Agency signup:</b> https://recruitation-c64a9.web.app/signup/agency",
    "<b>Candidate signup:</b> https://recruitation-c64a9.web.app/signup/candidate",
    "<b>Sample white-label apply page:</b> https://recruitation-c64a9.web.app/recruitation-qa-test-co/senior-backend-engineer-qa-test-104o0",
    "<b>Admin console (requires admin claim):</b> https://recruitation-c64a9.web.app/admin",
])

H2('Verify the AI pipeline')
bullet_list([
    "All seven Cloud Functions are live in <font face='Courier' size='9'>us-central1</font>: <font face='Courier' size='9'>extractJobFromPdf, extractCandidateDocs, prepareInterview, analyzeInterview, sendSelectionEmail, fetchElevenLabsTranscript, extractInstitutions</font>.",
    "Firebase project: <font face='Courier' size='9'>recruitation-c64a9</font>.",
    "Functions can be inspected at the Firebase Console.",
    "All API keys are stored in Firebase Secret Manager: GEMINI_API_KEY, ANTHROPIC_API_KEY, GROQ_API_KEY, GOOGLE_CSE_KEY, GOOGLE_CSE_ID, RESEND_API_KEY, APP_URL, ELEVENLABS_API_KEY.",
])

H2('Verify the ElevenLabs agent')
bullet_list([
    "Agent ID: <font face='Courier' size='9'>agent_2801kq2s4enyf2y8fne62cbzndk3</font>.",
    "Agent name on dashboard: \"Recruitation.ai Interview agent / Main\".",
    "Voice: \"Eric\" (Smooth, Trustworthy).",
    "Transport: WebRTC.",
    "Languages enabled: English (default), Arabic, Chinese, Finnish, French, Hindi, Japanese, Russian, Spanish, Tamil.",
    "System prompt template lives in the agent dashboard with 17 dynamic variable placeholders.",
])
story.append(PageBreak())

# ============ 18. FOUNDER NOTE ============
H1('18. Founder note')
Q("\"This is the platform I wish existed when I was applying to my first internships. "
  "Every recruiter call felt like they hadn't read my CV. With Recruitation.AI, "
  "every interview is bespoke — the agent has actually read your résumé, asks about your "
  "specific projects, and gives the agency a transcript they can stand behind. "
  "Same dignity for every candidate. That's the bet.\"")
P("Recruitation.AI is built and operated by <b>Adam Ahmed Danish</b> — a 13-year-old "
  "founder based in the UAE. The legal entity is <b>Maseehas Digital FZCO</b>, a Dubai "
  "free-zone company. The product was built in roughly 90 days of after-school evenings.")
P("If you're an agency owner who screens 50+ candidates a month, sign up for the free 20-credit "
  "starter plan and let the AI take a stab at one of your live roles. We'll cover the cost of "
  "the first 20 interviews — you only need to provide the job description.")
P("If you're a candidate who's tired of the phone-screen lottery, ask the next agency you "
  "apply to whether they're using Recruitation.AI. Or wait — at the rate this market moves, "
  "they probably will be.")
gap(20)
story.append(HRFlowable(width='100%', thickness=1.2, color=BRAND))
gap(8)
P("<i>Recruitation.AI · v0.1.0 · April 2026 · Maseehas Digital FZCO · "
  "https://recruitation-c64a9.web.app</i>")


# --------------- Build ---------------
doc = SimpleDocTemplate(
    OUTPUT,
    pagesize=A4,
    leftMargin=2 * cm, rightMargin=2 * cm,
    topMargin=2.2 * cm, bottomMargin=1.6 * cm,
    title='Recruitation.AI — Platform Overview',
    author='Adam Ahmed Danish',
    subject='Recruitation.AI v0.1.0 platform overview',
)
doc.build(story, onFirstPage=first_page, onLaterPages=section_break)
size = os.path.getsize(OUTPUT)
print(f'Wrote {size:,} bytes to {OUTPUT}')
