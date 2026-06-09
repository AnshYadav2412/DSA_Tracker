import { useState, useEffect, useCallback } from 'react';
import useProblemsStore from '../store/useProblemsStore.js';
import {
  Plus, Search, Filter, Star, RefreshCw, ExternalLink, Trash2,
  ChevronLeft, ChevronRight, BookMarked, CheckCircle2, Clock, X, Edit2
} from 'lucide-react';
import clsx from 'clsx';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const STATUSES = ['Todo', 'Attempted', 'Solved'];
const PLATFORMS = ['LeetCode', 'GeeksForGeeks', 'Codeforces', 'HackerRank', 'Custom'];
const TOPICS = [
  'Array', 'String', 'Linked List', 'Stack', 'Queue', 'Tree', 'Graph',
  'Dynamic Programming', 'Backtracking', 'Binary Search', 'Sorting', 'Hashing',
  'Heap', 'Trie', 'Greedy', 'Math', 'Bit Manipulation', 'Two Pointers',
  'Sliding Window', 'Recursion', 'Divide and Conquer', 'General',
];

const DIFFICULTY_COLORS = {
  Easy: { bg: '#10b98122', text: '#10b981' },
  Medium: { bg: '#f59e0b22', text: '#f59e0b' },
  Hard: { bg: '#ef444422', text: '#ef4444' },
};

const STATUS_ICONS = {
  Todo: { Icon: Clock, color: '#64748b' },
  Attempted: { Icon: RefreshCw, color: '#f59e0b' },
  Solved: { Icon: CheckCircle2, color: '#10b981' },
};

