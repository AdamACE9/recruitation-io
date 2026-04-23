import type { ReactNode } from 'react';
import { cx } from '@/lib/util';

type Kind = 'success' | 'info' | 'warn' | 'danger' | 'neutral';

export function Badge({ kind = 'neutral', children, className }: { kind?: Kind; children: ReactNode; className?: string }) {
  return <span className={cx('badge', `badge-${kind}`, className)}>{children}</span>;
}
