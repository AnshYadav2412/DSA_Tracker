import clsx from 'clsx';

const DIFFICULTY_STYLES = {
  Easy: { bg: '#10b98118', border: '#10b98140', text: '#10b981' },
  Medium: { bg: '#f59e0b18', border: '#f59e0b40', text: '#f59e0b' },
  Hard: { bg: '#ef444418', border: '#ef444440', text: '#ef4444' },
};

export default function DifficultyBadge({ difficulty, className = '' }) {
  const style = DIFFICULTY_STYLES[difficulty] || { bg: '#64748b18', border: '#64748b40', text: '#64748b' };

  return (
    <span
      className={clsx('inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium', className)}
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        color: style.text,
      }}
    >
      {difficulty || '—'}
    </span>
  );
}
