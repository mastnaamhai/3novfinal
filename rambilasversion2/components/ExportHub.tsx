import React, { useState } from 'react';
import type { CompanyInfo, LorryReceipt, Invoice, Payment, Customer, TruckHiringNote } from '../types';
import { Card } from './ui/Card';
import { QuickExports } from './export/QuickExports';
import { AdvancedExports } from './export/AdvancedExports';
import { GSTReturns } from './export/GSTReturns';
import { BackupRestore } from './export/BackupRestore';
import { ExportHistory } from './export/ExportHistory';

interface ExportHubProps {
  lorryReceipts: LorryReceipt[];
  invoices: Invoice[];
  payments: Payment[];
  customers: Customer[];
  truckHiringNotes: TruckHiringNote[];
  onPasswordChange: (currentPassword: string, newPassword: string) => Promise<{success: boolean, message: string}>;
  onResetData: () => Promise<void>;
  onResetBusinessData?: (password: string) => Promise<void>;
  onResetAllData?: (password: string) => Promise<void>;
  onBackup: () => Promise<void>;
  onRestore: (data: any) => Promise<void>;
}

export const ExportHub: React.FC<ExportHubProps> = (props) => {
  const [activeSection, setActiveSection] = useState('quick');

  const sections = [
    { key: 'quick', label: 'Quick Exports', icon: '⚡', description: 'One-click exports for common data' },
    { key: 'advanced', label: 'Advanced Exports', icon: '🔧', description: 'Custom exports with filters and templates' },
    { key: 'gst', label: 'GST Returns', icon: '📊', description: 'GSTR-1, GSTR-3B and GST compliance exports' },
    { key: 'backup', label: 'Backup & Restore', icon: '💾', description: 'Data backup, restore and management' },
    { key: 'history', label: 'Export History', icon: '📋', description: 'View and download previous exports' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Export & Backup Hub</h2>
          <p className="text-gray-600 mt-1">Manage all your data exports, GST returns, and backups in one place</p>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto" aria-label="Export sections">
          {sections.map(section => (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeSection === section.key 
                  ? 'border-indigo-500 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="text-lg">{section.icon}</span>
              <div className="text-left">
                <div>{section.label}</div>
                <div className="text-xs text-gray-400 hidden sm:block">{section.description}</div>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Section Content */}
      <div className="mt-6">
        {activeSection === 'quick' && <QuickExports {...props} />}
        {activeSection === 'advanced' && <AdvancedExports {...props} />}
        {activeSection === 'gst' && <GSTReturns {...props} />}
        {activeSection === 'backup' && <BackupRestore {...props} />}
        {activeSection === 'history' && <ExportHistory {...props} />}
      </div>
    </div>
  );
};
