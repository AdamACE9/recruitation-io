import { cx } from '@/lib/util';

/** Recruitation.AI default mark. Replaced by agency logo on white-label pages. */
export function Logo({ className, size = 28, label = 'Recruitation.AI' }: { className?: string; size?: number; label?: string }) {
  return (
    <span className={cx('row-flex', className)} style={{ gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--brand)" />
            <stop offset="1" stopColor="var(--brand-800)" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="8" fill="url(#lg)" />
        <path
          d="M10 22V10h6.4c2.8 0 4.6 1.6 4.6 4.1 0 1.8-1 3.2-2.6 3.7L22 22h-3l-2.8-3.9H13V22h-3zm3-6.2h3.2c1.3 0 2.2-.7 2.2-1.9s-.9-1.9-2.2-1.9H13v3.8z"
          fill="#fff"
        />
      </svg>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>
        {label}
      </span>
    </span>
  );
}
