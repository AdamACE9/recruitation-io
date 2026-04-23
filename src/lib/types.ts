// ============================================================
// Recruitation.AI — shared domain types
// ============================================================

export type UserRole = 'agency' | 'candidate' | 'admin';

export type AgencyStatus = 'pending' | 'active' | 'suspended';

export interface Agency {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  brandColor: string;          // hex, e.g. "#1a7a3c"
  credits: number;
  status: AgencyStatus;
  ownerUid: string;
  createdAt: number;
  approvedAt?: number;
  /** Optional AI calibration profile — learned from past approvals/rejections */
  calibration?: {
    strongYesThreshold: number;
    weights: { qualification: number; communication: number; roleFit: number; confidence: number };
    updatedAt: number;
  };
  /** Set to true after the agency completes the first-time onboarding wizard */
  onboardingComplete?: boolean;
}

export type JobStatus = 'draft' | 'active' | 'paused' | 'closed';
export type JobMethod = 'form' | 'pdf';

/**
 * Example technical question the agency uploads at job creation.
 * These are HINTS / templates — the actual questions asked in the
 * interview are generated per candidate by `prepareInterview`.
 */
export interface TestQuestion {
  id: string;
  question: string;
  /** Optional — agency can leave blank; Groq-generated answer will be produced per candidate */
  correctAnswer: string;
  /** Optional — if set, this exact image is reused for the matching candidate question
   *  and the Google Custom Search step is skipped. */
  imageUrl?: string | null;
  weight: number;
}

/**
 * Per-candidate tailored question generated in the interview-prep pipeline.
 * Stored under applications/{id}.interviewPrep.questions[].
 */
export interface TailoredQuestion {
  id: string;
  question: string;
  /** Where the image came from, for audit & debugging. */
  imageSource: 'agency-upload' | 'google-cse' | 'none';
  imageUrl?: string;
  /** Optional query used for image retrieval, for audit */
  imageQuery?: string;
  /** Reference answer produced by Groq, stored server-side only (not exposed to the candidate UI) */
  referenceAnswer?: string;
}

export type InterviewPrepStatus = 'pending' | 'extracting_cv' | 'generating_questions' | 'finding_images' | 'ready' | 'failed';

export interface InterviewPrep {
  status: InterviewPrepStatus;
  questions: TailoredQuestion[];
  /** Assembled ElevenLabs system prompt including questions + images */
  elevenLabsPrompt?: string;
  error?: string;
  updatedAt: number;
}

export interface JobConfig {
  description: string;
  qualifications: string;
  experience: string;
  salary: string;
  location: string;
  workType: 'onsite' | 'remote' | 'hybrid';
  industry: string;
  tone: 'professional' | 'warm' | 'rigorous' | 'casual';
  language: string;          // ISO 639-1 or human name
  duration: number;          // minutes
  customQuestions: string[]; // free text
  redFlags: string[];        // free text (things to probe)
  topics: string[];
  /** Optional custom scoring axes — replace/augment the default 4. Weights should sum to 100. */
  rubric?: RubricAxis[];
}

export interface RubricAxis {
  id: string;
  label: string;
  description?: string;
  weight: number; // 0-100
}

export interface Job {
  id: string;
  agencyId: string;
  title: string;
  slug: string;
  status: JobStatus;
  method: JobMethod;
  jobConfig: JobConfig;
  createdAt: number;
  applicantCount: number;
  interviewCount: number;
  lastActivityAt?: number;
  /** Short public share code, e.g. "k7F2aB" — resolves to /:agencySlug/:jobSlug */
  shortCode?: string;
  /** Optional handbook PDF — shown to approved candidates, also fed into interview prep for context */
  handbookUrl?: string;
  handbookFileName?: string;
}

export interface Candidate {
  uid: string;
  name: string;
  email: string;
  phone: string;
  cvUrl?: string;
  linkedinUrl?: string;
  photoUrl?: string;
  cvText?: string;
  linkedinText?: string;
  skills: string[];
  preferredLanguage: string;
  createdAt: number;
}

