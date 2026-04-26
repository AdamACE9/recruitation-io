// ============================================================
// Tiny utilities — class names, formatters, slug, keyboard
// ============================================================

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

export function initials(name: string): string {
  return (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}

export function slugify(s: string): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 40);
}

export function formatRelative(ts: number): string {
  const now = Date.now();
  const diff = Math.max(0, now - ts);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

export function scoreClass(score: number | undefined | null): 'hi' | 'mi' | 'lo' {
  if (score == null) return 'lo';
  if (score >= 75) return 'hi';
  if (score >= 55) return 'mi';
  return 'lo';
}

export function randomId(len = 16): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, len);
}

export function isValidHexColor(v: string): boolean {
  return /^#([0-9a-fA-F]{3}){1,2}$/.test(v);
}

/**
 * Validate a `?next=` redirect target. Only allows internal paths (starting with `/`
 * but not `//`) so attackers can't craft `/login?next=https://evil.com` and bounce
 * users off-site after a successful login (open-redirect / phishing prep).
 */
export function safeNextPath(input: string | null | undefined, fallback: string = '/'): string {
  if (!input) return fallback;
  if (typeof input !== 'string') return fallback;
  // Must start with single forward slash and not be protocol-relative or javascript: URI
  if (!input.startsWith('/')) return fallback;
  if (input.startsWith('//')) return fallback;
  if (/^\s*javascript:/i.test(input)) return fallback;
  // Hard length cap to avoid pathological inputs.
  return input.slice(0, 500);
}

/**
 * Map a Firebase Auth error code to a candidate-friendly message.
 * Avoids leaking whether an account exists (security: don't distinguish
 * user-not-found from wrong-password).
 */
export function friendlyAuthError(err: unknown, fallback: string = 'Sign in failed'): string {
  const code = (err as { code?: string })?.code;
  switch (code) {
    case 'auth/invalid-email':       return 'That email address looks invalid.';
    case 'auth/user-disabled':       return 'This account has been disabled. Contact support.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':  return 'Invalid email or password.';
    case 'auth/email-already-in-use':return 'An account already exists with that email — sign in instead.';
    case 'auth/weak-password':       return 'Password too weak — must be at least 8 characters.';
    case 'auth/too-many-requests':   return 'Too many failed attempts. Please wait a few minutes.';
    case 'auth/network-request-failed': return 'Network error. Check your connection and retry.';
    case 'auth/operation-not-allowed':  return 'Email/password sign-in is not enabled.';
    case 'auth/popup-closed-by-user':   return 'Sign-in was cancelled.';
    default:
      return (err instanceof Error && err.message) ? err.message : fallback;
  }
}

/**
 * The exact set of languages enabled on our ElevenLabs agent (Security tab).
 * Sending any other language as an override causes the WS to close immediately
 * with a request error. Keep this in sync with the dashboard.
 *
 * Order: English first (default), then alphabetical.
 */
export const SUPPORTED_INTERVIEW_LANGUAGES = [
  'English',
  'Arabic',
  'Chinese',
  'Finnish',
  'French',
  'Hindi',
  'Japanese',
  'Russian',
  'Spanish',
  'Tamil',
] as const;
export type SupportedInterviewLanguage = (typeof SUPPORTED_INTERVIEW_LANGUAGES)[number];

export function readFileAsDataUrl(f: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(f);
  });
}
