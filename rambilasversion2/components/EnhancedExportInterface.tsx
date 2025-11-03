import React, { useState, useEffect, useCallback } from 'react';
import type { CompanyInfo, LorryReceipt, Invoice, Payment, Customer, TruckHiringNote } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { 
    exportData, 
    exportBulkData, 
    getExportTemplates, 
    validateExportData,
    type ExportOptions, 
    type ExportProgress, 
    type ExportTemplate 
} from '../services/exportService';
import { formatDate } from '../services/utils';

interface EnhancedExportInterfaceProps {
    companyInfo: CompanyInfo;
    lorryReceipts: LorryReceipt[];
    invoices: Invoice[];
    payments: Payment[];
    customers: Customer[];
    truckHiringNotes: TruckHiringNote[];
    onBack: () => void;
}

interface ExportJob {
    id: string;
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress: number;
    message: string;
    startTime: Date;
    endTime?: Date;
    fileSize?: number;
    downloadUrl?: string;
}

const DATA_TYPE_OPTIONS = [
    { value: 'customers', label: 'Customers', icon: '👥' },
    { value: 'lorryReceipts', label: 'Lorry Receipts', icon: '📋' },
    { value: 'invoices', label: 'Invoices', icon: '🧾' },
    { value: 'truckHiringNotes', label: 'Truck Hiring Notes', icon: '📝' },
    { value: 'payments', label: 'Payments', icon: '💰' }
];

const FORMAT_OPTIONS = [
    { value: 'csv', label: 'CSV', description: 'Comma-separated values' },
    { value: 'xlsx', label: 'Excel', description: 'Microsoft Excel format' },
    { value: 'json', label: 'JSON', description: 'JavaScript Object Notation' },
    { value: 'zip', label: 'ZIP Archive', description: 'Compressed archive' }
];

const JSON_FORMAT_OPTIONS = [
    { value: 'standard', label: 'Standard JSON', description: 'Simple JSON format' },
    { value: 'gst', label: 'GST Filing', description: 'GST-compliant format for tax filing' },
    { value: 'tax', label: 'Income Tax', description: 'Enhanced format for income tax filing' }
];

const STATUS_FILTER_OPTIONS = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' }
];

