import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import useStatsStore from '../store/useStatsStore.js';
import { statsApi } from '../api/index.js';
import {
  ArrowLeft, ExternalLink, Search, Filter,
  CheckCircle2, Circle, Zap, StickyNote, ChevronDown,
  ChevronLeft, ChevronRight, Pencil, X,
} from 'lucide-react';
import clsx from 'clsx';

// ─── Platform badge ───────────────────────────────────────────────────────────
function PlatformBadge({ platform }) {
  const isLC = platform === 'leetcode';
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0"
      style={{
        background: isLC ? 'rgba(255,161,22,0.12)' : 'rgba(34,197,94,0.12)',
        color: isLC ? '#f5a623' : '#22c55e',
        border: `1px solid ${isLC ? 'rgba(245,166,35,0.3)' : 'rgba(34,197,94,0.3)'}`,
        letterSpacing: '0.03em',
      }}
    >
      {isLC ? 'LC' : 'GFG'}
    </span>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SHEET_LABELS = {
  'blind-75': 'Blind 75',
  'neetcode-150': 'NeetCode 150',
  'striver-az': 'Striver A-Z',
  'striver-sde': 'Striver SDE Sheet',
};

const DIFFICULTY_STYLES = {
  Easy:   { bg: '#10b98118', text: '#10b981', border: '#10b98140' },
  Medium: { bg: '#f59e0b18', text: '#f59e0b', border: '#f59e0b40' },
  Hard:   { bg: '#ef444418', text: '#ef4444', border: '#ef444440' },
};

const PAGE_SIZE = 50;

// ─── Skeleton Row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      <td className="py-3.5 px-4">
        <div className="w-6 h-6 rounded-full animate-pulse" style={{ background: 'var(--border-light)' }} />
      </td>
      <td className="py-3.5 px-4">
        <div className="w-8 h-4 rounded animate-pulse" style={{ background: 'var(--border-light)' }} />
      </td>
      <td className="py-3.5 px-4">
        <div className="h-4 rounded animate-pulse" style={{ background: 'var(--border-light)', width: '60%' }} />
      </td>
      <td className="py-3.5 px-4">
        <div className="w-16 h-5 rounded-full animate-pulse" style={{ background: 'var(--border-light)' }} />
      </td>
      <td className="py-3.5 px-4">
        <div className="w-20 h-5 rounded-full animate-pulse" style={{ background: 'var(--border-light)' }} />
      </td>
      <td className="py-3.5 px-4">
        <div className="w-16 h-5 rounded-full animate-pulse" style={{ background: 'var(--border-light)' }} />
      </td>
      <td className="py-3.5 px-4">
        <div className="w-6 h-6 rounded animate-pulse" style={{ background: 'var(--border-light)' }} />
      </td>
    </tr>
  );
}

// ─── Problem Row ──────────────────────────────────────────────────────────────

