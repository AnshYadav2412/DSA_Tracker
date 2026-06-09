import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useStatsStore from '../store/useStatsStore.js';
import { ArrowRight, BookOpen } from 'lucide-react';

const SHEET_META = {
  'blind-75':    { label: 'Blind 75',        color: 'var(--brand-blue)', desc: '75 must-know LC problems for coding interviews' },
  'neetcode-150':{ label: 'NeetCode 150',    color: 'var(--accent-yellow)', desc: '150 curated problems covering every pattern' },
  'striver-az':  { label: 'Striver A-Z',     color: 'var(--brand-yellow)', desc: '370+ problems from beginner to advanced' },
  'striver-sde': { label: 'Striver SDE',     color: 'var(--accent-blue)', desc: '180 handpicked problems for SDE interviews' },
};

/* ─── Ring ──────────────────────────────────────────────────────────── */
function Ring({ pct, color, size = 88, stroke = 8 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (Math.min(pct, 100) / 100);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.7s ease' }}
      />
    </svg>
  );
}

export default function SheetSelector() {
  const { sheets, fetchSheets, isLoading } = useStatsStore();
  useEffect(() => { fetchSheets(); }, []);

  const totalDone  = sheets.reduce((s, x) => s + x.completed, 0);
  const totalProbs = sheets.reduce((s, x) => s + x.total, 0);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>DSA Sheets</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
          {totalProbs > 0 ? `${totalDone} of ${totalProbs} problems completed across all sheets` : 'Track your progress across curated problem sets'}
        </p>
      </div>

      {/* Loading */}
      {isLoading && sheets.length === 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(380px,1fr))', gap: 16 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 140 }} />)}
        </div>
      )}

      {/* Sheet grid */}
      {sheets.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(380px,1fr))', gap: 16 }}>
          {sheets.map(sheet => {
            const meta = SHEET_META[sheet.sheetName] || { label: sheet.sheetName, color: '#4f8ef7', desc: 'DSA problem sheet' };
            const pct  = sheet.percentage ?? 0;
            const rem  = sheet.total - sheet.completed;

            return (
              <Link
                key={sheet.sheetName}
                to={`/sheets/${sheet.sheetName}`}
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20,
                  padding: '20px 22px', textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: 18,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.3), 0 0 0 1px ${meta.color}40`; e.currentTarget.style.borderColor = `${meta.color}40`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                {/* Ring */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <Ring pct={pct} color={meta.color} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: meta.color, letterSpacing: '-0.5px' }}>{pct}%</span>
                  </div>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{meta.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 10 }}>{meta.desc}</div>

                  {/* Progress bar */}
                  <div style={{ height: 5, borderRadius: 99, background: 'var(--bg-elevated)', overflow: 'hidden', marginBottom: 6 }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: meta.color, borderRadius: 99, transition: 'width 0.7s ease' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sheet.completed} / {sheet.total} done</span>
                    <span style={{ fontSize: 12, color: meta.color, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                      {rem > 0 ? `${rem} left` : '✓ Complete'} <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && sheets.length === 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '60px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--gradient-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={24} color="white" />
          </div>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Sheets not loaded</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Make sure the server is running and sheet JSON files are present.</p>
        </div>
      )}

      {/* Info callout */}
      {sheets.length > 0 && (
        <div style={{ padding: '13px 16px', borderRadius: 14, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <BookOpen size={14} color="var(--accent-blue)" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Problems are auto-completed when you <strong style={{ color: 'var(--accent-blue)' }}>Import LeetCode data</strong> — the solved slugs are matched against every sheet automatically.
          </p>
        </div>
      )}
    </div>
  );
}
