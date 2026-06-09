import { useEffect } from 'react';
import useStatsStore from '../store/useStatsStore.js';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const PLATFORM_LABELS = { leetcode: 'LeetCode', gfg: 'GeeksForGeeks', codeforces: 'Codeforces' };
const PLATFORM_COLORS = { leetcode: '#f59e0b', gfg: '#10b981', codeforces: '#3b82f6' };
const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#f97316'];

export default function Analytics() {
  const { allStats, sheets, fetchAllStats, fetchSheets, isLoading } = useStatsStore();

  useEffect(() => {
    fetchAllStats();
    fetchSheets();
  }, []);

  if (isLoading && !allStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const hasData = allStats && Object.keys(allStats).length > 0;

  // Platform comparison data
  const platformData = Object.entries(allStats || {}).map(([key, val]) => ({
    name: PLATFORM_LABELS[key] || key,
    Easy: val.easySolved || 0,
    Medium: val.mediumSolved || 0,
    Hard: val.hardSolved || 0,
    Total: val.totalSolved || 0,
    color: PLATFORM_COLORS[key] || '#8b5cf6',
  }));

  // Aggregate difficulty
  const totalEasy = platformData.reduce((s, p) => s + p.Easy, 0);
  const totalMedium = platformData.reduce((s, p) => s + p.Medium, 0);
  const totalHard = platformData.reduce((s, p) => s + p.Hard, 0);

  const diffData = [
    { name: 'Easy', value: totalEasy, color: '#10b981' },
    { name: 'Medium', value: totalMedium, color: '#f59e0b' },
    { name: 'Hard', value: totalHard, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  // Radar — platform vs difficulty
  const radarData = [
    { subject: 'Easy', ...Object.fromEntries(Object.entries(allStats || {}).map(([k, v]) => [PLATFORM_LABELS[k], v.easySolved || 0])) },
    { subject: 'Medium', ...Object.fromEntries(Object.entries(allStats || {}).map(([k, v]) => [PLATFORM_LABELS[k], v.mediumSolved || 0])) },
    { subject: 'Hard', ...Object.fromEntries(Object.entries(allStats || {}).map(([k, v]) => [PLATFORM_LABELS[k], v.hardSolved || 0])) },
  ];

  // Sheet progress for bar chart
  const sheetData = sheets.map((s) => ({
    name: s.sheetName,
    completed: s.completed,
    remaining: s.total - s.completed,
    pct: s.percentage,
  }));

  const cardStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' };
  const tooltipStyle = {
    contentStyle: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '12px' },
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Analytics</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Deep dive into your cross-platform performance</p>
      </div>

      {!hasData && (
        <div className="rounded-2xl p-8 text-center" style={cardStyle}>
          <p style={{ color: 'var(--text-muted)' }}>No platform data yet — sync your accounts from the Sync page to see analytics.</p>
        </div>
      )}

      {hasData && (
        <>
          {/* Summary pills */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Solved', val: platformData.reduce((s, p) => s + p.Total, 0), color: '#3b82f6' },
              { label: 'Easy', val: totalEasy, color: '#10b981' },
              { label: 'Medium', val: totalMedium, color: '#f59e0b' },
              { label: 'Hard', val: totalHard, color: '#ef4444' },
            ].map(({ label, val, color }) => (
              <div key={label} style={cardStyle} className="text-center">
                <p className="text-2xl font-bold" style={{ color }}>{val}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Platform stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(allStats).map(([key, val]) => (
              <div key={key} style={cardStyle} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{PLATFORM_LABELS[key]}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${PLATFORM_COLORS[key]}22`, color: PLATFORM_COLORS[key] }}>
                    {val.totalSolved || 0} solved
                  </span>
                </div>
                {val.ranking > 0 && (
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {key === 'codeforces' ? `Rating: ${val.ranking}` : `Rank: #${val.ranking?.toLocaleString()}`}
                  </p>
                )}
                {val.streak > 0 && (
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>🔥 {val.streak} day streak</p>
                )}
                <div className="space-y-1.5">
                  {[['Easy', val.easySolved, '#10b981'], ['Medium', val.mediumSolved, '#f59e0b'], ['Hard', val.hardSolved, '#ef4444']].map(([d, v, c]) => (
                    <div key={d} className="flex justify-between text-xs">
                      <span style={{ color: c }}>{d}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{v || 0}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Last synced: {val.fetchedAt ? new Date(val.fetchedAt).toLocaleString() : 'Never'}
                </p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div style={cardStyle}>
              <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Difficulty Radar by Platform</h2>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                  <PolarRadiusAxis tick={{ fill: 'var(--text-muted)', fontSize: 9 }} />
                  {Object.entries(allStats).map(([key], i) => (
                    <Radar key={key} name={PLATFORM_LABELS[key]} dataKey={PLATFORM_LABELS[key]}
                      stroke={PLATFORM_COLORS[key]} fill={PLATFORM_COLORS[key]} fillOpacity={0.25} />
                  ))}
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div style={cardStyle}>
              <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Difficulty Distribution</h2>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={diffData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} paddingAngle={4}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: 'var(--text-muted)' }}>
                    {diffData.map((_, i) => <Cell key={i} fill={diffData[i].color} />)}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sheet progress */}
          {sheetData.length > 0 && (
            <div style={cardStyle}>
              <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>DSA Sheet Progress</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={sheetData} layout="vertical" margin={{ left: 10, right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} width={110} />
                  <Tooltip {...tooltipStyle} formatter={(v, n) => [v, n === 'completed' ? 'Completed' : 'Remaining']} />
                  <Bar dataKey="completed" fill="#3b82f6" radius={[0, 0, 0, 0]} name="Completed" stackId="a" />
                  <Bar dataKey="remaining" fill="var(--border-light)" radius={[0, 6, 6, 0]} name="Remaining" stackId="a" />
                  <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: '12px' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}
