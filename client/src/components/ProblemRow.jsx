import { useState } from 'react';
import { ExternalLink, Check, Zap } from 'lucide-react';
import DifficultyBadge from './DifficultyBadge';
import clsx from 'clsx';

export default function ProblemRow({ problem, onToggle, showNotes = false }) {
  const [isToggling, setIsToggling] = useState(false);
  const { id, title, titleSlug, difficulty, topic, category, url, completed, completionSource, notes } = problem;

  const handleToggle = async () => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      await onToggle(titleSlug);
    } finally {
      setIsToggling(false);
    }
  };

  const isAutoCompleted = completionSource === 'leetcode';

  return (
    <div
      className={clsx(
        'flex items-center gap-4 p-4 rounded-xl transition-all duration-150',
        completed && 'opacity-60'
      )}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        disabled={isToggling}
        className={clsx(
          'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all',
          completed ? 'bg-green-500 border-green-500' : 'border-gray-500 hover:border-green-400'
        )}
        style={{ opacity: isToggling ? 0.5 : 1 }}
      >
        {completed && <Check size={14} color="white" />}
      </button>

      {/* Number */}
      {id && (
        <span className="text-sm font-mono w-8 text-center shrink-0" style={{ color: 'var(--text-muted)' }}>
          {id}
        </span>
      )}

      {/* Title */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={clsx(
              'text-sm font-medium hover:underline',
              completed && 'line-through'
            )}
            style={{ color: 'var(--text-primary)' }}
          >
            {title}
          </a>
          {isAutoCompleted && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
              style={{ background: '#f59e0b18', color: '#f59e0b' }}
              title="Auto-completed from LeetCode sync"
            >
              <Zap size={10} />
              Auto
            </span>
          )}
        </div>
        {(topic || category) && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {topic || category}
          </p>
        )}
        {showNotes && notes && (
          <p className="text-xs mt-1 italic" style={{ color: 'var(--text-secondary)' }}>
            {notes}
          </p>
        )}
      </div>

      {/* Difficulty */}
      <DifficultyBadge difficulty={difficulty} />

      {/* Link */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg hover:bg-opacity-10 transition-colors shrink-0"
        style={{ color: 'var(--text-muted)' }}
      >
        <ExternalLink size={14} />
      </a>
    </div>
  );
}
