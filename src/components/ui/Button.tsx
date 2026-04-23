import type { ButtonHTMLAttributes } from 'react';
import { cx } from '@/lib/util';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  loading?: boolean;
}

export function Button({
  variant = 'primary', size = 'md', block, loading, className, children, disabled, ...rest
}: Props) {
  return (
    <button
      className={cx(
        'btn',
        variant === 'primary' && 'btn-primary',
        variant === 'secondary' && 'btn-secondary',
        variant === 'ghost' && 'btn-ghost',
        variant === 'danger' && 'btn-danger',
        size === 'sm' && 'btn-sm',
        size === 'lg' && 'btn-lg',
        block && 'btn-block',
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <span className="mono tiny">…</span> : null}
      {children}
    </button>
  );
}
