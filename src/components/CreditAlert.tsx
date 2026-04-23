// Low-credit warning banner — shown in AppShell when credits < 15
import { Link } from 'react-router-dom';

interface Props {
  credits: number;
}

const LOW_THRESHOLD = 15;

export function CreditAlert({ credits }: Props) {
  if (credits >= LOW_THRESHOLD) return null;

  const isCritical = credits < 5;

  return (
    <div
      style={{
        padding: '8px 16px',
        background: isCritical ? 'var(--danger-bg, #fef2f2)' : '#fffbeb',
        borderBottom: `1px solid ${isCritical ? '#fca5a5' : '#fde68a'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        fontSize: 13,
      }}
    >
      <span>
        {isCritical ? '🔴' : '⚠️'}{' '}
        <strong>{credits} credit{credits !== 1 ? 's' : ''} remaining.</strong>{' '}
        {isCritical
          ? 'You won\'t be able to run more interviews without a top-up.'
          : 'Running low — top up to keep interviews flowing.'}
      </span>
      <Link
        to="/credits"
        className="btn btn-sm btn-primary"
        style={{ flexShrink: 0 }}
      >
        Top up →
      </Link>
    </div>
  );
}
