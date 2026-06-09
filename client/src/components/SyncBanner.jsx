/**
 * SyncBanner — auto-runs on mount, shows persistent banners for all sync states.
 *
 * States:
 *  1. loading     — LeetCode GraphQL request in flight (blue spinner)
 *  2. up_to_date  — total matches, nothing to do (green, auto-hides in 5s)
 *  3. updated     — new questions added (green or yellow if some still missing)
 *  4. error       — fetch failed, shown permanently until dismissed or retry
 *  5. no_data     — no import ever done (red, links to /import)
 */
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw, CheckCircle2, X, Info, RotateCcw } from 'lucide-react';
import { getWarnings, syncApi, settingsApi } from '../api/index.js';

export default function SyncBanner() {
  const [warnings, setWarnings]       = useState(() => getWarnings());
  const [fetchState, setFetchState]   = useState('idle'); // idle|loading|done|error
  const [fetchResult, setFetchResult] = useState(null);
  const [dismissed, setDismissed]     = useState({});
  const [errorMsg, setErrorMsg]       = useState('');
  const [username, setUsername]       = useState('');

  const refreshWarnings = useCallback(() => setWarnings(getWarnings()), []);

  const runSync = useCallback(async (user) => {
    try {
      setFetchState('loading');
      setErrorMsg('');
      const result = await syncApi.fetchRecentLeetCode(user);
      setFetchResult(result);
      setFetchState('done');
      refreshWarnings();

      // Auto-hide "up to date" after 5s; keep "updated" or "mayBeMissing" visible
      if (result.status === 'up_to_date') {
        setTimeout(() => setFetchState('idle'), 5000);
      } else if (result.status === 'updated' && !result.mayBeMissing) {
        setTimeout(() => setFetchState('idle'), 7000);
      }
      // mayBeMissing stays visible until dismissed
    } catch (err) {
      setErrorMsg(err.message);
      setFetchState('error');
      // Errors stay visible — user needs to see them, not auto-dismiss
    }
  }, [refreshWarnings]);

  // Auto-run on mount if username is known
  useEffect(() => {
    refreshWarnings();
    settingsApi.get().then((s) => {
      const u = s.leetcodeUsername;
      if (u) {
        setUsername(u);
        runSync(u);
      }
    }).catch(() => {});
  }, [refreshWarnings, runSync]);

  const dismiss = (key) => setDismissed((d) => ({ ...d, [key]: true }));

  const visibleWarnings = warnings.filter((w) => !dismissed[w.type]);
  if (visibleWarnings.length === 0 && fetchState === 'idle') return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>

      {/* ── 1. Loading ──────────────────────────────────────────────────── */}
      {fetchState === 'loading' && (
        <Banner color="#3b82f6" bg="rgba(59,130,246,0.1)" border="rgba(59,130,246,0.3)">
          <RefreshCw size={14} className="animate-spin" style={{ flexShrink: 0 }} />
          <span>
            Checking LeetCode{username ? ` (${username})` : ''} for new solves…
          </span>
        </Banner>
      )}

      {/* ── 2. Up to date ───────────────────────────────────────────────── */}
      {fetchState === 'done' && fetchResult?.status === 'up_to_date' && (
        <Banner color="#10b981" bg="rgba(16,185,129,0.08)" border="rgba(16,185,129,0.3)"
          onDismiss={() => setFetchState('idle')}>
          <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
          <span>
            Up to date — <strong>{fetchResult.apiTotal}</strong> solved, matches your local data.
          </span>
        </Banner>
      )}

      {/* ── 3a. Updated, all caught ─────────────────────────────────────── */}
      {fetchState === 'done' && fetchResult?.status === 'updated' && !fetchResult.mayBeMissing && (
        <Banner color="#10b981" bg="rgba(16,185,129,0.08)" border="rgba(16,185,129,0.3)"
          onDismiss={() => setFetchState('idle')}>
          <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
          <span>
            Synced! <strong>{fetchResult.gap}</strong> new solve{fetchResult.gap !== 1 ? 's' : ''} detected →
            added <strong>{fetchResult.added}</strong> new slug{fetchResult.added !== 1 ? 's' : ''}
            {fetchResult.sheetsMatched > 0
              ? `, ${fetchResult.sheetsMatched} sheet problem${fetchResult.sheetsMatched !== 1 ? 's' : ''} auto-marked`
              : ''}.
          </span>
        </Banner>
      )}

      {/* ── 3b. Updated, but gap > 20 — some still missing ─────────────── */}
      {fetchState === 'done' && fetchResult?.status === 'updated' && fetchResult.mayBeMissing
        && !dismissed['mayBeMissing'] && (
        <Banner color="#f59e0b" bg="rgba(245,158,11,0.08)" border="rgba(245,158,11,0.3)"
          onDismiss={() => dismiss('mayBeMissing')}>
          <AlertTriangle size={14} style={{ flexShrink: 0 }} />
          <span>
            You solved <strong>{fetchResult.gap}</strong> problems since your last full import.
            The recent-20 fetch captured <strong>{fetchResult.added}</strong> new ones, but
            ~<strong>{fetchResult.missingCount}</strong> are still missing (API only returns 20).{' '}
            <Link to="/import" style={{ color: '#f59e0b', fontWeight: 600 }}>
              Re-import the full list →
            </Link>
          </span>
        </Banner>
      )}

      {/* ── 4. Error — persistent, with retry ──────────────────────────── */}
      {fetchState === 'error' && (
        <Banner color="#ef4444" bg="rgba(239,68,68,0.08)" border="rgba(239,68,68,0.3)"
          onDismiss={() => setFetchState('idle')}>
          <Info size={14} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>
            Auto-sync failed: <em>{errorMsg}</em>. Your local data is unchanged.
          </span>
          {username && (
            <button
              onClick={() => runSync(username)}
              style={{
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                color: '#ef4444', borderRadius: 8, padding: '3px 10px', fontSize: 12,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
              }}
            >
              <RotateCcw size={11} /> Retry
            </button>
          )}
        </Banner>
      )}

      {/* ── 5. No data ever imported ────────────────────────────────────── */}
      {visibleWarnings.find((w) => w.type === 'no_data') && fetchState !== 'loading' && (
        <Banner color="#f43f5e" bg="rgba(244,63,94,0.08)" border="rgba(244,63,94,0.3)"
          onDismiss={() => dismiss('no_data')}>
          <AlertTriangle size={14} style={{ flexShrink: 0 }} />
          <span>
            No LeetCode data found.&nbsp;
            <Link to="/import" style={{ color: '#f43f5e', fontWeight: 600 }}>
              Import your data →
            </Link>
            &nbsp;to start tracking. Your username will be saved for future auto-syncs.
          </span>
        </Banner>
      )}
    </div>
  );
}

/* ─── Banner shell ───────────────────────────────────────────────────────── */
function Banner({ color, bg, border, onDismiss, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px', borderRadius: 12,
      background: bg, border: `1px solid ${border}`,
      color, fontSize: 13, lineHeight: 1.5,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, flexWrap: 'wrap' }}>
        {children}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          title="Dismiss"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color, padding: 2, flexShrink: 0, opacity: 0.6,
          }}
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
