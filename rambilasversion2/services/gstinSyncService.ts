import { API_BASE_URL } from '../constants';
import { getAuthHeader } from './authService';
import { syncGstinData } from './gstinService';

// Sync configuration
const SYNC_CONFIG = {
  // Sync GSTINs older than 30 days
  MAX_AGE_DAYS: 30,
  // Batch size for API calls
  BATCH_SIZE: 10,
  // Delay between batches (ms)
  BATCH_DELAY: 1000,
  // Maximum retries for failed syncs
  MAX_RETRIES: 3,
};

interface SyncStats {
  total: number;
  synced: number;
  failed: number;
  skipped: number;
  errors: string[];
}

// Get customers with GSTINs that need syncing
const getCustomersForSync = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/customers/sync-candidates`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch customers for sync');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching customers for sync:', error);
    return [];
  }
};

// Sync a single GSTIN
const syncSingleGstin = async (gstin: string, retryCount = 0): Promise<{ success: boolean; error?: string }> => {
  try {
    await syncGstinData(gstin);
    return { success: true };
  } catch (error: any) {
    console.error(`Error syncing GSTIN ${gstin}:`, error);
    
    if (retryCount < SYNC_CONFIG.MAX_RETRIES) {
      console.log(`Retrying sync for GSTIN ${gstin} (attempt ${retryCount + 1})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
      return syncSingleGstin(gstin, retryCount + 1);
    }
    
    return { success: false, error: error.message };
  }
};

// Sync GSTINs in batches
const syncBatch = async (gstins: string[]): Promise<SyncStats> => {
  const stats: SyncStats = {
    total: gstins.length,
    synced: 0,
    failed: 0,
    skipped: 0,
    errors: []
  };

  for (const gstin of gstins) {
    try {
      const result = await syncSingleGstin(gstin);
      if (result.success) {
        stats.synced++;
      } else {
        stats.failed++;
        stats.errors.push(`${gstin}: ${result.error}`);
      }
    } catch (error: any) {
      stats.failed++;
      stats.errors.push(`${gstin}: ${error.message}`);
    }
  }

  return stats;
};

// Main sync function
export const syncAllGstinData = async (): Promise<SyncStats> => {
  console.log('Starting GSTIN data sync...');
  
  const customers = await getCustomersForSync();
  
  if (customers.length === 0) {
    console.log('No customers need syncing');
    return {
      total: 0,
      synced: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };
  }

  console.log(`Found ${customers.length} customers with GSTINs to sync`);

  const gstins = customers
    .filter(customer => customer.gstin)
    .map(customer => customer.gstin);

  const totalStats: SyncStats = {
    total: gstins.length,
    synced: 0,
    failed: 0,
    skipped: 0,
    errors: []
  };

  // Process in batches
  for (let i = 0; i < gstins.length; i += SYNC_CONFIG.BATCH_SIZE) {
    const batch = gstins.slice(i, i + SYNC_CONFIG.BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / SYNC_CONFIG.BATCH_SIZE) + 1}/${Math.ceil(gstins.length / SYNC_CONFIG.BATCH_SIZE)}`);
    
    const batchStats = await syncBatch(batch);
    
    totalStats.synced += batchStats.synced;
    totalStats.failed += batchStats.failed;
    totalStats.errors.push(...batchStats.errors);

    // Delay between batches
    if (i + SYNC_CONFIG.BATCH_SIZE < gstins.length) {
      await new Promise(resolve => setTimeout(resolve, SYNC_CONFIG.BATCH_DELAY));
    }
  }

  console.log('GSTIN sync completed:', totalStats);
  return totalStats;
};

// Schedule periodic sync
let syncInterval: NodeJS.Timeout | null = null;

export const startPeriodicSync = (intervalHours = 24) => {
  if (syncInterval) {
    clearInterval(syncInterval);
  }

  const intervalMs = intervalHours * 60 * 60 * 1000;
  
  console.log(`Starting periodic GSTIN sync every ${intervalHours} hours`);
  
  syncInterval = setInterval(async () => {
    try {
      await syncAllGstinData();
    } catch (error) {
      console.error('Error during periodic sync:', error);
    }
  }, intervalMs);

  // Run initial sync after 1 minute
  setTimeout(async () => {
    try {
      await syncAllGstinData();
    } catch (error) {
      console.error('Error during initial sync:', error);
    }
  }, 60000);
};

export const stopPeriodicSync = () => {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
    console.log('Periodic GSTIN sync stopped');
  }
};

// Manual sync trigger
export const triggerManualSync = async (): Promise<SyncStats> => {
  console.log('Manual GSTIN sync triggered');
  return await syncAllGstinData();
};
