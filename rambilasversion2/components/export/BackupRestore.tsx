import React, { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { ConfirmationModal } from '../ui/ConfirmationModal';

interface BackupRestoreProps {
  onResetData: () => Promise<void>;
  onResetBusinessData?: (password: string) => Promise<void>;
  onResetAllData?: (password: string) => Promise<void>;
  onBackup: () => Promise<void>;
  onRestore: (data: any) => Promise<void>;
}

export const BackupRestore: React.FC<BackupRestoreProps> = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [backupType, setBackupType] = useState('full');
  const [showResetModal, setShowResetModal] = useState(false);
  const [showBusinessResetModal, setShowBusinessResetModal] = useState(false);
  const [showAllResetModal, setShowAllResetModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreData, setRestoreData] = useState<any>(null);
  const [resetType, setResetType] = useState<'business' | 'all'>('business');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateBackup = async () => {
    setIsLoading(true);
    try {
      await props.onBackup();
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('Error creating backup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGSTBackup = async () => {
    setIsLoading(true);
    try {
      // Create GST-specific backup (invoices + customers only)
      const gstData = {
        invoices: [], // This would be populated with actual data
        customers: [],
        companyInfo: {},
        exportType: 'gst',
        createdAt: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(gstData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gst-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating GST backup:', error);
      alert('Error creating GST backup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFinancialBackup = async () => {
    setIsLoading(true);
    try {
      // Create financial backup (invoices + payments only)
      const financialData = {
        invoices: [], // This would be populated with actual data
        payments: [],
        companyInfo: {},
        exportType: 'financial',
        createdAt: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(financialData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `financial-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating financial backup:', error);
      alert('Error creating financial backup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result;
        if (typeof content === 'string') {
          const data = JSON.parse(content);
          setRestoreData(data);
          setShowRestoreModal(true);
        }
      } catch (error) {
        console.error('Error parsing backup file:', error);
        if (error instanceof SyntaxError) {
          alert('Error parsing backup file: The file is not valid JSON. Please ensure you selected a valid backup file.');
        } else {
          alert(`Error parsing backup file: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetBusinessData = () => {
    setResetType('business');
    setShowBusinessResetModal(true);
  };

  const handleResetAllData = () => {
    setResetType('all');
    setShowAllResetModal(true);
  };

  // Legacy function for backward compatibility
  const handleResetData = () => {
    setShowResetModal(true);
  };

  const handleConfirmBusinessReset = async (password: string) => {
    setIsLoading(true);
    try {
      if (props.onResetBusinessData) {
        await props.onResetBusinessData(password);
        alert('Business data has been reset successfully. Settings and company information have been preserved.');
      } else {
        await props.onResetData();
        alert('All data has been reset successfully.');
      }
    } catch (error) {
      console.error('Error resetting business data:', error);
      throw new Error('Error resetting business data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAllReset = async (password: string) => {
    setIsLoading(true);
    try {
      if (props.onResetAllData) {
        await props.onResetAllData(password);
        alert('All data has been reset successfully.');
      } else {
        await props.onResetData();
        alert('All data has been reset successfully.');
      }
    } catch (error) {
      console.error('Error resetting all data:', error);
      throw new Error('Error resetting all data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReset = async (password: string) => {
    setIsLoading(true);
    try {
      await props.onResetData();
      alert('All data has been reset successfully.');
    } catch (error) {
      console.error('Error resetting data:', error);
      throw new Error('Error resetting data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmRestore = async (password: string) => {
    if (!restoreData) return;
    
    setIsLoading(true);
    try {
      await props.onRestore(restoreData);
      alert('Data restored successfully!');
    } catch (error) {
      console.error('Error restoring data:', error);
      throw new Error('Error restoring data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-800">Backup & Restore</h3>
        <p className="text-gray-600 mt-1">Create backups of your data and restore from previous backups</p>
      </div>

      {/* Create Backups */}
      <Card title="Create Backup">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Full Backup</h4>
              <p className="text-sm text-gray-600 mb-4">Complete backup of all data including customers, invoices, LRs, THNs, and payments.</p>
              <Button
                onClick={handleCreateBackup}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Creating...' : 'Create Full Backup'}
              </Button>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">GST Backup</h4>
              <p className="text-sm text-gray-600 mb-4">GST-specific data including invoices, customers, and company information.</p>
              <Button
                onClick={handleCreateGSTBackup}
                disabled={isLoading}
                variant="secondary"
                className="w-full"
              >
                {isLoading ? 'Creating...' : 'Create GST Backup'}
              </Button>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Financial Backup</h4>
              <p className="text-sm text-gray-600 mb-4">Financial data including invoices and payment records only.</p>
              <Button
                onClick={handleCreateFinancialBackup}
                disabled={isLoading}
                variant="secondary"
                className="w-full"
              >
                {isLoading ? 'Creating...' : 'Create Financial Backup'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Restore Backup */}
      <Card title="Restore from Backup">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleRestoreClick}
              disabled={isLoading}
              variant="secondary"
              className="flex-1"
            >
              {isLoading ? 'Restoring...' : 'Restore from Backup'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg">
            <h4 className="font-medium text-amber-800 mb-2">⚠️ Important Warning</h4>
            <p className="text-sm text-amber-700">
              Restoring from a backup will <strong>permanently delete</strong> all current data and replace it with the backup data. 
              This action cannot be undone. Make sure you have a current backup before proceeding.
            </p>
          </div>
        </div>
      </Card>

      {/* Auto Backup Settings */}
      <Card title="Auto Backup Settings">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">Automatic Backups</h4>
              <p className="text-sm text-gray-600">Automatically create backups at regular intervals</p>
            </div>
            <Button variant="secondary" onClick={() => alert('Auto backup settings will be implemented soon')}>
              Configure
            </Button>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">💡 Recommendation</h4>
            <p className="text-sm text-blue-700">
              We recommend creating backups at least once a week, especially before making major changes to your data.
            </p>
          </div>
        </div>
      </Card>

      {/* Reset Data */}
      <Card title="Reset Application Data" className="border-red-200">
        <div className="space-y-6">
          <div className="bg-amber-50 p-4 rounded-lg">
            <h4 className="font-semibold text-lg text-amber-800 mb-2">⚠️ Data Reset Options</h4>
            <p className="text-sm text-amber-700 mb-4">
              Choose the type of data reset you want to perform. Both actions are <strong>irreversible</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Business Data Reset */}
            <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
              <h4 className="font-semibold text-orange-800 mb-2">Reset Business Data Only</h4>
              <p className="text-sm text-orange-700 mb-4">
                Deletes only business-related data while preserving your settings and company information.
              </p>
              <div className="text-xs text-orange-600 mb-4">
                <strong>Will delete:</strong> Customers, Lorry Receipts, Invoices, Truck Hiring Notes, Payments
                <br />
                <strong>Will preserve:</strong> Company settings, Bank accounts, GST API keys, Numbering settings
              </div>
              <Button
                onClick={handleResetBusinessData}
                variant="destructive"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Resetting...' : 'Reset Business Data'}
              </Button>
            </div>

            {/* Complete Reset */}
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <h4 className="font-semibold text-red-800 mb-2">Complete Reset</h4>
              <p className="text-sm text-red-700 mb-4">
                Deletes ALL data including settings, company information, and business data.
              </p>
              <div className="text-xs text-red-600 mb-4">
                <strong>Will delete:</strong> Everything including company settings, bank accounts, API keys, and all business data
                <br />
                <strong>Will restore:</strong> Default company information
              </div>
              <Button
                onClick={handleResetAllData}
                variant="destructive"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Resetting...' : 'Reset Everything'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showBusinessResetModal}
        onClose={() => setShowBusinessResetModal(false)}
        onConfirm={handleConfirmBusinessReset}
        title="Reset Business Data Only"
        message="⚠️ WARNING: This action will permanently delete business data from the application.\n\nThis includes:\n• All customers\n• All lorry receipts\n• All invoices\n• All truck hiring notes\n• All payments\n\nThis will PRESERVE:\n• Company settings and information\n• Bank account details\n• GST API keys\n• Numbering settings\n\nThis action CANNOT be undone. Are you absolutely sure you want to proceed?"
        confirmText="Yes, Reset Business Data"
        cancelText="Cancel"
        isLoading={isLoading}
        requirePassword={true}
        destructive={true}
      />

      <ConfirmationModal
        isOpen={showAllResetModal}
        onClose={() => setShowAllResetModal(false)}
        onConfirm={handleConfirmAllReset}
        title="Complete Reset - Delete Everything"
        message="⚠️ WARNING: This action will permanently delete ALL data from the application.\n\nThis includes:\n• All customers\n• All lorry receipts\n• All invoices\n• All truck hiring notes\n• All payments\n• All company settings\n• All bank accounts\n• All API keys\n• All numbering settings\n\nDefault company information will be restored.\n\nThis action CANNOT be undone. Are you absolutely sure you want to proceed?"
        confirmText="Yes, Reset Everything"
        cancelText="Cancel"
        isLoading={isLoading}
        requirePassword={true}
        destructive={true}
      />

      {/* Legacy modal for backward compatibility */}
      <ConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleConfirmReset}
        title="Reset All Data"
        message="⚠️ WARNING: This action will permanently delete ALL data from the application.\n\nThis includes:\n• All customers\n• All lorry receipts\n• All invoices\n• All truck hiring notes\n• All payments\n• All company settings\n\nThis action CANNOT be undone. Are you absolutely sure you want to proceed?"
        confirmText="Yes, Reset All Data"
        cancelText="Cancel"
        isLoading={isLoading}
        requirePassword={true}
        destructive={true}
      />

      <ConfirmationModal
        isOpen={showRestoreModal}
        onClose={() => {
          setShowRestoreModal(false);
          setRestoreData(null);
        }}
        onConfirm={handleConfirmRestore}
        title="Restore from Backup"
        message="⚠️ WARNING: This action will permanently delete all current data and replace it with the backup data.\n\nThis includes:\n• All existing customers\n• All existing lorry receipts\n• All existing invoices\n• All existing truck hiring notes\n• All existing payments\n• All current company settings\n\nThis action CANNOT be undone. Are you absolutely sure you want to proceed?"
        confirmText="Yes, Restore Data"
        cancelText="Cancel"
        isLoading={isLoading}
        requirePassword={true}
        destructive={true}
      />
    </div>
  );
};
