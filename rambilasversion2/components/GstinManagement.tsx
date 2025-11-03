import { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { getGstinCacheStats, clearGstinCache } from '../services/gstinService';
import { triggerManualSync, startPeriodicSync, stopPeriodicSync } from '../services/gstinSyncService';

interface CacheStats {
  size: number;
  entries: Array<{
    gstin: string;
    lastFetched: string;
    source: 'api' | 'local';
  }>;
}

export const GstinManagement = () => {
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'completed' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');
  const [periodicSyncEnabled, setPeriodicSyncEnabled] = useState(false);

  const loadCacheStats = async () => {
    try {
      const stats = getGstinCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Error loading cache stats:', error);
    }
  };

  const handleClearCache = async () => {
    if (window.confirm('Are you sure you want to clear the GSTIN cache? This will remove all cached data.')) {
      try {
        clearGstinCache();
        await loadCacheStats();
        setSyncMessage('Cache cleared successfully');
      } catch (error) {
        setSyncMessage('Error clearing cache');
      }
    }
  };

  const handleManualSync = async () => {
    setIsLoading(true);
    setSyncStatus('syncing');
    setSyncMessage('Starting manual sync...');

    try {
      const result = await triggerManualSync();
      setSyncStatus('completed');
      setSyncMessage(`Sync completed: ${result.synced} synced, ${result.failed} failed, ${result.skipped} skipped`);
    } catch (error: any) {
      setSyncStatus('error');
      setSyncMessage(`Sync failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePeriodicSync = () => {
    if (periodicSyncEnabled) {
      stopPeriodicSync();
      setPeriodicSyncEnabled(false);
      setSyncMessage('Periodic sync disabled');
    } else {
      startPeriodicSync(24); // 24 hours
      setPeriodicSyncEnabled(true);
      setSyncMessage('Periodic sync enabled (every 24 hours)');
    }
  };

  useEffect(() => {
    loadCacheStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-800">GSTIN Data Management</h3>
        <p className="text-gray-600 mt-1">Manage GSTIN caching and synchronization</p>
      </div>

      {/* Cache Statistics */}
      <Card title="Cache Statistics">
        <div className="space-y-4">
          {cacheStats ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{cacheStats.size}</div>
                  <div className="text-sm text-blue-800">Cached GSTINs</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {cacheStats.entries.filter(e => e.source === 'local').length}
                  </div>
                  <div className="text-sm text-green-800">From Database</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {cacheStats.entries.filter(e => e.source === 'api').length}
                  </div>
                  <div className="text-sm text-orange-800">From API</div>
                </div>
              </div>

              {cacheStats.entries.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Recent Cached GSTINs</h4>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {cacheStats.entries.slice(0, 10).map((entry, index) => (
                      <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                        <span className="font-mono">{entry.gstin}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            entry.source === 'local' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {entry.source === 'local' ? 'DB' : 'API'}
                          </span>
                          <span className="text-gray-500">
                            {new Date(entry.lastFetched).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4 text-gray-500">Loading cache statistics...</div>
          )}
        </div>
      </Card>

      {/* Cache Management */}
      <Card title="Cache Management">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={loadCacheStats}
              variant="secondary"
              className="flex-1"
            >
              Refresh Statistics
            </Button>
            <Button
              onClick={handleClearCache}
              variant="outline"
              className="flex-1"
            >
              Clear Cache
            </Button>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Cache Information</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Clearing the cache will remove all cached GSTIN data from memory. This will force fresh API calls for previously cached GSTINs.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Sync Management */}
      <Card title="Data Synchronization">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleManualSync}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Syncing...' : 'Manual Sync'}
            </Button>
            <Button
              onClick={handleTogglePeriodicSync}
              variant={periodicSyncEnabled ? 'danger' : 'secondary'}
              className="flex-1"
            >
              {periodicSyncEnabled ? 'Disable Auto Sync' : 'Enable Auto Sync'}
            </Button>
          </div>

          {syncMessage && (
            <div className={`p-3 rounded-lg ${
              syncStatus === 'error' ? 'bg-red-50 text-red-700' :
              syncStatus === 'completed' ? 'bg-green-50 text-green-700' :
              'bg-blue-50 text-blue-700'
            }`}>
              {syncMessage}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Sync Information</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Manual sync updates all GSTINs older than 30 days</li>
                    <li>Auto sync runs every 24 hours automatically</li>
                    <li>Sync only updates data from external API when needed</li>
                    <li>Local database is always checked first to save API costs</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
