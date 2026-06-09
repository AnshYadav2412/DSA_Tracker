import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useStatsStore from '../store/useStatsStore.js';
import {
  CheckCircle2, TrendingUp, Trophy, FileUp,
  ArrowRight, Star, Target, Zap,
} from 'lucide-react';

const card = {
  background: 'var(--bg-layer-1)',
  border: '1px solid var(--divider-1)',
  borderRadius: 8,
};

function BigNum({ value, color = 'var(--label-1)' }) {
  return (
    <span style={{ fontSize: 32, fontWeight: 600, color, lineHeight: 1 }}>
      {(value ?? 0).toLocaleString()}
    </span>
  );
}

function DiffBar({ easy, medium, hard }) {
  const total = (easy + medium + hard) || 1;
  return (
    <div style={{ display: 'flex', gap: 1, height: 5, borderRadius: 4, overflow: 'hidden' }}>
      {easy   > 0 && <div style={{ width: `${(easy   / total) * 100}%`, background: 'var(--easy)', transition: 'width 0.6s ease' }} />}
      {medium > 0 && <div style={{ width: `${(medium / total) * 100}%`, background: 'var(--medium)', transition: 'width 0.6s ease' }} />}
      {hard   > 0 && <div style={{ width: `${(hard   / total) * 100}%`, background: 'var(--hard)', transition: 'width 0.6s ease' }} />}
    </div>
  );
}

function LeetCodeCard({ data }) {
  const total  = data?.totalSolved  ?? 0;
  const easy   = data?.easySolved   ?? 0;
  const medium = data?.mediumSolved ?? 0;
  const hard   = data?.hardSolved   ?? 0;
  const streak = data?.streak       ?? 0;
  const rank   = data?.ranking      ?? 0;

  return (
    <div style={{ ...card, padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--label-3)', marginBottom: 4 }}>LeetCode</div>
          <BigNum value={total} color="var(--label-1)" />
          <div style={{ fontSize: 13, color: 'var(--label-3)', marginTop: 2 }}>problems solved</div>
        </div>
        {streak > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)' }}>
            <Zap size={12} color="var(--accent-yellow)" />
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent-yellow)' }}>{streak}d</span>
          </div>
        )}
      </div>

      <DiffBar easy={easy} medium={medium} hard={hard} />

      <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
        {[['Easy', easy, 'var(--easy)'], ['Medium', medium, 'var(--medium)'], ['Hard', hard, 'var(--hard)']].map(([l, v, c]) => (
          <div key={l}>
            <span style={{ fontSize: 14, fontWeight: 500, color: c }}>{v}</span>
            <span style={{ fontSize: 12, color: 'var(--label-3)', marginLeft: 4 }}>{l}</span>
          </div>
        ))}
      </div>

      {rank > 0 && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--divider-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Trophy size={14} color="var(--accent-blue)" />
          <span style={{ fontSize: 13, color: 'var(--label-3)' }}>Ranking <span style={{ color: 'var(--accent-blue)', fontWeight: 500 }}>#{rank.toLocaleString()}</span></span>
        </div>
      )}
    </div>
  );
}

/* ─── Codeforces card ────────────────────────────────────────────────── */
function CodeforcesCard({ data }) {
  const total  = data?.totalSolved ?? 0;
  const rating = data?.ranking     ?? 0;

  return (
    <div style={{
      ...card,
      background: 'linear-gradient(145deg,#0f1729 0%,#0d1422 100%)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 160, height: 160, borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(59,130,246,0.12) 0%,transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🔥</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>Codeforces</div>
            {data?.fetchedAt && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Updated {new Date(data.fetchedAt).toLocaleDateString()}</div>}
          </div>
        </div>
        {rating > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 99, background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)' }}>
            <Star size={11} color="var(--accent-yellow)" />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-yellow)' }}>{rating}</span>
          </div>
        )}
      </div>

      <BigNum value={total} color="var(--accent-blue)" />
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2, marginBottom: 14 }}>problems solved</div>

      {rating > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
          <TrendingUp size={13} color="var(--accent-blue)" />
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Rating <strong style={{ color: 'var(--accent-blue)' }}>{rating}</strong></span>
        </div>
      )}
    </div>
  );
}

