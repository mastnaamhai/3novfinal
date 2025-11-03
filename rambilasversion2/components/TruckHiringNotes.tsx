import React, { useState, useMemo } from 'react';
import type { TruckHiringNote, Payment, CompanyInfo } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { TruckHiringNoteForm } from './TruckHiringNoteForm';
import { UniversalPaymentForm } from './UniversalPaymentForm';
import { UniversalPaymentHistoryModal } from './UniversalPaymentHistoryModal';
import { formatDate } from '../services/utils';
import type { View } from '../App';
import { Pagination } from './ui/Pagination';
import { StatusBadge, getStatusVariant } from './ui/StatusBadge';
import { UniversalSearchSort, SortOption } from './ui/UniversalSearchSort';

interface TruckHiringNotesProps {
    notes: TruckHiringNote[];
    payments: Payment[];
    companyInfo: CompanyInfo;
    onSave: (note: Partial<Omit<TruckHiringNote, '_id' | 'thnNumber' | 'balanceAmount' | 'paidAmount' | 'payments' | 'status'>>) => Promise<any>;
    onUpdate: (id: string, note: Partial<Omit<TruckHiringNote, '_id' | 'thnNumber' | 'balanceAmount' | 'paidAmount' | 'payments' | 'status'>>) => Promise<any>;
    onDelete: (id: string) => Promise<void>;
    onSavePayment: (payment: Omit<Payment, '_id' | 'customer' | 'invoice' | 'truckHiringNote'>) => Promise<void>;
    onViewChange: (view: View) => void;
    onBack: () => void;
    initialFilters?: Partial<Record<keyof THNTableFilters, any>>;
}

interface THNTableFilters {
    searchTerm: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}

