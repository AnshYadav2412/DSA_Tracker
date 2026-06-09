import { useState, useEffect } from 'react';
import { syncApi, settingsApi } from '../api/index.js';
import { RefreshCw, CheckCircle2, XCircle, Clock, ExternalLink, Save } from 'lucide-react';
import clsx from 'clsx';

const PLATFORMS = [
  {
    id: 'leetcode',
    name: 'LeetCode',
    logo: '⚡',
    description: 'Syncs solved counts, difficulty breakdown, streak & sheet auto-detection',
    color: '#f59e0b',
    url: 'https://leetcode.com',
    placeholder: 'e.g. neal_wu',
  },
  {
    id: 'gfg',
    name: 'GeeksForGeeks',
    logo: '🌿',
    description: 'Syncs school/basic/easy/medium/hard solved counts and streak',
    color: '#10b981',
    url: 'https://www.geeksforgeeks.org',
    placeholder: 'e.g. johndoe123',
  },
  {
    id: 'codeforces',
    name: 'Codeforces',
    logo: '🔥',
    description: 'Syncs accepted submissions, rating, and difficulty breakdown',
    color: '#3b82f6',
    url: 'https://codeforces.com',
    placeholder: 'e.g. tourist',
  },
];

function ResultDetail({ result }) {
  if (!result) return null;
  const rows = [
    result.totalSolved != null && ['Total Solved', result.totalSolved],
    result.easySolved != null && ['Easy', result.easySolved],
    result.mediumSolved != null && ['Medium', result.mediumSolved],
    result.hardSolved != null && ['Hard', result.hardSolved],
    result.ranking != null && result.ranking > 0 && ['Ranking', `#${result.ranking?.toLocaleString()}`],
    result.rating != null && result.rating > 0 && ['Rating', result.rating],
    result.streak != null && result.streak > 0 && ['Streak', `${result.streak} days`],
    result.currentStreak != null && result.currentStreak > 0 && ['Current Streak', `${result.currentStreak} days`],
    result.maxStreak != null && result.maxStreak > 0 && ['Max Streak', `${result.maxStreak} days`],
    result.autoCompleted != null && result.autoCompleted > 0 && ['Sheet Problems Auto-Completed', result.autoCompleted],
  ].filter(Boolean);

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2">
      {rows.map(([label, val]) => (
        <div key={label} className="flex justify-between text-xs py-0.5" style={{ borderBottom: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--text-muted)' }}>{label}</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{val}</span>
        </div>
      ))}
    </div>
  );
}

function SyncCard({ platform, savedUsername, onSyncDone }) {
  const [username, setUsername] = useState(savedUsername || '');
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Keep in sync if parent updates saved username
  useEffect(() => { if (savedUsername) setUsername(savedUsername); }, [savedUsername]);

  const handleSync = async () => {
    if (!username.trim()) return setError('Please enter a username');
    setStatus('loading'); setError(''); setResult(null);

    try {
      let data;
      if (platform.id === 'leetcode') data = await syncApi.syncLeetCode(username.trim());
      else if (platform.id === 'gfg') data = await syncApi.syncGFG(username.trim());
      else if (platform.id === 'codeforces') data = await syncApi.syncCodeforces(username.trim());

      setResult(data);
      setStatus('success');
      onSyncDone?.();
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="rounded-2xl p-6 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${platform.color}22` }}>
            {platform.logo}
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{platform.name}</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{platform.description}</p>
          </div>
        </div>
        <a href={platform.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)' }}>
          <ExternalLink size={16} />
        </a>
      </div>

      {/* Input + button */}
      <div className="flex gap-3">
        <input
          className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none"
          style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
          placeholder={platform.placeholder}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSync()}
        />
        <button
          onClick={handleSync}
          disabled={status === 'loading'}
          className={clsx('flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white', status === 'loading' && 'opacity-70')}
          style={{ background: platform.color, minWidth: '90px' }}
        >
          <RefreshCw size={14} className={status === 'loading' ? 'animate-spin' : ''} />
          {status === 'loading' ? 'Syncing…' : 'Sync'}
        </button>
      </div>

      {/* Error */}
      {(status === 'error' || error) && (
        <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: '#ef444420', border: '1px solid #ef444440' }}>
          <XCircle size={18} style={{ color: '#ef4444', marginTop: '1px', flexShrink: 0 }} />
          <div>
            <p className="font-medium text-sm" style={{ color: '#ef4444' }}>Sync failed</p>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{error}</p>
          </div>
        </div>
      )}

      {/* Success */}
      {status === 'success' && result && (
        <div className="rounded-xl p-4 space-y-2" style={{ background: '#10b98120', border: '1px solid #10b98140' }}>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} style={{ color: '#10b981' }} />
            <p className="font-medium text-sm" style={{ color: '#10b981' }}>Sync complete for {result.username || username}</p>
          </div>
          <ResultDetail result={result} />
        </div>
      )}
    </div>
  );
}

