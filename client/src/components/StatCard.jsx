import { ExternalLink } from 'lucide-react';
import clsx from 'clsx';

export default function StatCard({ platform, icon, color, stats, url }) {
  const { totalSolved = 0, easySolved = 0, mediumSolved = 0, hardSolved = 0, streak = 0, ranking = 0, lastUpdated } = stats || {};

  return (
    <div
      className="rounded-2xl p-5 space-y-4 hover:scale-[1.02] transition-transform duration-200"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: `${color}18` }}
          >
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
              {platform}
            </h3>
            {lastUpdated && (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {new Date(lastUpdated).toLocaleString()}
              </p>
            )}
          </div>
        </div>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <ExternalLink size={16} />
          </a>
        )}
      </div>

      {/* Total Solved */}
      <div>
        <p className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {totalSolved}
        </p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Solved</p>
      </div>

      {/* Difficulty Breakdown */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-xl font-bold" style={{ color: 'var(--easy)' }}>{easySolved}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Easy</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold" style={{ color: 'var(--medium)' }}>{mediumSolved}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Medium</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold" style={{ color: 'var(--hard)' }}>{hardSolved}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Hard</p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        {streak > 0 && (
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              🔥 {streak} day{streak !== 1 ? 's' : ''}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Streak</p>
          </div>
        )}
        {ranking > 0 && (
          <div className="text-right">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              #{ranking.toLocaleString()}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Ranking</p>
          </div>
        )}
      </div>
    </div>
  );
}