/* ─── Circular progress ring ─────────────────────────────────────────── */
function Ring({ pct, color, size = 80, stroke = 7 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * (pct / 100);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
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

/* ─── Sheet progress card ────────────────────────────────────────────── */
const SHEET_META = {
  'striver-az':    { label: 'Striver A-Z', color: 'var(--accent-blue)' },
  'neetcode-150':  { label: 'NeetCode 150', color: 'var(--accent-yellow)' },
  'blind-75':      { label: 'Blind 75',    color: 'var(--brand-blue)' },
  'striver-sde':   { label: 'Striver SDE', color: 'var(--brand-yellow)' },
};

function SheetCard({ sheet, index }) {
  const meta  = SHEET_META[sheet.sheetName] || { label: sheet.sheetName, color: '#4f8ef7' };
  const pct   = sheet.percentage ?? 0;

  return (
    <Link
      to={`/sheets/${sheet.sheetName}`}
      style={{
        ...card, padding: '20px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        textDecoration: 'none',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.25), 0 0 0 1px ${meta.color}30`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      <div style={{ position: 'relative' }}>
        <Ring pct={pct} color={meta.color} size={90} stroke={8} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: meta.color, letterSpacing: '-0.5px' }}>{pct}%</span>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{meta.label}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{sheet.completed} / {sheet.total}</div>
      </div>
      <div style={{ fontSize: 11, color: meta.color, display: 'flex', alignItems: 'center', gap: 4, opacity: 0.8 }}>
        View <ArrowRight size={11} />
      </div>
    </Link>
  );
}

/* ─── Stat chip ─────────────────────────────────────────────────────── */
function Chip({ label, value, color }) {
  return (
    <div style={{ padding: '14px 16px', borderRadius: 14, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: '-0.5px' }}>{value ?? 0}</span>
      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div style={{ ...card, padding: '60px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--gradient-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(59,130,246,0.3)' }}>
        <FileUp size={28} color="white" />
      </div>
      <div>
        <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>No data yet</p>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 6, maxWidth: 360, lineHeight: 1.6 }}>
          Log in to LeetCode, visit the API URL, and paste the JSON in Import to start tracking your progress.
        </p>
      </div>
      <Link
        to="/import"
        style={{ padding: '10px 22px', borderRadius: 12, background: 'var(--gradient-blue)', color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 14px rgba(59,130,246,0.35)' }}
      >
        Import LeetCode Data →
      </Link>
    </div>
  );
}

/* ─── Dashboard ──────────────────────────────────────────────────────── */
export default function Dashboard() {
  const { allStats, sheets, fetchAllStats, fetchSheets, isLoading } = useStatsStore();

  useEffect(() => { fetchAllStats(); fetchSheets(); }, []);

  const lc = allStats?.leetcode;
  const cf = allStats?.codeforces;
  const hasData = !!(lc || cf);

  // Total solved (LeetCode only for sheets matching)
  const lcTotal  = lc?.totalSolved  ?? 0;
  const lcEasy   = lc?.easySolved   ?? 0;
  const lcMedium = lc?.mediumSolved ?? 0;
  const lcHard   = lc?.hardSolved   ?? 0;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
          {hasData ? 'Your coding progress at a glance' : 'Import your data to get started'}
        </p>
      </div>

      {/* ── Loading skeletons ───────────────────────────────────────────── */}
      {isLoading && !hasData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 180 }} />)}
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {!isLoading && !hasData && <EmptyState />}

      {hasData && (
        <>
          {/* ── Platform cards ──────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
            {lc && <LeetCodeCard data={lc} />}
            {cf && <CodeforcesCard data={cf} />}

            {/* Combined quick stats */}
            {lc && (
              <div style={{ ...card, padding: '24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Difficulty Breakdown</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <Chip label="Easy"   value={lcEasy}   color="var(--easy)"   />
                  <Chip label="Medium" value={lcMedium} color="var(--medium)" />
                  <Chip label="Hard"   value={lcHard}   color="var(--hard)"   />
                </div>
                <DiffBar easy={lcEasy} medium={lcMedium} hard={lcHard} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={13} color="var(--emerald)" />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lcTotal.toLocaleString()} total solved on LeetCode</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Sheet progress ───────────────────────────────────────────── */}
          {sheets.length > 0 && (
            <div style={{ ...card, padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Sheet Progress</h2>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Track your DSA problem-solving journey</p>
                </div>
                <Link to="/sheets" style={{ fontSize: 12, color: 'var(--blue)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                  View all <ArrowRight size={12} />
                </Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 14 }}>
                {sheets.map((s, i) => <SheetCard key={s.sheetName} sheet={s} index={i} />)}
              </div>
            </div>
          )}

        </>
      )}
    </div>
  );
}
