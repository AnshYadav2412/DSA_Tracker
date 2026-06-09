import { Search, X } from 'lucide-react';
import clsx from 'clsx';

export default function FilterBar({
  search,
  onSearchChange,
  difficulty,
  onDifficultyChange,
  status,
  onStatusChange,
  topic,
  onTopicChange,
  topics = [],
  showTopicFilter = true,
  className = '',
}) {
  const hasActiveFilters = search || difficulty || status || topic;

  const clearFilters = () => {
    onSearchChange?.('');
    onDifficultyChange?.('');
    onStatusChange?.('');
    onTopicChange?.('');
  };

  return (
    <div className={clsx('space-y-3', className)}>
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search problems..."
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }}
        />
        {search && (
          <button
            onClick={() => onSearchChange?.('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-opacity-10"
            style={{ color: 'var(--text-muted)' }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Difficulty */}
        <select
          value={difficulty}
          onChange={(e) => onDifficultyChange?.(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => onStatusChange?.(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="remaining">Remaining</option>
        </select>

        {/* Topic */}
        {showTopicFilter && topics.length > 0 && (
          <select
            value={topic}
            onChange={(e) => onTopicChange?.(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="">All Topics</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        )}

        {/* Clear button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
