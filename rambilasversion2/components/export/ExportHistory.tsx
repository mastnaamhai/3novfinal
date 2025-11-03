import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface ExportRecord {
  id: string;
  type: string;
  format: string;
  filename: string;
  recordCount: number;
  createdAt: string;
  size: string;
  status: 'completed' | 'failed' | 'in-progress';
}

export const ExportHistory: React.FC = () => {
  const [exports, setExports] = useState<ExportRecord[]>([]);
  const [filter, setFilter] = useState('all');

  // Mock data for demonstration - in real app, this would come from localStorage or API
  useEffect(() => {
    const mockExports: ExportRecord[] = [
      {
        id: '1',
        type: 'Quick Export',
        format: 'CSV',
        filename: 'lorry-receipts-2024-01-15.csv',
        recordCount: 45,
        createdAt: '2024-01-15T10:30:00Z',
        size: '2.3 MB',
        status: 'completed'
      },
      {
        id: '2',
        type: 'GSTR-1',
        format: 'CSV',
        filename: 'GSTR-1-current-month-2024-01-15.csv',
        recordCount: 23,
        createdAt: '2024-01-15T09:15:00Z',
        size: '1.8 MB',
        status: 'completed'
      },
      {
        id: '3',
        type: 'Full Backup',
        format: 'JSON',
        filename: 'complete-data-backup-2024-01-14.json',
        recordCount: 156,
        createdAt: '2024-01-14T18:45:00Z',
        size: '5.7 MB',
        status: 'completed'
      },
      {
        id: '4',
        type: 'Advanced Export',
        format: 'Excel',
        filename: 'custom-export-2024-01-13.xlsx',
        recordCount: 67,
        createdAt: '2024-01-13T14:20:00Z',
        size: '3.1 MB',
        status: 'completed'
      },
      {
        id: '5',
        type: 'GSTR-3B',
        format: 'XML',
        filename: 'GSTR-3B-current-month-2024-01-12.xml',
        recordCount: 23,
        createdAt: '2024-01-12T16:30:00Z',
        size: '1.2 MB',
        status: 'failed'
      }
    ];
    setExports(mockExports);
  }, []);

  const filteredExports = exports.filter(exp => {
    if (filter === 'all') return true;
    if (filter === 'completed') return exp.status === 'completed';
    if (filter === 'failed') return exp.status === 'failed';
    if (filter === 'in-progress') return exp.status === 'in-progress';
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'in-progress':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Quick Export':
        return '⚡';
      case 'GSTR-1':
      case 'GSTR-3B':
        return '📊';
      case 'Full Backup':
        return '💾';
      case 'Advanced Export':
        return '🔧';
      default:
        return '📄';
    }
  };

  const handleDownload = (exportRecord: ExportRecord) => {
    // In a real app, this would download the actual file
    alert(`Downloading ${exportRecord.filename}...`);
  };

  const handleDelete = (exportId: string) => {
    if (window.confirm('Are you sure you want to delete this export record?')) {
      setExports(prev => prev.filter(exp => exp.id !== exportId));
    }
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all export history?')) {
      setExports([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Export History</h3>
          <p className="text-gray-600 mt-1">View and manage your previous exports</p>
        </div>
        <Button variant="secondary" onClick={clearHistory} disabled={exports.length === 0}>
          Clear History
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'secondary'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All ({exports.length})
          </Button>
          <Button
            variant={filter === 'completed' ? 'primary' : 'secondary'}
            onClick={() => setFilter('completed')}
            size="sm"
          >
            Completed ({exports.filter(e => e.status === 'completed').length})
          </Button>
          <Button
            variant={filter === 'failed' ? 'primary' : 'secondary'}
            onClick={() => setFilter('failed')}
            size="sm"
          >
            Failed ({exports.filter(e => e.status === 'failed').length})
          </Button>
          <Button
            variant={filter === 'in-progress' ? 'primary' : 'secondary'}
            onClick={() => setFilter('in-progress')}
            size="sm"
          >
            In Progress ({exports.filter(e => e.status === 'in-progress').length})
          </Button>
        </div>
      </Card>

      {/* Export List */}
      {filteredExports.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No exports found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'You haven\'t created any exports yet.' 
                : `No ${filter} exports found.`
              }
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredExports.map((exportRecord) => (
            <Card key={exportRecord.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{getTypeIcon(exportRecord.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-800">{exportRecord.filename}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exportRecord.status)}`}>
                        {exportRecord.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{exportRecord.type}</span> • 
                      <span className="ml-1">{exportRecord.format}</span> • 
                      <span className="ml-1">{exportRecord.recordCount} records</span> • 
                      <span className="ml-1">{exportRecord.size}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(exportRecord.createdAt)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {exportRecord.status === 'completed' && (
                    <Button
                      onClick={() => handleDownload(exportRecord)}
                      size="sm"
                      variant="secondary"
                    >
                      Download
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDelete(exportRecord.id)}
                    size="sm"
                    variant="destructive"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Statistics */}
      <Card title="Export Statistics">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{exports.length}</div>
            <div className="text-sm text-blue-700">Total Exports</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {exports.filter(e => e.status === 'completed').length}
            </div>
            <div className="text-sm text-green-700">Successful</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {exports.filter(e => e.status === 'failed').length}
            </div>
            <div className="text-sm text-red-700">Failed</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {exports.reduce((sum, e) => sum + e.recordCount, 0)}
            </div>
            <div className="text-sm text-purple-700">Total Records</div>
          </div>
        </div>
      </Card>
    </div>
  );
};