function ProblemRow({ problem, index, sheetName, onToggle, onNotesSaved }) {
  const [toggling, setToggling]     = useState(false);
  const [showNotes, setShowNotes]   = useState(false);
  const [notesVal, setNotesVal]     = useState(problem.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);

  const dc = DIFFICULTY_STYLES[problem.difficulty] ?? DIFFICULTY_STYLES.Medium;
  const slug = problem.titleSlug || problem.slug || '';

  const handleToggle = async () => {
    if (toggling) return;
    setToggling(true);
    try { await onToggle(sheetName, slug); }
    finally { setToggling(false); }
  };

  const saveNotes = async () => {
    if (savingNotes) return;
    setSavingNotes(true);
    try {
      await statsApi.updateSheetNotes(sheetName, slug, notesVal);
      onNotesSaved(slug, notesVal);
      setShowNotes(false);
    } catch { /* silent */ }
    finally { setSavingNotes(false); }
  };

  const handleNotesKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) saveNotes();
    if (e.key === 'Escape') setShowNotes(false);
  };

  return (
    <>
      <tr
        className="group transition-all duration-150"
        style={{
          borderBottom: showNotes ? 'none' : '1px solid var(--border)',
          opacity: problem.completed ? 0.72 : 1,
          background: problem.completed ? 'rgba(16,185,129,0.03)' : 'transparent',
        }}
        onMouseEnter={(e) => {
          if (!problem.completed) e.currentTarget.style.background = 'var(--bg-card-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = problem.completed ? 'rgba(16,185,129,0.03)' : 'transparent';
        }}
      >
        {/* Checkbox */}
        <td className="py-3.5 pl-4 pr-2 w-10">
          <button
            onClick={handleToggle}
            disabled={toggling}
            className="flex items-center justify-center transition-transform duration-150 hover:scale-110"
            style={{ opacity: toggling ? 0.5 : 1 }}
            title={problem.completed ? 'Mark incomplete' : 'Mark complete'}
          >
            {problem.completed
              ? <CheckCircle2 size={22} style={{ color: '#10b981' }} />
              : <Circle size={22} style={{ color: 'var(--text-muted)' }} />
            }
          </button>
        </td>

        {/* # */}
        <td className="py-3.5 px-2 w-12">
          <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            {index + 1}
          </span>
        </td>

        {/* Title */}
        <td className="py-3.5 px-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Platform badge */}
            {problem.platform && <PlatformBadge platform={problem.platform} />}

            {problem.url ? (
              <a
                href={problem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium hover:underline transition-colors duration-150 flex items-center gap-1.5"
                style={{
                  color: problem.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: problem.completed ? 'line-through' : 'none',
                  textDecorationColor: 'var(--text-muted)',
                }}
              >
                {problem.title}
                <ExternalLink size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              </a>
            ) : (
              <span
                className="text-sm font-medium"
                style={{
                  color: problem.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: problem.completed ? 'line-through' : 'none',
                  textDecorationColor: 'var(--text-muted)',
                }}
              >
                {problem.title}
              </span>
            )}

            {/* LC alternative link for GFG problems */}
            {problem.platform === 'gfg' && problem.lcAlt && (
              <a
                href={problem.lcAlt.url}
                target="_blank"
                rel="noopener noreferrer"
                title={`LC Alt: ${problem.lcAlt.title} (#${problem.lcAlt.num})`}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 hover:opacity-80 transition-opacity"
                style={{
                  background: 'rgba(255,161,22,0.1)',
                  color: '#f5a623',
                  border: '1px solid rgba(245,166,35,0.25)',
                }}
              >
                <ExternalLink size={9} />
                LC #{problem.lcAlt.num}
              </a>
            )}
          </div>
        </td>

        {/* Difficulty */}
        <td className="py-3.5 px-2 w-24">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{
              background: dc.bg,
              color: dc.text,
              border: `1px solid ${dc.border}`,
            }}
          >
            {problem.difficulty || '—'}
          </span>
        </td>

        {/* Topic */}
        <td className="py-3.5 px-2 w-36 hidden sm:table-cell">
          {problem.topic && (
            <span
              className="text-xs px-2.5 py-1 rounded-full truncate max-w-full inline-block"
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              {problem.topic}
            </span>
          )}
        </td>

        {/* Completion source badge */}
        <td className="py-3.5 px-2 w-28 hidden md:table-cell">
          {problem.completed && problem.completionSource === 'auto-sync' && (
            <span
              className="text-xs flex items-center gap-1 px-2 py-0.5 rounded-full w-fit"
              style={{ background: 'rgba(251,191,36,0.15)', color: 'var(--accent-yellow)', border: '1px solid rgba(251,191,36,0.3)' }}
            >
              <Zap size={10} /> Auto
            </span>
          )}
          {problem.completed && problem.completionSource === 'manual' && (
            <span
              className="text-xs flex items-center gap-1 px-2 py-0.5 rounded-full w-fit"
              style={{ background: 'rgba(59,130,246,0.15)', color: 'var(--accent-blue)', border: '1px solid rgba(59,130,246,0.3)' }}
            >
              ✓ Manual
            </span>
          )}
        </td>

        {/* Notes button */}
        <td className="py-3.5 pr-4 pl-2 w-10">
          <button
            onClick={() => setShowNotes((v) => !v)}
            className="p-1.5 rounded-lg transition-all duration-150 opacity-0 group-hover:opacity-100"
            style={{
              background: showNotes ? 'var(--bg-secondary)' : 'transparent',
              color: (notesVal || showNotes) ? '#f59e0b' : 'var(--text-muted)',
              opacity: (notesVal || showNotes) ? 1 : undefined,
            }}
            title={showNotes ? 'Close notes' : 'Edit notes'}
          >
            <Pencil size={14} />
          </button>
        </td>
      </tr>

      {/* Inline Notes editor */}
      {showNotes && (
        <tr style={{ borderBottom: '1px solid var(--border)' }}>
          <td colSpan={7} className="px-4 pb-3 pt-1">
            <div
              className="rounded-xl p-3 space-y-2"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StickyNote size={13} style={{ color: 'var(--accent-yellow)' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Notes for {problem.title}
                  </span>
                </div>
                <button onClick={() => setShowNotes(false)} style={{ color: 'var(--text-muted)' }}>
                  <X size={14} />
                </button>
              </div>
              <textarea
                autoFocus
                rows={3}
                value={notesVal}
                onChange={(e) => setNotesVal(e.target.value)}
                onKeyDown={handleNotesKeyDown}
                onBlur={saveNotes}
                placeholder="Key insights, approach, edge cases... (Ctrl+Enter to save)"
                className="w-full text-sm resize-y rounded-lg px-3 py-2 outline-none transition-colors"
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-primary)',
                  minHeight: '72px',
                }}
              />
              <div className="flex items-center gap-2 justify-end">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Ctrl+Enter to save · Esc to close
                </span>
                <button
                  onClick={saveNotes}
                  disabled={savingNotes}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium text-white transition-opacity"
                  style={{ background: 'var(--gradient-blue)', opacity: savingNotes ? 0.6 : 1 }}
                >
                  {savingNotes ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SheetDetail() {
  const { name } = useParams();
  const { currentSheet, isLoading, error, fetchSheet, toggleSheetProblem } = useStatsStore();

  // Local notes update without full refetch
  const [localProblems, setLocalProblems] = useState(null);

  // Filters
  const [search, setSearch]       = useState('');
  const [difficulty, setDiff]     = useState('All');
  const [status, setStatus]       = useState('All');
  const [topic, setTopic]         = useState('All');
  const [platform, setPlatform]   = useState('All');
  const [topicOpen, setTopicOpen] = useState(false);
  const [page, setPage]           = useState(1);

  useEffect(() => {
    fetchSheet(name);
    setSearch('');
    setDiff('All');
    setStatus('All');
    setTopic('All');
    setPlatform('All');
    setPage(1);
    setLocalProblems(null);
  }, [name]);

  // Sync local problems from store
  useEffect(() => {
    if (currentSheet?.problems) {
      setLocalProblems(currentSheet.problems);
    }
  }, [currentSheet]);

  const problems = useMemo(() => {
    const rawList = localProblems ?? currentSheet?.problems ?? [];
    return rawList.map((p) => ({
      ...p,
      topic: p.topic || p.category || 'General',
    }));
  }, [localProblems, currentSheet]);

  // Unique categories/topics
  const allTopics = useMemo(() => {
    const s = new Set(problems.map((p) => p.topic).filter(Boolean));
    return ['All', ...Array.from(s).sort()];
  }, [problems]);

  // Filtered problems
  const filtered = useMemo(() => {
    return problems.filter((p) => {
      if (search && !p.title?.toLowerCase().includes(search.toLowerCase())) return false;
      if (difficulty !== 'All' && p.difficulty !== difficulty) return false;
      if (status === 'Completed' && !p.completed) return false;
      if (status === 'Remaining' && p.completed) return false;
      if (topic !== 'All' && p.topic !== topic) return false;
      if (platform === 'LC' && p.platform !== 'leetcode') return false;
      if (platform === 'GFG' && p.platform !== 'gfg') return false;
      return true;
    });
  }, [problems, search, difficulty, status, topic, platform]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageItems  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, difficulty, status, topic, platform]);

  const sheetLabel = SHEET_LABELS[name] || name;
  const pct        = currentSheet?.percentage ?? 0;
  const total      = currentSheet?.total       ?? 0;
  const completed  = currentSheet?.completed   ?? 0;
  const remaining  = total - completed;

  const pctColor = pct >= 75 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#3b82f6';

  const handleNotesSaved = (slug, notes) => {
    setLocalProblems((prev) =>
      prev?.map((p) =>
        (p.titleSlug || p.slug) === slug ? { ...p, notes } : p
      )
    );
  };

  // ── Loading skeleton ──
  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl animate-pulse" style={{ background: 'var(--bg-card)' }} />
            <div className="h-7 w-48 rounded-lg animate-pulse" style={{ background: 'var(--bg-card)' }} />
          </div>
          <div className="h-2 rounded-full animate-pulse" style={{ background: 'var(--bg-card)' }} />
        </div>

        {/* Filter bar skeleton */}
        <div
          className="rounded-2xl p-4"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex gap-3">
            <div className="h-10 flex-1 rounded-xl animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
            <div className="h-10 w-24 rounded-xl animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
            <div className="h-10 w-24 rounded-xl animate-pulse" style={{ background: 'var(--bg-secondary)' }} />
          </div>
        </div>

        {/* Table skeleton */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <table className="w-full">
            <tbody>
              {[...Array(10)].map((_, i) => <SkeletonRow key={i} />)}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error && !currentSheet) {
    return (
      <div className="max-w-7xl mx-auto space-y-4">
        <Link to="/sheets" className="flex items-center gap-2 text-sm w-fit" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={16} /> Back to Sheets
        </Link>
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: 'var(--bg-card)', border: '1px solid #ef444440' }}
        >
          <p style={{ color: '#ef4444' }}>Failed to load sheet: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <Link
              to="/sheets"
              className="flex items-center gap-1.5 text-sm mb-3 w-fit transition-colors duration-150 hover:underline"
              style={{ color: 'var(--text-muted)' }}
            >
              <ArrowLeft size={15} /> Back to Sheets
            </Link>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {sheetLabel}
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Track your progress through every problem
            </p>
          </div>

          {/* Stat pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: 'Total', value: total, color: 'var(--text-secondary)', bg: 'var(--bg-secondary)' },
              { label: 'Completed', value: completed, color: '#10b981', bg: '#10b98118' },
              { label: 'Remaining', value: remaining, color: '#f59e0b', bg: '#f59e0b18' },
            ].map(({ label, value, color, bg }) => (
              <div
                key={label}
                className="flex flex-col items-center px-4 py-2 rounded-xl"
                style={{ background: bg, border: '1px solid var(--border)' }}
              >
                <span className="text-lg font-bold leading-tight" style={{ color }}>{value}</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="rounded-2xl p-4 space-y-2"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Overall Progress</span>
            <span className="text-sm font-bold" style={{ color: pctColor }}>{pct}%</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <div
              className="h-2.5 rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: pct >= 75
                  ? 'linear-gradient(90deg, #10b981, #059669)'
                  : pct >= 40
                    ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                    : 'linear-gradient(90deg, #3b82f6, #6366f1)',
              }}
            />
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {completed} of {total} problems completed
          </p>
        </div>
      </div>

      {/* ── Filter Bar (sticky) ── */}
      <div
        className="sticky top-0 z-20 rounded-2xl p-3 space-y-3"
        style={{
          background: 'rgba(15,22,40,0.9)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div className="flex flex-wrap gap-2 items-center">
          {/* Search */}
          <div
            className="flex items-center gap-2 flex-1 min-w-52 rounded-xl px-3 py-2"
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}
          >
            <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: 'var(--text-primary)' }}
              placeholder="Search problems…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ color: 'var(--text-muted)' }}>
                <X size={13} />
              </button>
            )}
          </div>

          {/* Difficulty pills */}
          <div className="flex gap-1">
            {['All', 'Easy', 'Medium', 'Hard'].map((d) => (
              <button
                key={d}
                onClick={() => setDiff(d)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150"
                style={
                  difficulty === d
                    ? {
                        background: d === 'Easy' ? '#10b98130' : d === 'Medium' ? 'rgba(251,191,36,0.2)' : d === 'Hard' ? '#ef444430' : 'rgba(59,130,246,0.2)',
                        color: d === 'Easy' ? '#10b981' : d === 'Medium' ? 'var(--accent-yellow)' : d === 'Hard' ? '#ef4444' : 'var(--accent-blue)',
                        border: `1px solid ${d === 'Easy' ? '#10b98150' : d === 'Medium' ? 'rgba(251,191,36,0.4)' : d === 'Hard' ? '#ef444450' : 'rgba(59,130,246,0.4)'}`,
                      }
                    : {
                        background: 'var(--bg-primary)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border)',
                      }
                }
              >
                {d}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex gap-1">
            {['All', 'Completed', 'Remaining'].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150"
                style={
                  status === s
                    ? { background: '#3b82f622', color: '#3b82f6', border: '1px solid #3b82f640' }
                    : { background: 'var(--bg-primary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                }
              >
                {s}
              </button>
            ))}
          </div>

          {/* Platform filter */}
          <div className="flex gap-1">
            {['All', 'LC', 'GFG'].map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150"
                style={
                  platform === p
                    ? {
                        background: p === 'LC' ? 'rgba(245,166,35,0.15)' : p === 'GFG' ? 'rgba(34,197,94,0.15)' : 'rgba(139,92,246,0.15)',
                        color: p === 'LC' ? '#f5a623' : p === 'GFG' ? '#22c55e' : '#8b5cf6',
                        border: `1px solid ${p === 'LC' ? 'rgba(245,166,35,0.35)' : p === 'GFG' ? 'rgba(34,197,94,0.35)' : 'rgba(139,92,246,0.35)'}`,
                      }
                    : { background: 'var(--bg-primary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                }
              >
                {p}
              </button>
            ))}
          </div>

          {/* Topic dropdown */}
          <div className="relative">
            <button
              onClick={() => setTopicOpen((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150"
              style={
                topic !== 'All'
                  ? { background: '#8b5cf622', color: '#8b5cf6', border: '1px solid #8b5cf640' }
                  : { background: 'var(--bg-primary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
              }
            >
              <Filter size={12} />
              {topic === 'All' ? 'Topic' : topic}
              <ChevronDown size={12} className={clsx('transition-transform duration-200', topicOpen && 'rotate-180')} />
            </button>
            {topicOpen && (
              <div
                className="absolute top-full mt-1.5 right-0 z-50 rounded-xl overflow-hidden shadow-2xl max-h-56 overflow-y-auto"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  minWidth: '160px',
                }}
              >
                {allTopics.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTopic(t); setTopicOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs transition-colors duration-100"
                    style={{
                      color: topic === t ? '#8b5cf6' : 'var(--text-secondary)',
                      background: topic === t ? '#8b5cf610' : 'transparent',
                    }}
                    onMouseEnter={(e) => { if (topic !== t) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = topic === t ? '#8b5cf610' : 'transparent'; }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Results count */}
          <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
            Showing {filtered.length} of {problems.length}
          </span>
        </div>
      </div>

      {/* ── Problem Table ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        onClick={() => topicOpen && setTopicOpen(false)}
      >
        {filtered.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
            >
              <Search size={28} style={{ color: 'var(--text-muted)' }} />
            </div>
            <div className="text-center">
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>No problems match</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Try adjusting your search or filter criteria
              </p>
            </div>
            <button
              onClick={() => { setSearch(''); setDiff('All'); setStatus('All'); setTopic('All'); setPlatform('All'); }}
              className="text-sm px-4 py-2 rounded-xl"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                  {['', '#', 'Problem', 'Difficulty', 'Topic', 'Source', 'Notes'].map((h) => (
                    <th
                      key={h}
                      className="py-3 px-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageItems.map((problem, i) => {
                  const globalIndex = (safePage - 1) * PAGE_SIZE + i;
                  return (
                    <ProblemRow
                      key={problem.titleSlug || problem.slug || i}
                      problem={problem}
                      index={globalIndex}
                      sheetName={name}
                      onToggle={toggleSheetProblem}
                      onNotesSaved={handleNotesSaved}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between py-2">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Page {safePage} of {totalPages} &nbsp;·&nbsp; {filtered.length} problems
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: safePage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                opacity: safePage === 1 ? 0.5 : 1,
                cursor: safePage === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeft size={15} /> Prev
            </button>

            {/* Page number pills */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p;
                if (totalPages <= 5) p = i + 1;
                else if (safePage <= 3) p = i + 1;
                else if (safePage >= totalPages - 2) p = totalPages - 4 + i;
                else p = safePage - 2 + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className="w-8 h-8 rounded-lg text-xs font-medium transition-all duration-150"
                    style={
                      p === safePage
                        ? { background: 'var(--gradient-primary)', color: 'white' }
                        : { background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                    }
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: safePage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                opacity: safePage === totalPages ? 0.5 : 1,
                cursor: safePage === totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Next <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