export const TruckHiringNotes: React.FC<TruckHiringNotesProps> = ({ 
    notes, payments, companyInfo, onSave, onUpdate, onDelete, onSavePayment, onViewChange, onBack, initialFilters 
}) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<TruckHiringNote | undefined>(undefined);
    const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
    const [isPaymentHistoryOpen, setIsPaymentHistoryOpen] = useState(false);
    const [selectedNoteForPayment, setSelectedNoteForPayment] = useState<TruckHiringNote | null>(null);
    const [selectedNoteForHistory, setSelectedNoteForHistory] = useState<TruckHiringNote | null>(null);

    const [searchTerm, setSearchTerm] = useState(initialFilters?.searchTerm || '');
    const [sortBy, setSortBy] = useState(initialFilters?.sortBy || 'thnNumber');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialFilters?.sortOrder || 'desc');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);

    // Sort options for THN
    const sortOptions: SortOption[] = [
        { value: 'thnNumber', label: 'Sort by THN Number' },
        { value: 'date', label: 'Sort by Date' },
        { value: 'truckOwnerName', label: 'Sort by Owner' },
        { value: 'truckNumber', label: 'Sort by Truck Number' },
        { value: 'truckType', label: 'Sort by Truck Type' },
        { value: 'loadingLocation', label: 'Sort by Loading Location' },
        { value: 'unloadingLocation', label: 'Sort by Unloading Location' },
        { value: 'freightRate', label: 'Sort by Freight Rate' },
        { value: 'totalAmount', label: 'Sort by Total Amount' },
        { value: 'balanceAmount', label: 'Sort by Balance' },
        { value: 'status', label: 'Sort by Status' }
    ];

    const filteredNotes = useMemo(() => {
        let filtered = notes.filter(note => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = searchTerm === '' ||
                note.thnNumber.toString().includes(searchTerm) ||
                note.truckOwnerName.toLowerCase().includes(searchLower) ||
                note.truckNumber.toLowerCase().includes(searchLower) ||
                note.loadingLocation.toLowerCase().includes(searchLower) ||
                note.unloadingLocation.toLowerCase().includes(searchLower) ||
                note.goodsType.toLowerCase().includes(searchLower) ||
                note.truckType.toLowerCase().includes(searchLower) ||
                note.status.toLowerCase().includes(searchLower);

            return matchesSearch;
        });

        // Sort the filtered results
        filtered.sort((a, b) => {
            let aValue: any = '';
            let bValue: any = '';
            
            switch (sortBy) {
                case 'thnNumber':
                    aValue = a.thnNumber;
                    bValue = b.thnNumber;
                    break;
                case 'date':
                    aValue = new Date(a.date);
                    bValue = new Date(b.date);
                    break;
                case 'truckOwnerName':
                    aValue = a.truckOwnerName.toLowerCase();
                    bValue = b.truckOwnerName.toLowerCase();
                    break;
                case 'truckNumber':
                    aValue = a.truckNumber.toLowerCase();
                    bValue = b.truckNumber.toLowerCase();
                    break;
                case 'truckType':
                    aValue = a.truckType.toLowerCase();
                    bValue = b.truckType.toLowerCase();
                    break;
                case 'loadingLocation':
                    aValue = a.loadingLocation.toLowerCase();
                    bValue = b.loadingLocation.toLowerCase();
                    break;
                case 'unloadingLocation':
                    aValue = a.unloadingLocation.toLowerCase();
                    bValue = b.unloadingLocation.toLowerCase();
                    break;
                case 'freightRate':
                    aValue = a.freightRate || 0;
                    bValue = b.freightRate || 0;
                    break;
                case 'totalAmount':
                    aValue = a.totalAmount || (a.freightRate + (a.additionalCharges || 0));
                    bValue = b.totalAmount || (b.freightRate + (b.additionalCharges || 0));
                    break;
                case 'balanceAmount':
                    aValue = a.balanceAmount || 0;
                    bValue = b.balanceAmount || 0;
                    break;
                case 'status':
                    aValue = a.status.toLowerCase();
                    bValue = b.status.toLowerCase();
                    break;
                default:
                    aValue = a.thnNumber;
                    bValue = b.thnNumber;
            }
            
            if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

        return filtered;
    }, [notes, searchTerm, sortBy, sortOrder]);

    // Paginated notes
    const paginatedNotes = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredNotes.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredNotes, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredNotes.length / itemsPerPage);

    // Reset to first page when search or sort changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sortBy, sortOrder]);

    const handleClearSearch = () => {
        setSearchTerm('');
        setCurrentPage(1);
    };

    const handleSave = async (note: Partial<Omit<TruckHiringNote, '_id' | 'thnNumber' | 'balanceAmount' | 'paidAmount' | 'payments' | 'status'>>) => {
        if (editingNote) {
            await onUpdate(editingNote._id, note);
        } else {
            await onSave(note);
        }
        setIsFormOpen(false);
        setEditingNote(undefined);
    };

    const handleAddNew = () => {
        setEditingNote(undefined);
        setIsFormOpen(true);
    };

    const handleAddPayment = (note: TruckHiringNote) => {
        setSelectedNoteForPayment(note);
        setIsPaymentFormOpen(true);
    };

    const handleViewPaymentHistory = (note: TruckHiringNote) => {
        setSelectedNoteForHistory(note);
        setIsPaymentHistoryOpen(true);
    };

    const handleSavePayment = async (payment: Omit<Payment, '_id' | 'customer' | 'invoice' | 'truckHiringNote'>) => {
        await onSavePayment(payment);
        setIsPaymentFormOpen(false);
        setSelectedNoteForPayment(null);
    };

    const handleEdit = (note: TruckHiringNote) => {
        setEditingNote(note);
        setIsFormOpen(true);
    };

    const handleDelete = async (note: TruckHiringNote) => {
        if (window.confirm(`Are you sure you want to delete THN #${note.thnNumber}?`)) {
            try {
                await onDelete(note._id);
            } catch (error) {
                console.error('Failed to delete THN:', error);
                alert('Failed to delete THN. Please try again.');
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Paid': return 'text-green-600 bg-green-100';
            case 'Unpaid': return 'text-red-600 bg-red-100';
            case 'Partially Paid': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="space-y-6">
            {isFormOpen && (
                <TruckHiringNoteForm
                    existingNote={editingNote}
                    companyInfo={companyInfo}
                    onSave={handleSave}
                    onCancel={() => setIsFormOpen(false)}
                />
            )}
            
            {isPaymentFormOpen && selectedNoteForPayment && (
                <UniversalPaymentForm
                    truckHiringNoteId={selectedNoteForPayment._id}
                    customerId={undefined} // No customer for THN payments
                    grandTotal={selectedNoteForPayment.totalAmount || (selectedNoteForPayment.freightRate + (selectedNoteForPayment.additionalCharges || 0))}
                    balanceDue={selectedNoteForPayment.balanceAmount}
                    onSave={handleSavePayment}
                    onClose={() => {
                        setIsPaymentFormOpen(false);
                        setSelectedNoteForPayment(null);
                    }}
                    title={`Add Payment for THN #${selectedNoteForPayment.thnNumber}`}
                />
            )}

            {isPaymentHistoryOpen && selectedNoteForHistory && (
                <UniversalPaymentHistoryModal
                    truckHiringNote={selectedNoteForHistory}
                    payments={payments}
                    onClose={() => {
                        setIsPaymentHistoryOpen(false);
                        setSelectedNoteForHistory(null);
                    }}
                />
            )}

            <Card>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Truck Hiring Notes</h2>
                    <div className="space-x-2">
                        <Button onClick={handleAddNew}>Add New THN</Button>
                        <Button variant="secondary" onClick={onBack}>Back</Button>
                    </div>
                </div>

                <UniversalSearchSort
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    searchPlaceholder="Search by THN number, owner name, truck number, locations, goods type, truck type, or status..."
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    sortOrder={sortOrder}
                    onSortOrderChange={setSortOrder}
                    sortOptions={sortOptions}
                    totalItems={notes.length}
                    filteredItems={filteredNotes.length}
                    onClearSearch={handleClearSearch}
                />
            </Card>

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">THN No.</th>
                                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Truck Details</th>
                                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                                <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Freight</th>
                                <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Advance</th>
                                <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                                <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                                <th className="px-4 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedNotes.map(note => (
                                <tr 
                                    key={note._id} 
                                    className="hover:bg-slate-50 transition-colors duration-200 cursor-pointer"
                                    onClick={() => onViewChange({ name: 'VIEW_THN', id: note._id })}
                                >
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{note.thnNumber}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(note.date)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        <div>
                                            <div className="font-medium">{note.truckNumber}</div>
                                            <div className="text-xs text-gray-400">{note.truckType}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        <div>
                                            <div>{note.loadingLocation} → {note.unloadingLocation}</div>
                                            <div className="text-xs text-gray-400">{note.goodsType}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        <div>
                                            <div className="font-medium">{note.truckOwnerName}</div>
                                            {note.truckOwnerContact && (
                                                <div className="text-xs text-gray-400">{note.truckOwnerContact}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                                        ₹{(note.freightRate || 0).toLocaleString('en-IN')}
                                        {note.additionalCharges > 0 && (
                                            <div className="text-xs text-gray-400">+₹{note.additionalCharges.toLocaleString('en-IN')}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-blue-600 text-right">
                                        ₹{(note.advanceAmount || 0).toLocaleString('en-IN')}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-green-600 text-right">
                                        ₹{(note.paidAmount || 0).toLocaleString('en-IN')}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-red-600 text-right">
                                        ₹{(note.balanceAmount || 0).toLocaleString('en-IN')}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                        <StatusBadge status={note.status} variant={getStatusVariant(note.status)} size="sm" />
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onViewChange({ name: 'VIEW_THN', id: note._id }); }} 
                                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                            title="View PDF"
                                        >
                                            View PDF
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleAddPayment(note); }} 
                                            className="text-green-600 hover:text-green-900 transition-colors"
                                            title="Add Payment"
                                        >
                                            Payment
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleViewPaymentHistory(note); }} 
                                            className="text-purple-600 hover:text-purple-900 transition-colors"
                                            title="View Payment History"
                                        >
                                            History
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleEdit(note); }} 
                                            className="text-blue-600 hover:text-blue-900 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDelete(note); }} 
                                            className="text-red-600 hover:text-red-900 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredNotes.length === 0 && (
                                <tr>
                                    <td colSpan={11} className="text-center py-8 text-gray-500">
                                        No Truck Hiring Notes found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                <div className="mt-6">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredNotes.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                    />
                </div>
            </Card>
        </div>
    );
};
