import { initials, cx } from '@/lib/util';

export function Avatar({ name, photoUrl, size = 'md', className }: {
  name?: string; photoUrl?: string; size?: 'sm' | 'md' | 'lg'; className?: string;
}) {
  const style = photoUrl ? { backgroundImage: `url(${photoUrl})` } : undefined;
  return (
    <span
      className={cx('avatar', size === 'sm' && 'avatar-sm', size === 'lg' && 'avatar-lg', className)}
      style={style}
      aria-label={name}
    >
      {photoUrl ? '' : initials(name ?? '?')}
    </span>
  );
}
