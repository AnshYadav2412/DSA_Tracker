import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  Home, FileUp, ListChecks, Settings,
  Menu, X,
} from 'lucide-react';
import SyncBanner from './SyncBanner.jsx';

const NAV = [
  { to: '/',        icon: Home,       label: 'Dashboard', exact: true },
  { to: '/import',  icon: FileUp,    label: 'Import'    },
  { to: '/sheets',  icon: ListChecks, label: 'Sheets'    },
  { to: '/settings',icon: Settings,   label: 'Settings'  },
];

function NavItem({ to, icon: Icon, label, exact, onClick }) {
  return (
    <NavLink
      to={to}
      end={exact}
      onClick={onClick}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 500,
        textDecoration: 'none',
        transition: 'all 0.15s',
        background: isActive ? 'var(--bg-fill-3)' : 'transparent',
        color: isActive ? 'var(--label-1)' : 'var(--label-3)',
      })}
      onMouseEnter={(e) => { 
        if (!e.currentTarget.classList.contains('active')) {
          e.currentTarget.style.background = 'var(--bg-hover)';
        }
      }}
      onMouseLeave={(e) => { 
        if (!e.currentTarget.classList.contains('active')) {
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      <Icon size={16} style={{ flexShrink: 0 }} />
      <span>{label}</span>
    </NavLink>
  );
}

function Sidebar({ onClose }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--bg-secondary)',
    }}>
      {/* Logo */}
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="28" height="28" viewBox="0 0 95 111" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>
            <path d="M68.0063 83.0664C70.5 80.5764 74.5366 80.5829 77.0223 83.0809C79.508 85.579 79.5015 89.6226 77.0078 92.1127L65.9346 103.17C55.7187 113.371 39.06 113.519 28.6718 103.513C28.6117 103.456 23.9861 98.9201 8.72653 83.957C-1.42528 74.0029 -2.43665 58.0749 7.11648 47.8464L24.9282 28.7745C34.4814 18.5459 51.1535 17.9316 61.4825 27.8885L72.5542 38.9607C75.0479 41.4508 75.0414 45.4944 72.5471 47.9845C70.0528 50.4746 66.0162 50.4681 63.5225 47.978L52.4508 36.9058C47.3483 31.8035 39.1282 32.1845 34.5604 37.0425C34.5604 37.0425 34.5604 37.0425 34.5604 37.0425L16.7486 56.1144C11.8612 61.3002 12.2651 69.578 17.6569 74.2015C32.9156 89.1655 37.5417 93.6485 37.6052 93.708C42.1803 98.2069 49.2448 98.0216 53.6219 93.3266L68.0063 83.0664Z" fill="url(#logoGradient)"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M41.1067 72.0014C37.5858 72.0014 34.7314 69.1421 34.7314 65.615C34.7314 62.0879 37.5858 59.2286 41.1067 59.2286H88.1245C91.6454 59.2286 94.4997 62.0879 94.4997 65.615C94.4997 69.1421 91.6454 72.0014 88.1245 72.0014H41.1067Z" fill="url(#logoGradient)"/>
          </svg>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--label-1)' }}>
              DSA Tracker
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--divider-1)', margin: '0 12px' }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {NAV.map(item => <NavItem key={item.to} {...item} onClick={onClose} />)}
      </nav>
    </div>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)' }}>

      {/* Desktop sidebar */}
      <aside style={{
        width: 220, flexShrink: 0,
        borderRight: '1px solid var(--divider-1)',
        display: 'none',
      }} className="lg:!flex lg:!flex-col">
        <Sidebar />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setOpen(false)}
        >
          <aside
            style={{ width: 260, height: '100%', borderRight: '1px solid var(--divider-1)' }}
            onClick={e => e.stopPropagation()}
          >
            <Sidebar onClose={() => setOpen(false)} />
          </aside>
          <button
            style={{ position: 'absolute', top: 16, left: 268, color: 'var(--label-2)', background: 'var(--bg-layer-1)', border: '1px solid var(--divider-1)', borderRadius: 6, padding: '6px 8px', cursor: 'pointer' }}
            onClick={() => setOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Mobile topbar */}
        <header style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
          background: 'var(--bg-secondary)', borderBottom: '1px solid var(--divider-1)',
        }} className="lg:hidden">
          <button onClick={() => setOpen(true)} style={{ color: 'var(--label-2)', padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <Menu size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="24" height="24" viewBox="0 0 95 111" fill="none">
              <defs>
                <linearGradient id="logoGradientMobile" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
              <path d="M68.0063 83.0664C70.5 80.5764 74.5366 80.5829 77.0223 83.0809C79.508 85.579 79.5015 89.6226 77.0078 92.1127L65.9346 103.17C55.7187 113.371 39.06 113.519 28.6718 103.513C28.6117 103.456 23.9861 98.9201 8.72653 83.957C-1.42528 74.0029 -2.43665 58.0749 7.11648 47.8464L24.9282 28.7745C34.4814 18.5459 51.1535 17.9316 61.4825 27.8885L72.5542 38.9607C75.0479 41.4508 75.0414 45.4944 72.5471 47.9845C70.0528 50.4746 66.0162 50.4681 63.5225 47.978L52.4508 36.9058C47.3483 31.8035 39.1282 32.1845 34.5604 37.0425L16.7486 56.1144C11.8612 61.3002 12.2651 69.578 17.6569 74.2015C32.9156 89.1655 37.5417 93.6485 37.6052 93.708C42.1803 98.2069 49.2448 98.0216 53.6219 93.3266L68.0063 83.0664Z" fill="url(#logoGradientMobile)"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M41.1067 72.0014C37.5858 72.0014 34.7314 69.1421 34.7314 65.615C34.7314 62.0879 37.5858 59.2286 41.1067 59.2286H88.1245C91.6454 59.2286 94.4997 62.0879 94.4997 65.615C94.4997 69.1421 91.6454 72.0014 88.1245 72.0014H41.1067Z" fill="url(#logoGradientMobile)"/>
            </svg>
            <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--label-1)' }}>DSA Tracker</span>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }} className="lg:!px-24">
          <SyncBanner />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
