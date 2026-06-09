import { useState, useRef } from 'react';
import { Upload, CheckCircle2, XCircle, ExternalLink, Zap, BookOpen, ChevronDown, ChevronUp, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../api/index.js';

const card = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20 };

/* ─── Step guide ─────────────────────────────────────────────────────── */
function Steps() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[
        { n: 1, title: 'Log in to LeetCode', body: <>Open <a href="https://leetcode.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>leetcode.com</a> and sign in.</> },
        { n: 2, title: 'Visit the API URL', body: <><a href="https://leetcode.com/api/problems/all/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', wordBreak: 'break-all', textDecoration: 'none' }}>leetcode.com/api/problems/all/</a> — open this in the <em>same browser tab</em>.</> },
        { n: 3, title: 'Select all & copy', body: 'Press Ctrl+A then Ctrl+C. You\'ll see raw JSON.' },
        { n: 4, title: 'Paste & import', body: 'Click the text area, Ctrl+V, then hit Parse & Import.' },
      ].map(({ n, title, body }) => (
        <div key={n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gradient-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0, boxShadow: '0 2px 8px rgba(59,130,246,0.3)' }}>{n}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.55 }}>{body}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Result stats ────────────────────────────────────────────────────── */
function ResultStat({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center', padding: '14px 8px', borderRadius: 14, background: `${color}10`, border: `1px solid ${color}30` }}>
      <div style={{ fontSize: 26, fontWeight: 800, color, letterSpacing: '-1px' }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{label}</div>
    </div>
  );
}

export default function ImportPage() {
  const [raw, setRaw]             = useState('');
  const [phase, setPhase]         = useState('idle'); // idle | ready | loading | success | error
  const [hint, setHint]           = useState('');
  const [hintOk, setHintOk]       = useState(false);
  const [result, setResult]       = useState(null);
  const [errorMsg, setErrorMsg]   = useState('');
  const [showSteps, setShowSteps] = useState(true);
  const taRef = useRef(null);

  /* ── Live validation ─────────────────────────────────────────────────── */
  const validate = val => {
    setRaw(val); setResult(null); setErrorMsg('');
    if (!val.trim()) { setHint(''); setPhase('idle'); return; }
    try {
      const p = JSON.parse(val.trim());
      if (!p.stat_status_pairs) {
        setHint('Valid JSON but missing stat_status_pairs. Wrong URL?'); setHintOk(false); setPhase('idle');
      } else {
        const solved = p.stat_status_pairs.filter(x => x.status === 'ac').length;
        const total  = p.stat_status_pairs.length;
        if (solved === 0) {
          setHint(`${total.toLocaleString()} problems found, 0 solved (status="ac"). Are you logged in?`); setHintOk(false); setPhase('idle');
        } else {
          setHint(`✓ Valid · ${total.toLocaleString()} problems · ${solved} solved detected`); setHintOk(true); setPhase('ready');
        }
      }
    } catch {
      setHint('Not valid JSON yet — keep pasting…'); setHintOk(false); setPhase('idle');
    }
  };

  /* ── Submit ──────────────────────────────────────────────────────────── */
  const handleImport = async () => {
    if (!raw.trim()) return;
    setPhase('loading'); setErrorMsg(''); setResult(null);
    try {
      const data = await api.post('/manual-import/leetcode-json', { jsonData: raw.trim() });
      setResult(data); setPhase('success');
    } catch (e) {
      setErrorMsg(e.message || 'Import failed'); setPhase('error');
    }
  };

  const clear = () => { setRaw(''); setHint(''); setPhase('idle'); setResult(null); setErrorMsg(''); taRef.current?.focus(); };

  const isReady   = phase === 'ready' || (phase === 'success');
  const isLoading = phase === 'loading';

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--gradient-blue)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59,130,246,0.35)' }}>
            <Upload size={18} color="white" />
          </span>
          Import LeetCode Data
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>
          Paste the raw JSON from LeetCode's API — your solved problems are extracted and saved locally.
          Your username is auto-detected from the data, enabling future auto-syncs of recent submissions.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }} className="lg:grid-cols-[1fr_300px]!">

        {/* ── Left: textarea + result ─────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ ...card, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Paste JSON here</span>
              {raw && <button onClick={clear} style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 7, padding: '3px 9px', cursor: 'pointer' }}>Clear</button>}
            </div>

            <textarea
              ref={taRef}
              value={raw}
              onChange={e => validate(e.target.value)}
              rows={18}
              placeholder={'Paste the full response from:\nhttps://leetcode.com/api/problems/all/\n\nStarts with:\n{"num_total": ..., "stat_status_pairs": [...]}'}
              spellCheck={false}
              style={{
                width: '100%', borderRadius: 12, padding: '14px', resize: 'none', outline: 'none',
                background: 'var(--bg-surface)',
                border: `1px solid ${phase === 'success' ? '#10b98150' : phase === 'error' ? '#f43f5e50' : hintOk ? '#4f8ef750' : 'var(--border)'}`,
                color: 'var(--text-secondary)', fontSize: 12, fontFamily: "'JetBrains Mono','Fira Code',monospace",
                lineHeight: 1.65, transition: 'border-color 0.2s',
              }}
            />

            {/* Hint */}
            {hint && (
              <div style={{
                marginTop: 10, padding: '9px 12px', borderRadius: 10, fontSize: 12,
                background: hintOk ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                border: `1px solid ${hintOk ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
                color: hintOk ? '#10b981' : '#f59e0b',
              }}>{hint}</div>
            )}

            {/* Submit */}
            <button
              onClick={handleImport}
              disabled={!raw.trim() || isLoading}
              style={{
                marginTop: 14, width: '100%', padding: '13px',
                borderRadius: 12, border: 'none', cursor: raw.trim() && !isLoading ? 'pointer' : 'not-allowed',
                background: isReady && !isLoading ? 'var(--gradient-blue)' : 'var(--bg-elevated)',
                color: isReady && !isLoading ? '#fff' : 'var(--text-muted)',
                fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: isReady && !isLoading ? '0 4px 16px rgba(59,130,246,0.3)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {isLoading ? <><RefreshCw size={16} className="animate-spin" /> Parsing &amp; Importing…</> : <><Zap size={16} /> Parse &amp; Import</>}
            </button>
          </div>

          {/* Error */}
          {phase === 'error' && (
            <div style={{ ...card, padding: '16px 20px', background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.3)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <XCircle size={18} color="#f43f5e" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#f43f5e' }}>Import Failed</div>
                <div style={{ fontSize: 12, color: 'rgba(244,63,94,0.7)', marginTop: 3 }}>{errorMsg}</div>
              </div>
            </div>
          )}

          {/* Success */}
          {phase === 'success' && result && (
            <div style={{ ...card, padding: 20, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle2 size={20} color="#10b981" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#10b981' }}>Import Successful!</div>
                  <div style={{ fontSize: 12, color: 'rgba(16,185,129,0.7)', marginTop: 2 }}>
                    {result.sheetsMatched} sheet problems auto-completed · {new Date(result.importedAt).toLocaleString()}
                    {result.username && <> · Logged in as <strong style={{ color: '#10b981' }}>{result.username}</strong></>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                <ResultStat label="Solved"  value={result.solved}       color="var(--accent-blue)" />
                <ResultStat label="Easy"    value={result.easySolved}   color="#22c55e" />
                <ResultStat label="Medium"  value={result.mediumSolved} color="var(--accent-yellow)" />
                <ResultStat label="Hard"    value={result.hardSolved}   color="#f43f5e" />
              </div>

              {/* Diff bar */}
              {result.solved > 0 && (() => {
                const t = result.solved;
                return (
                  <div style={{ display: 'flex', gap: 3, height: 7, borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${(result.easySolved   / t) * 100}%`, background: '#22c55e', borderRadius: 99 }} />
                    <div style={{ width: `${(result.mediumSolved / t) * 100}%`, background: 'var(--accent-yellow)', borderRadius: 99 }} />
                    <div style={{ width: `${(result.hardSolved   / t) * 100}%`, background: '#f43f5e', borderRadius: 99 }} />
                  </div>
                );
              })()}

              {result.sheetsMatched > 0 && (
                <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', gap: 10, alignItems: 'center' }}>
                  <BookOpen size={15} color="var(--accent-blue)" />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--accent-blue)' }}>{result.sheetsMatched}</strong> DSA sheet problems auto-completed
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right: instructions ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ ...card, padding: 18 }}>
            <button onClick={() => setShowSteps(v => !v)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: showSteps ? 16 : 0 }}>
              <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>📋 How to get your data</span>
              {showSteps ? <ChevronUp size={15} color="var(--text-muted)" /> : <ChevronDown size={15} color="var(--text-muted)" />}
            </button>
            {showSteps && <Steps />}
          </div>

          <div style={{ ...card, padding: 18, background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Why this works</span>
            {[
              [CheckCircle2, 'var(--accent-blue)', 'Visit the URL while logged in — LeetCode returns "ac" status for problems you\'ve solved.'],
              [BookOpen,     'var(--accent-yellow)', 'Solved slugs are matched against your DSA sheets and problems are auto-completed.'],
              [AlertCircle,  'var(--brand-yellow)', 'Your username is extracted from the JSON and used to auto-fetch recent submissions on next load.'],
            ].map(([Icon, c, t]) => (
              <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <Icon size={14} color={c} style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55 }}>{t}</p>
              </div>
            ))}
          </div>

          <a
            href="https://leetcode.com/api/problems/all/"
            target="_blank" rel="noopener noreferrer"
            style={{
              padding: '12px 16px', borderRadius: 14, textDecoration: 'none', fontWeight: 600, fontSize: 13,
              background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', color: 'var(--accent-yellow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'transform 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = ''}
          >
            <ExternalLink size={14} />
            Open LeetCode API URL
          </a>
        </div>
      </div>
    </div>
  );
}
