import { useState, useEffect } from 'react';
import { syncApi, settingsApi } from '../api/index.js';
import { Save, RefreshCw, CheckCircle2, XCircle, ExternalLink, User, Code2 } from 'lucide-react';

const card = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20 };

/* ─── Codeforces sync card ───────────────────────────────────────────── */
function CfCard({ username, onUsernameChange }) {
  const [local,  setLocal]  = useState(username || '');
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error,  setError]  = useState('');

  useEffect(() => { setLocal(username || ''); }, [username]);

  const handleSync = async () => {
    if (!local.trim()) return setError('Enter a username first');
    setStatus('loading'); setError(''); setResult(null);
    try {
      const data = await syncApi.syncCodeforces(local.trim());
      setResult(data); setStatus('success');
    } catch (err) {
      setError(err.message); setStatus('error');
    }
  };

  return (
    <div style={{ ...card, padding: 22 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🔥</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>Codeforces</span>
            <a href="https://codeforces.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)' }}><ExternalLink size={12} /></a>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Fetches rating and solve count automatically on sync</div>
        </div>
      </div>

      {/* Input + Sync */}
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <User size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={local}
            onChange={e => { setLocal(e.target.value); onUsernameChange('codeforcesUsername', e.target.value); }}
            onKeyDown={e => e.key === 'Enter' && handleSync()}
            placeholder="e.g. tourist"
            style={{ width: '100%', paddingLeft: 34, paddingRight: 12, paddingTop: 10, paddingBottom: 10, borderRadius: 12, background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }}
          />
        </div>
        <button
          onClick={handleSync}
          disabled={status === 'loading'}
          style={{ padding: '10px 18px', borderRadius: 12, background: 'var(--accent-blue)', color: '#fff', fontWeight: 600, fontSize: 13, border: 'none', cursor: status === 'loading' ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 7, opacity: status === 'loading' ? 0.7 : 1, flexShrink: 0 }}
        >
          <RefreshCw size={13} className={status === 'loading' ? 'animate-spin' : ''} />
          {status === 'loading' ? 'Syncing…' : 'Sync'}
        </button>
      </div>

      {/* Error */}
      {status === 'error' && (
        <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <XCircle size={15} color="#f43f5e" style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 12, color: '#f43f5e' }}>{error}</span>
        </div>
      )}

      {/* Success */}
      {status === 'success' && result && (
        <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
            <CheckCircle2 size={14} color="#10b981" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#10b981' }}>Synced successfully</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {[['Solved', result.totalSolved, 'var(--accent-blue)'], ['Rating', result.rating, 'var(--brand-blue)'], ['Max Rating', result.maxRating, 'var(--accent-yellow)']].map(([l, v, c]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: c }}>{v ?? '—'}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── LeetCode display card (no sync — via import) ───────────────────── */
function LcCard({ username, onUsernameChange }) {
  const [local, setLocal] = useState(username || '');
  useEffect(() => { setLocal(username || ''); }, [username]);

  return (
    <div style={{ ...card, padding: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(251,191,36,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>⚡</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>LeetCode</span>
            <a href="https://leetcode.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)' }}><ExternalLink size={12} /></a>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Solved problems are synced via the Import page — not API calls</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <User size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={local}
            onChange={e => { setLocal(e.target.value); onUsernameChange('leetcodeUsername', e.target.value); }}
            placeholder="e.g. neal_wu"
            style={{ width: '100%', paddingLeft: 34, paddingRight: 12, paddingTop: 10, paddingBottom: 10, borderRadius: 12, background: 'var(--bg-surface)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }}
          />
        </div>
        <div style={{ padding: '10px 16px', borderRadius: 12, background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', fontSize: 12, fontWeight: 600, color: 'var(--accent-yellow)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          Use Import →
        </div>
      </div>
    </div>
  );
}

/* ─── Settings page ──────────────────────────────────────────────────── */
export default function Settings() {
  const [settings, setSettings] = useState({ leetcodeUsername: '', codeforcesUsername: '' });
  const [saving, setSaving]     = useState(false);
  const [saveMsg, setSaveMsg]   = useState('');

  useEffect(() => {
    settingsApi.get()
      .then(s => setSettings({ leetcodeUsername: s.leetcodeUsername || '', codeforcesUsername: s.codeforcesUsername || '' }))
      .catch(() => {});
  }, []);

  const handleChange = (key, val) => setSettings(s => ({ ...s, [key]: val }));

  const handleSave = async () => {
    setSaving(true); setSaveMsg('');
    try {
      const res = await settingsApi.update(settings);
      setSettings({ leetcodeUsername: res.settings?.leetcodeUsername || '', codeforcesUsername: res.settings?.codeforcesUsername || '' });
      setSaveMsg('✓ Saved');
    } catch (err) {
      setSaveMsg(`✗ ${err.message}`);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(''), 4000);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>Settings</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>Manage platform accounts</p>
      </div>

      {/* Platform cards */}
      <LcCard username={settings.leetcodeUsername} onUsernameChange={handleChange} />
      <CfCard username={settings.codeforcesUsername} onUsernameChange={handleChange} />

      {/* Save */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ padding: '11px 24px', borderRadius: 12, background: 'var(--gradient-blue)', color: '#fff', fontWeight: 600, fontSize: 14, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, opacity: saving ? 0.7 : 1, boxShadow: '0 4px 14px rgba(59,130,246,0.3)' }}
        >
          <Save size={14} />
          {saving ? 'Saving…' : 'Save'}
        </button>
        {saveMsg && <p style={{ fontSize: 13, color: saveMsg.startsWith('✓') ? '#10b981' : '#f43f5e' }}>{saveMsg}</p>}
      </div>

      {/* How it works */}
      <div style={{ padding: '16px 20px', borderRadius: 16, background: 'var(--bg-surface)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>How it works</div>
        {[
          [CheckCircle2, 'var(--accent-yellow)', 'LeetCode solved problems → Import page (paste JSON from the API URL).'],
          [Code2,        'var(--accent-blue)', 'Codeforces → enter username and click Sync to fetch rating and stats.'],
          [CheckCircle2, 'var(--brand-blue)', 'Saved usernames enable 6-hour background sync for Codeforces.'],
        ].map(([Icon, c, t]) => (
          <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Icon size={13} color={c} style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>{t}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
