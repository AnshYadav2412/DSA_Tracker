import { useState, useEffect, useCallback } from 'react';
import { syncApi } from '../api/index.js';

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  useEffect(() => {
    syncApi.getStatus()
      .then((s) => {
        setIsSyncing(s.isSyncing);
        setLastSyncedAt(s.lastSyncedAt);
      })
      .catch(() => {});
  }, []);

  const syncNow = useCallback(async () => {
    try {
      setIsSyncing(true);
      const result = await syncApi.syncAll();
      setLastSyncedAt(result.lastSyncedAt);
    } catch (err) {
      console.error('Sync failed:', err.message);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return { isSyncing, lastSyncedAt, syncNow };
}