export default function Sync() {
  const [settings, setSettings] = useState({ leetcodeUsername: '', gfgUsername: '', codeforcesUsername: '' });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [syncStatus, setSyncStatus] = useState(null);

  const usernameMap = {
    leetcode: settings.leetcodeUsername,
    gfg: settings.gfgUsername,
    codeforces: settings.codeforcesUsername,
  };

  useEffect(() => {
    settingsApi.get().then(setSettings).catch(() => {});
    syncApi.getStatus().then(setSyncStatus).catch(() => {});
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true); setSaveMsg('');
    try {
      const res = await settingsApi.update(settings);
      setSettings(res.settings);
      setSaveMsg('Saved! A background sync has been triggered.');
    } catch (err) {
      setSaveMsg(`Error: ${err.message}`);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 4000);
    }
  };

  const refreshStatus = () => syncApi.getStatus().then(setSyncStatus).catch(() => {});

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Platform Sync</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Import your progress from LeetCode, GeeksForGeeks, and Codeforces
        </p>
      </div>

      {/* Saved usernames */}
      <div className="rounded-2xl p-5 space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Saved Usernames</h2>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          These are used for the auto-sync that runs every 6 hours.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { key: 'leetcodeUsername', label: 'LeetCode', color: '#f59e0b' },
            { key: 'gfgUsername', label: 'GeeksForGeeks', color: '#10b981' },
            { key: 'codeforcesUsername', label: 'Codeforces', color: '#3b82f6' },
          ].map(({ key, label, color }) => (
            <div key={key}>
              <label className="text-xs font-medium block mb-1.5" style={{ color }}>
                {label}
              </label>
              <input
                className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
                placeholder={`${label} username`}
                value={settings[key] || ''}
                onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: 'var(--gradient-primary)', opacity: saving ? 0.7 : 1 }}
          >
            <Save size={14} />
            {saving ? 'Saving…' : 'Save & Sync'}
          </button>
          {saveMsg && (
            <p className="text-xs" style={{ color: saveMsg.startsWith('Error') ? '#ef4444' : '#10b981' }}>
              {saveMsg}
            </p>
          )}
        </div>
      </div>

      {/* Sync status */}
      {syncStatus && (
        <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <Clock size={18} style={{ color: 'var(--text-muted)' }} />
          <div className="flex-1">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {syncStatus.isSyncing
                ? '🔄 Sync in progress...'
                : syncStatus.lastSyncedAt
                  ? `Last synced: ${new Date(syncStatus.lastSyncedAt).toLocaleString()}`
                  : 'No sync run yet'}
            </p>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Auto-runs every 6 hours</p>
        </div>
      )}

      {/* Per-platform sync cards */}
      <div className="space-y-4">
        {PLATFORMS.map((p) => (
          <SyncCard
            key={p.id}
            platform={p}
            savedUsername={usernameMap[p.id]}
            onSyncDone={refreshStatus}
          />
        ))}
      </div>

      {/* How it works */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>How Sync Works</h3>
        <ul className="space-y-2">
          {[
            'Enter your username in any card above and click Sync to pull your stats',
            'LeetCode sync auto-detects and marks DSA sheet problems as completed',
            'Save usernames above to enable the automatic 6-hour background sync',
            'All platform data is stored locally in your MongoDB database',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={14} style={{ color: '#10b981', marginTop: '2px', flexShrink: 0 }} />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