export type ApplicationStatus =
  | 'draft'
  | 'applied'
  | 'interview_scheduled'
  | 'interview_live'
  | 'interview_complete'
  | 'under_review'
  | 'approved'
  | 'rejected';

export type Recommendation = 'strong_yes' | 'yes' | 'maybe' | 'no';

export interface TestResult {
  qId: string;
  question: string;
  correctAnswer: string;
  candidateAnswer: string;
  correct: boolean;
}

export interface Inconsistency {
  claim: string;
  source: 'linkedin' | 'cv';
  spoken: string;
  severity: 'low' | 'medium' | 'high';
}

export interface InstitutionVerification {
  name: string;
  verified: boolean;
  url?: string;
  note?: string;
}

export interface SentimentSample {
  /** seconds into the interview */
  t: number;
  /** 0-100 */
  energy: number;
  confidence: number;
  stress: number;
}

export interface JourneyEvent {
  /** seconds into the interview */
  t: number;
  kind: 'agent' | 'candidate' | 'flag' | 'test' | 'milestone';
  label: string;
  detail?: string;
}

export interface RubricScore {
  axisId: string;
  label: string;
  score: number;
}

export interface AnalysisReport {
  overallScore: number;
  recommendation: Recommendation;
  scores: { qualification: number; communication: number; confidence: number; roleFit: number };
  /** Per-axis scores when a custom rubric was defined on the job */
  rubricScores?: RubricScore[];
  summary: string;
  redFlags: string[];
  inconsistencies: Inconsistency[];
  institutionVerifications: InstitutionVerification[];
  testResults: TestResult[];
  /** Our proprietary Signal Score™ — live confidence during the interview */
  signalScore?: number;
  /** Voice-clone / deepfake suspicion score 0-100 (higher = more suspicious) */
  voiceAuthenticity?: number;
  /** Time-series of inferred vocal sentiment, sampled every ~15s */
  sentimentTimeline?: SentimentSample[];
  /** Ordered event log for journey replay */
  journeyEvents?: JourneyEvent[];
  /** Extracted skills detected during interview — for heatmap & silver-medalist matching */
  skills?: { name: string; depth: number }[];
  generatedAt: number;
}

export interface Application {
  id: string;
  agencyId: string;
  jobId: string;
  jobTitle: string;
  candidateUid: string;
  candidateName: string;
  candidateEmail?: string;
  candidatePhone?: string;
  candidatePhotoUrl?: string;
  status: ApplicationStatus;
  createdAt: number;
  completedAt?: number;
  transcriptOriginal?: string;
  transcriptEnglish?: string;
  audioUrl?: string;
  report?: AnalysisReport;
  interviewLanguage?: string;
  /** Personalised rejection feedback drafted+sent by the agency */
  rejectionMessage?: string;
  /** Interview prep pipeline state — lives on the Application (single doc is simpler) */
  interviewPrep?: InterviewPrep;
  approvedAt?: number;
}

export interface CreditTransaction {
  id: string;
  agencyId: string;
  amount: number;   // positive for topup, negative for spend
  type: 'topup' | 'job_create' | 'interview' | 'approval' | 'refund';
  note?: string;
  createdAt: number;
  actorUid?: string;
}

/** Credit costs (single source of truth — keep in sync with functions/src/index.ts) */
export const CREDIT_COSTS = {
  jobCreate: 10,
  interview: 5,
  approval: 2,
} as const;

// UI helpers
export const REC_LABEL: Record<Recommendation, string> = {
  strong_yes: 'Strong yes',
  yes: 'Yes',
  maybe: 'Maybe',
  no: 'No',
};
export const REC_BADGE: Record<Recommendation, 'success' | 'info' | 'warn' | 'danger'> = {
  strong_yes: 'success',
  yes: 'info',
  maybe: 'warn',
  no: 'danger',
};
