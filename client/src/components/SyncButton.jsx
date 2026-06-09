import { RefreshCw } from 'lucide-react';
import clsx from 'clsx';

export default function SyncButton({ isSyncing, onClick, children = 'Sync Now', className = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={isSyncing}
      className={clsx(
        'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity',
        isSyncing && 'cursor-not-allowed',
        className
      )}
      style={{
        background: 'var(--gradient-primary)',
        opacity: isSyncing ? 0.6 : 1,
      }}
    >
      <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
      {isSyncing ? 'Syncing…' : children}
    </button>
  );
}