// ─── Problem Form Modal ───────────────────────────────────────────────────────
function ProblemModal({ problem, onClose, onSave }) {
  const initial = problem || {
    title: '', difficulty: 'Easy', topic: 'Array', tags: '',
    platform: 'LeetCode', status: 'Todo', url: '', notes: '',
    timeComplexity: '', spaceComplexity: '',
  };
  const [form, setForm] = useState({
    ...initial,
    tags: Array.isArray(initial.tags) ? initial.tags.join(', ') : (initial.tags || ''),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handle = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Title is required');
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-light)',
    borderRadius: '10px',
    color: 'var(--text-primary)',
    padding: '10px 14px',
    width: '100%',
    fontSize: '14px',
    outline: 'none',
  };
  const labelStyle = { color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500', marginBottom: '6px', display: 'block' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div
        className="w-full max-w-xl rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
            {problem ? 'Edit Problem' : 'Add Problem'}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl text-sm" style={{ background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440' }}>
              {error}
            </div>
          )}

          <div>
            <label style={labelStyle}>Title *</label>
            <input style={inputStyle} value={form.title} onChange={handle('title')} placeholder="e.g. Two Sum" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Difficulty</label>
              <select style={inputStyle} value={form.difficulty} onChange={handle('difficulty')}>
                {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select style={inputStyle} value={form.status} onChange={handle('status')}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Topic</label>
              <select style={inputStyle} value={form.topic} onChange={handle('topic')}>
                {TOPICS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Platform</label>
              <select style={inputStyle} value={form.platform} onChange={handle('platform')}>
                {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Problem URL</label>
            <input style={inputStyle} value={form.url} onChange={handle('url')} placeholder="https://leetcode.com/problems/..." />
          </div>

          <div>
            <label style={labelStyle}>Tags (comma-separated)</label>
            <input style={inputStyle} value={form.tags} onChange={handle('tags')} placeholder="array, two-pointers, hash-map" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Time Complexity</label>
              <input style={inputStyle} value={form.timeComplexity} onChange={handle('timeComplexity')} placeholder="O(n)" />
            </div>
            <div>
              <label style={labelStyle}>Space Complexity</label>
              <input style={inputStyle} value={form.spaceComplexity} onChange={handle('spaceComplexity')} placeholder="O(1)" />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Notes</label>
            <textarea
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
              value={form.notes}
              onChange={handle('notes')}
              placeholder="Key insights, approach, edge cases..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white"
              style={{ background: 'var(--gradient-primary)', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Saving…' : (problem ? 'Update' : 'Add Problem')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Problem Row ──────────────────────────────────────────────────────────────
function ProblemRow({ problem, onEdit, onDelete, onToggleFav, onToggleRev }) {
  const dc = DIFFICULTY_COLORS[problem.difficulty];
  const { Icon: StatusIcon, color: statusColor } = STATUS_ICONS[problem.status];
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${problem.title}"?`)) return;
    setDeleting(true);
    try { await onDelete(problem._id); } finally { setDeleting(false); }
  };

  return (
    <tr
      className="transition-colors hover:bg-white/5"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
            {problem.title}
          </span>
          {problem.url && (
            <a href={problem.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={12} style={{ color: 'var(--text-muted)' }} />
            </a>
          )}
        </div>
        {problem.topic && (
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{problem.topic}</span>
        )}
      </td>
      <td className="py-3 px-4">
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: dc.bg, color: dc.text }}
        >
          {problem.difficulty}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5">
          <StatusIcon size={14} style={{ color: statusColor }} />
          <span className="text-xs" style={{ color: statusColor }}>{problem.status}</span>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{problem.platform}</span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <button onClick={() => onToggleFav(problem._id)} title="Favorite">
            <Star
              size={15}
              style={{
                color: problem.isFavorite ? '#f59e0b' : 'var(--text-muted)',
                fill: problem.isFavorite ? '#f59e0b' : 'transparent',
              }}
            />
          </button>
          <button onClick={() => onToggleRev(problem._id)} title="Revision">
            <BookMarked
              size={15}
              style={{
                color: problem.isRevision ? '#8b5cf6' : 'var(--text-muted)',
              }}
            />
          </button>
          <button onClick={() => onEdit(problem)} title="Edit">
            <Edit2 size={15} style={{ color: 'var(--text-muted)' }} />
          </button>
          <button onClick={handleDelete} disabled={deleting} title="Delete">
            <Trash2 size={15} style={{ color: deleting ? 'var(--text-muted)' : '#ef4444' }} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Problems Page ───────────────────────────────────────────────────────
export default function Problems() {
  const {
    problems, total, totalPages, currentPage,
    isLoading, filters,
    fetchProblems, setFilter, resetFilters,
    createProblem, updateProblem, deleteProblem,
    toggleFavorite, toggleRevision,
  } = useProblemsStore();

  const [showModal, setShowModal] = useState(false);
  const [editProblem, setEditProblem] = useState(null);
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => { fetchProblems(1); }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter('search', searchVal);
      fetchProblems(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchVal]);

  const applyFilter = (key, value) => {
    setFilter(key, value);
    fetchProblems(1);
  };

  const handleSave = async (data) => {
    if (editProblem) {
      await updateProblem(editProblem._id, data);
    } else {
      await createProblem(data);
    }
    setEditProblem(null);
  };

  const openEdit = (p) => { setEditProblem(p); setShowModal(true); };
  const openAdd = () => { setEditProblem(null); setShowModal(true); };

  const selectStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    color: 'var(--text-secondary)',
    padding: '8px 12px',
    fontSize: '13px',
    cursor: 'pointer',
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Problems
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {total} problems tracked
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <Plus size={16} />
          Add Problem
        </button>
      </div>

      {/* Filters */}
      <div
        className="rounded-2xl p-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 min-w-48 rounded-xl px-3 py-2"
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
            <Search size={15} style={{ color: 'var(--text-muted)' }} />
            <input
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: 'var(--text-primary)' }}
              placeholder="Search problems..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
          </div>

          <select style={selectStyle} value={filters.difficulty} onChange={(e) => applyFilter('difficulty', e.target.value)}>
            <option value="">All Difficulties</option>
            {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
          </select>

          <select style={selectStyle} value={filters.status} onChange={(e) => applyFilter('status', e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>

          <select style={selectStyle} value={filters.platform} onChange={(e) => applyFilter('platform', e.target.value)}>
            <option value="">All Platforms</option>
            {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
          </select>

          <select style={selectStyle} value={filters.topic} onChange={(e) => applyFilter('topic', e.target.value)}>
            <option value="">All Topics</option>
            {TOPICS.map((t) => <option key={t}>{t}</option>)}
          </select>

          <button
            onClick={() => { resetFilters(); setSearchVal(''); fetchProblems(1); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            <X size={14} /> Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          </div>
        ) : problems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <p style={{ color: 'var(--text-muted)' }}>No problems found</p>
            <button
              onClick={openAdd}
              className="text-sm px-4 py-2 rounded-xl text-white"
              style={{ background: 'var(--gradient-primary)' }}
            >
              Add your first problem
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Problem', 'Difficulty', 'Status', 'Platform', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {problems.map((p) => (
                  <ProblemRow
                    key={p._id}
                    problem={p}
                    onEdit={openEdit}
                    onDelete={deleteProblem}
                    onToggleFav={toggleFavorite}
                    onToggleRev={toggleRevision}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => fetchProblems(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-xl"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => fetchProblems(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ProblemModal
          problem={editProblem}
          onClose={() => { setShowModal(false); setEditProblem(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