export const EnhancedExportInterface: React.FC<EnhancedExportInterfaceProps> = (props) => {
    // Safety check - don't render if props are not loaded yet
    if (!props.customers || !props.lorryReceipts || !props.invoices || !props.payments || !props.truckHiringNotes) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading export data...</p>
                </div>
            </div>
        );
    }

    const [activeTab, setActiveTab] = useState<'quick' | 'custom' | 'templates' | 'scheduled' | 'history'>('quick');
    const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>(['lorryReceipts', 'invoices']);
    const [selectedFormat, setSelectedFormat] = useState<string>('xlsx');
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [customFields, setCustomFields] = useState<string[]>([]);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [filename, setFilename] = useState<string>('');
    const [includeHeaders, setIncludeHeaders] = useState<boolean>(true);
    const [compression, setCompression] = useState<boolean>(false);
    const [jsonFormat, setJsonFormat] = useState<string>('standard');
    const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
    const [templates, setTemplates] = useState<ExportTemplate[]>([]);
    const [isExporting, setIsExporting] = useState<boolean>(false);
    const [currentProgress, setCurrentProgress] = useState<ExportProgress | null>(null);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    // Load templates on mount
    useEffect(() => {
        setTemplates(getExportTemplates());
    }, []);

    // Generate default filename
    useEffect(() => {
        if (!filename) {
            const timestamp = new Date().toISOString().split('T')[0];
            setFilename(`export_${timestamp}`);
        }
    }, [filename]);

    // Get available fields for selected data types
    const getAvailableFields = useCallback(() => {
        const fields = new Set<string>();
        
        selectedDataTypes.forEach(dataType => {
            const data = getDataByType(dataType);
            if (data && data.length > 0) {
                Object.keys(data[0]).forEach(key => fields.add(key));
            }
        });
        
        return Array.from(fields).sort();
    }, [selectedDataTypes]);

    // Get data by type
    const getDataByType = (dataType: string) => {
        switch (dataType) {
            case 'customers': return props.customers || [];
            case 'lorryReceipts': return props.lorryReceipts || [];
            case 'invoices': return props.invoices || [];
            case 'truckHiringNotes': return props.truckHiringNotes || [];
            case 'payments': return props.payments || [];
            default: return [];
        }
    };

    // Prepare data for export
    const prepareExportData = useCallback(() => {
        const dataSets = selectedDataTypes.map(dataType => {
            let data = getDataByType(dataType);
            
            // Apply date range filter
            if (dateRange.start && dateRange.end) {
                data = data.filter(item => {
                    const itemDate = new Date((item as any).date);
                    const startDate = new Date(dateRange.start);
                    const endDate = new Date(dateRange.end);
                    return itemDate >= startDate && itemDate <= endDate;
                });
            }
            
            // Apply status filter
            if (statusFilter !== 'all') {
                data = data.filter(item => (item as any).status === statusFilter);
            }
            
            // Apply custom fields filter
            if (customFields.length > 0) {
                data = data.map(item => {
                    const filteredItem: any = {};
                    customFields.forEach(field => {
                        filteredItem[field] = (item as any)[field];
                    });
                    return filteredItem;
                });
            }
            
            return {
                name: dataType,
                data,
                options: {
                    format: selectedFormat as any,
                    includeHeaders,
                    compression
                }
            };
        });
        
        return dataSets;
    }, [selectedDataTypes, dateRange, statusFilter, customFields, selectedFormat, includeHeaders, compression]);

    // Validate export data
    const validateData = useCallback(() => {
        const dataSets = prepareExportData();
        const allErrors: string[] = [];
        
        dataSets.forEach(dataSet => {
            const validation = validateExportData(dataSet.data);
            if (!validation.isValid) {
                allErrors.push(`${dataSet.name}: ${validation.errors.join(', ')}`);
            }
        });
        
        setValidationErrors(allErrors);
        return allErrors.length === 0;
    }, [prepareExportData]);

    // Handle quick export
    const handleQuickExport = async () => {
        if (!validateData()) {
            return;
        }
        
        setIsExporting(true);
        setCurrentProgress(null);
        
        const jobId = `export_${Date.now()}`;
        const newJob: ExportJob = {
            id: jobId,
            name: filename,
            status: 'running',
            progress: 0,
            message: 'Starting export...',
            startTime: new Date()
        };
        
        setExportJobs(prev => [newJob, ...prev]);
        
        try {
            const dataSets = prepareExportData();
            
            if (dataSets.length === 1) {
                // Single data type export
                const dataSet = dataSets[0];
                await exportData(dataSet.data, {
                    format: selectedFormat as any,
                    filename,
                    includeHeaders,
                    dateRange: dateRange.start && dateRange.end ? {
                        start: new Date(dateRange.start),
                        end: new Date(dateRange.end)
                    } : undefined,
                    filters: statusFilter !== 'all' ? { status: statusFilter } : undefined,
                    customFields: customFields.length > 0 ? customFields : undefined,
                    compression,
                    jsonFormat: selectedFormat === 'json' ? jsonFormat as any : undefined
                }, (progress) => {
                    setCurrentProgress(progress);
                    setExportJobs(prev => prev.map(job => 
                        job.id === jobId 
                            ? { ...job, progress: progress.progress, message: progress.message, status: progress.stage === 'error' ? 'failed' : progress.stage === 'completed' ? 'completed' : 'running' }
                            : job
                    ));
                });
            } else {
                // Bulk export
                await exportBulkData(dataSets, {
                    format: selectedFormat as any,
                    filename,
                    includeHeaders,
                    compression,
                    jsonFormat: selectedFormat === 'json' ? jsonFormat as any : undefined
                }, (progress) => {
                    setCurrentProgress(progress);
                    setExportJobs(prev => prev.map(job => 
                        job.id === jobId 
                            ? { ...job, progress: progress.progress, message: progress.message, status: progress.stage === 'error' ? 'failed' : progress.stage === 'completed' ? 'completed' : 'running' }
                            : job
                    ));
                });
            }
            
            setExportJobs(prev => prev.map(job => 
                job.id === jobId 
                    ? { ...job, status: 'completed', endTime: new Date(), message: 'Export completed successfully!' }
                    : job
            ));
            
        } catch (error) {
            setExportJobs(prev => prev.map(job => 
                job.id === jobId 
                    ? { ...job, status: 'failed', endTime: new Date(), message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}` }
                    : job
            ));
        } finally {
            setIsExporting(false);
            setCurrentProgress(null);
        }
    };

    // Handle template export
    const handleTemplateExport = async (template: ExportTemplate) => {
        setSelectedDataTypes(template.dataTypes);
        setSelectedFormat(template.format as any);
        setFilename(`${template.name.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`);
        setCustomFields(template.fields.includes('*') ? [] : template.fields);
        
        // Set JSON format based on template
        if (template.format === 'json') {
            if (template.id === 'gst-filing') {
                setJsonFormat('gst');
            } else if (template.id === 'income-tax') {
                setJsonFormat('tax');
            } else {
                setJsonFormat('standard');
            }
        }
        
        // Apply template filters
        if (template.filters.status) {
            setStatusFilter(template.filters.status);
        }
        
        await handleQuickExport();
    };

    // Clear export history
    const clearHistory = () => {
        setExportJobs([]);
    };

    // Get data summary
    const getDataSummary = () => {
        const summary = selectedDataTypes.map(dataType => {
            const data = getDataByType(dataType);
            return {
                type: dataType,
                count: data?.length || 0,
                label: DATA_TYPE_OPTIONS.find(opt => opt.value === dataType)?.label || dataType
            };
        });
        
        return summary;
    };

    const tabs = [
        { key: 'quick', label: 'Quick Export', icon: '⚡' },
        { key: 'custom', label: 'Custom Export', icon: '⚙️' },
        { key: 'templates', label: 'Templates', icon: '📋' },
        { key: 'scheduled', label: 'Scheduled', icon: '⏰' },
        { key: 'history', label: 'History', icon: '📊' }
    ];

    return (
        <Card>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Enhanced Export & Backup</h2>
                <Button variant="secondary" onClick={props.onBack}>Back</Button>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as any)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                                activeTab === tab.key 
                                    ? 'border-indigo-500 text-indigo-600' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Quick Export Tab */}
            {activeTab === 'quick' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card title="Data Selection">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Data Types
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {DATA_TYPE_OPTIONS.map(option => (
                                            <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedDataTypes.includes(option.value)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedDataTypes(prev => [...prev, option.value]);
                                                        } else {
                                                            setSelectedDataTypes(prev => prev.filter(t => t !== option.value));
                                                        }
                                                    }}
                                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-sm">{option.icon} {option.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Export Format
                                    </label>
                                    <Select
                                        value={selectedFormat}
                                        onChange={(e) => setSelectedFormat(e.target.value)}
                                        options={FORMAT_OPTIONS}
                                    />
                                </div>

                                {selectedFormat === 'json' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            JSON Format
                                        </label>
                                        <Select
                                            value={jsonFormat}
                                            onChange={(e) => setJsonFormat(e.target.value)}
                                            options={JSON_FORMAT_OPTIONS}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            {jsonFormat === 'gst' && 'Optimized for GST filing with enhanced tax details'}
                                            {jsonFormat === 'tax' && 'Enhanced format for income tax filing with financial summaries'}
                                            {jsonFormat === 'standard' && 'Simple JSON format for general use'}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Filename
                                    </label>
                                    <Input
                                        value={filename}
                                        onChange={(e) => setFilename(e.target.value)}
                                        placeholder="Enter filename"
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card title="Data Summary">
                            <div className="space-y-3">
                                {getDataSummary().map(item => (
                                    <div key={item.type} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                        <span className="font-medium">{item.label}</span>
                                        <span className="text-sm text-gray-600">{item.count} records</span>
                                    </div>
                                ))}
                            </div>
                            
                            {validationErrors.length > 0 && (
                                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <h4 className="text-sm font-medium text-red-800 mb-2">Validation Errors:</h4>
                                    <ul className="text-sm text-red-700 space-y-1">
                                        {validationErrors.map((error, index) => (
                                            <li key={index}>• {error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </Card>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <Button
                            variant="secondary"
                            onClick={validateData}
                        >
                            Validate Data
                        </Button>
                        <Button
                            onClick={handleQuickExport}
                            disabled={isExporting || selectedDataTypes.length === 0}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            {isExporting ? 'Exporting...' : 'Export Data'}
                        </Button>
                    </div>

                    {/* Progress Indicator */}
                    {currentProgress && (
                        <Card title="Export Progress">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">{currentProgress.message}</span>
                                    <span className="text-sm text-gray-600">{currentProgress.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${currentProgress.progress}%` }}
                                    />
                                </div>
                                {currentProgress.estimatedTime && (
                                    <p className="text-sm text-gray-600">
                                        Estimated time remaining: {Math.ceil(currentProgress.estimatedTime)} seconds
                                    </p>
                                )}
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {/* Custom Export Tab */}
            {activeTab === 'custom' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card title="Advanced Filters">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Start Date
                                        </label>
                                        <Input
                                            type="date"
                                            value={dateRange.start}
                                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            End Date
                                        </label>
                                        <Input
                                            type="date"
                                            value={dateRange.end}
                                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status Filter
                                    </label>
                                    <Select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        options={STATUS_FILTER_OPTIONS}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Custom Fields
                                    </label>
                                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                                        {getAvailableFields().map(field => (
                                            <label key={field} className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={customFields.includes(field)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setCustomFields(prev => [...prev, field]);
                                                        } else {
                                                            setCustomFields(prev => prev.filter(f => f !== field));
                                                        }
                                                    }}
                                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-sm">{field}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card title="Export Options">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="includeHeaders"
                                        checked={includeHeaders}
                                        onChange={(e) => setIncludeHeaders(e.target.checked)}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="includeHeaders" className="text-sm font-medium text-gray-700">
                                        Include Headers
                                    </label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="compression"
                                        checked={compression}
                                        onChange={(e) => setCompression(e.target.checked)}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="compression" className="text-sm font-medium text-gray-700">
                                        Enable Compression
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Export Notes
                                    </label>
                                    <Textarea
                                        placeholder="Add notes about this export..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            onClick={handleQuickExport}
                            disabled={isExporting || selectedDataTypes.length === 0}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            {isExporting ? 'Exporting...' : 'Export with Custom Settings'}
                        </Button>
                    </div>
                </div>
            )}

            {/* Templates Tab */}
            {activeTab === 'templates' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map(template => (
                            <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-lg">{template.name}</h3>
                                        {template.isDefault && (
                                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                                                Default
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">{template.description}</p>
                                    <div className="space-y-2">
                                        <div className="text-sm">
                                            <span className="font-medium">Data Types:</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {template.dataTypes.map(type => (
                                                    <span key={type} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                                        {DATA_TYPE_OPTIONS.find(opt => opt.value === type)?.label || type}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-medium">Format:</span> {template.format.toUpperCase()}
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleTemplateExport(template)}
                                        disabled={isExporting}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        Use Template
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Scheduled Tab */}
            {activeTab === 'scheduled' && (
                <div className="space-y-6">
                    <Card title="Scheduled Exports">
                        <div className="text-center py-8">
                            <div className="text-gray-400 text-6xl mb-4">⏰</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Scheduled Exports</h3>
                            <p className="text-gray-600 mb-4">
                                Set up automated exports to run daily, weekly, or monthly.
                            </p>
                            <Button className="bg-indigo-600 hover:bg-indigo-700">
                                Coming Soon
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">Export History</h3>
                        <Button variant="secondary" onClick={clearHistory}>
                            Clear History
                        </Button>
                    </div>

                    {exportJobs.length === 0 ? (
                        <Card>
                            <div className="text-center py-8">
                                <div className="text-gray-400 text-6xl mb-4">📊</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No Export History</h3>
                                <p className="text-gray-600">
                                    Your export history will appear here after you run your first export.
                                </p>
                            </div>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {exportJobs.map(job => (
                                <Card key={job.id}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3">
                                                <h4 className="font-medium text-gray-900">{job.name}</h4>
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    job.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    job.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                    job.status === 'running' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {job.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{job.message}</p>
                                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                                <span>Started: {formatDate(job.startTime)}</span>
                                                {job.endTime && <span>Completed: {formatDate(job.endTime)}</span>}
                                                {job.fileSize && <span>Size: {(job.fileSize / 1024).toFixed(1)} KB</span>}
                                            </div>
                                        </div>
                                        {job.status === 'completed' && job.downloadUrl && (
                                            <Button variant="secondary" size="sm">
                                                Download
                                            </Button>
                                        )}
                                    </div>
                                    {job.status === 'running' && (
                                        <div className="mt-3">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${job.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
};
