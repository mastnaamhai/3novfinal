import { useState, useMemo } from 'react';
import type { Customer } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { ValidatedCitySelect } from './ui/ValidatedCitySelect';
import { Textarea } from './ui/Textarea';
import { fetchGstDetails } from '../services/simpleGstService';
import { indianStates } from '../constants';
import { Pagination } from './ui/Pagination';

interface ClientsProps {
  customers: Customer[];
  onSave: (customer: Omit<Customer, 'id' | '_id'> & { _id?: string }) => Promise<Customer>;
  onDelete: (id: string) => void;
  onBack: () => void;
}

const ClientFormModal = ({
    client,
    onSave,
    onClose
}: {
    client: Partial<Customer> | null;
    onSave: (customer: Partial<Customer>) => Promise<any>;
    onClose: () => void;
}) => {
    if (!client) return null;

    const [formData, setFormData] = useState(client);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [verifyStatus, setVerifyStatus] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [verificationSource, setVerificationSource] = useState<'cache' | 'database' | 'api' | null>(null);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear save error when user makes changes
        if (saveError) {
            setSaveError(null);
        }
        
        // Clear field-specific errors
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };
    
    const handleVerifyGstin = async () => {
        if (!formData.gstin || formData.gstin.length !== 15) {
            setVerifyStatus({ message: 'Please enter a valid 15-digit GSTIN.', type: 'error' });
            return;
        }
        setIsVerifying(true);
        setVerifyStatus(null);
        setVerificationSource(null);
        setErrors(prev => ({...prev, gstin: undefined}));
        
        try {
            console.log('Verifying GSTIN:', formData.gstin);
            const result = await fetchGstDetails(formData.gstin);
            console.log('GST details received:', result);
            
            if (!result.success) {
                setVerifyStatus({ message: result.error || 'Failed to verify GSTIN. Please try again.', type: 'error' });
                return;
            }
            
            setFormData(prev => ({
                ...prev,
                name: result.data?.name || prev.name,
                tradeName: result.data?.tradeName || prev.tradeName,
                address: result.data?.address || prev.address,
                state: result.data?.state || prev.state,
            }));
            
            setVerifyStatus({ message: 'GSTIN verified successfully. Customer details fetched.', type: 'success' });
        } catch (error: any) {
            console.error('GST verification error:', error);
            setVerifyStatus({ message: error.message || 'Verification failed.', type: 'error' });
        } finally {
            setIsVerifying(false);
        }
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.name.trim()) newErrors.name = 'Client name is required.';
        if (!formData.address.trim()) newErrors.address = 'Address is required.';
        if (!formData.state) newErrors.state = 'State is required.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaveError(null); // Clear any previous errors
        
        if (validate()) {
            setIsSaving(true);
            try {
                // Filter out empty strings for optional fields to prevent MongoDB duplicate key errors
                const processedFormData = {
                    ...formData,
                    gstin: formData.gstin && formData.gstin.trim() !== '' ? formData.gstin : undefined,
                    contactPerson: formData.contactPerson && formData.contactPerson.trim() !== '' ? formData.contactPerson : undefined,
                    contactPhone: formData.contactPhone && formData.contactPhone.trim() !== '' ? formData.contactPhone : undefined,
                    contactEmail: formData.contactEmail && formData.contactEmail.trim() !== '' ? formData.contactEmail : undefined,
                    city: formData.city && formData.city.trim() !== '' ? formData.city : undefined,
                    pin: formData.pin && formData.pin.trim() !== '' ? formData.pin : undefined,
                    phone: formData.phone && formData.phone.trim() !== '' ? formData.phone : undefined,
                    email: formData.email && formData.email.trim() !== '' ? formData.email : undefined,
                    tradeName: formData.tradeName && formData.tradeName.trim() !== '' ? formData.tradeName : undefined,
                };
                
                console.log('Saving client data:', processedFormData);
                await onSave(processedFormData);
                console.log('Client saved successfully');
                onClose();
            } catch (error: any) {
                console.error("Failed to save client", error);
                const errorMessage = error?.message || 'Failed to save client. Please try again.';
                setSaveError(errorMessage);
            } finally {
                setIsSaving(false);
            }
        }
    };

    return (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start p-4 overflow-y-auto transition-opacity duration-300 ease-in-out" 
          onClick={onClose}
          data-form-modal="true"
        >
            <div onClick={e => e.stopPropagation()} className="w-full max-w-2xl my-4 sm:my-8 max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto">
                <Card title={formData._id ? 'Edit Client' : 'Add New Client'}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-start space-x-2">
                             <Input 
                                label="GSTIN" 
                                name="gstin" 
                                value={formData.gstin || ''} 
                                onChange={handleChange} 
                                wrapperClassName="flex-grow"
                            />
                            <Button type="button" variant="secondary" onClick={handleVerifyGstin} disabled={isVerifying} className="mt-6">
                                {isVerifying ? 'Verifying...' : 'Verify'}
                            </Button>
                        </div>
                        {verifyStatus && (
                            <div className={`text-xs -mt-2 ml-1 ${verifyStatus.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                                <p>{verifyStatus.message}</p>
                                {verificationSource && (
                                    <div className="flex items-center mt-1">
                                        <span className="text-gray-500">Source:</span>
                                        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                            verificationSource === 'cache' ? 'bg-blue-100 text-blue-800' :
                                            verificationSource === 'database' ? 'bg-green-100 text-green-800' :
                                            'bg-orange-100 text-orange-800'
                                        }`}>
                                            {verificationSource === 'cache' ? 'Memory Cache' :
                                             verificationSource === 'database' ? 'Local Database' :
                                             'External API'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                        {saveError && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-2">
                                <p className="text-sm text-red-600">
                                    <strong>Error:</strong> {saveError}
                                </p>
                            </div>
                        )}
                        <Input label="Legal Name of Business" name="name" value={formData.name} onChange={handleChange} error={errors.name} required />
                        <Input label="Trade Name (Optional)" name="tradeName" value={formData.tradeName || ''} onChange={handleChange} />
                        <Textarea label="Address" name="address" value={formData.address} onChange={handleChange} rows={4} error={errors.address} required />
                        <Select label="State" name="state" value={formData.state} onChange={handleChange} error={errors.state} required>
                            <option value="" disabled>Select State</option>
                            {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                        </Select>
                        
                        <div className="pt-4 border-t">
                             <h4 className="text-lg font-semibold text-gray-700 mb-2">Contact Information (Optional)</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Contact Person" name="contactPerson" value={formData.contactPerson || ''} onChange={handleChange} />
                                <Input label="Contact Phone" name="contactPhone" value={formData.contactPhone || ''} onChange={handleChange} />
                                <Input label="Contact Email" type="email" name="contactEmail" value={formData.contactEmail || ''} onChange={handleChange} wrapperClassName="md:col-span-2" />
                             </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                            <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>Cancel</Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Client'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};


export const Clients = ({ customers, onSave, onDelete, onBack }: ClientsProps) => {
    const [editingClient, setEditingClient] = useState<Partial<Customer> | null>(null);
    
    // Search and sort state
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'state' | 'gstin' | 'contactPerson'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    
    // Filtered and sorted customers
    const filteredAndSortedCustomers = useMemo(() => {
        let filtered = customers.filter(customer => {
            const searchLower = searchTerm.toLowerCase();
            const searchUpper = searchTerm.toUpperCase();
            return (
                customer.name.toLowerCase().includes(searchLower) ||
                (customer.tradeName && customer.tradeName.toLowerCase().includes(searchLower)) ||
                (customer.gstin && (customer.gstin.toLowerCase().includes(searchLower) || customer.gstin.includes(searchUpper))) ||
                customer.state.toLowerCase().includes(searchLower) ||
                (customer.contactPerson && customer.contactPerson.toLowerCase().includes(searchLower)) ||
                (customer.contactPhone && customer.contactPhone.includes(searchTerm)) ||
                (customer.contactEmail && customer.contactEmail.toLowerCase().includes(searchLower)) ||
                customer.address.toLowerCase().includes(searchLower)
            );
        });

        // Sort the filtered results
        filtered.sort((a, b) => {
            let aValue = '';
            let bValue = '';
            
            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'state':
                    aValue = a.state.toLowerCase();
                    bValue = b.state.toLowerCase();
                    break;
                case 'gstin':
                    aValue = a.gstin || '';
                    bValue = b.gstin || '';
                    break;
                case 'contactPerson':
                    aValue = a.contactPerson || '';
                    bValue = b.contactPerson || '';
                    break;
            }
            
            if (sortOrder === 'asc') {
                return aValue.localeCompare(bValue);
            } else {
                return bValue.localeCompare(aValue);
            }
        });

        return filtered;
    }, [customers, searchTerm, sortBy, sortOrder]);
    
    // Paginated customers
    const paginatedCustomers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedCustomers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAndSortedCustomers, currentPage, itemsPerPage]);
    
    const totalPages = Math.ceil(filteredAndSortedCustomers.length / itemsPerPage);
    
    // Reset to first page when search or sort changes
    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };
    
    const handleSortChange = (field: 'name' | 'state' | 'gstin' | 'contactPerson') => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
        setCurrentPage(1);
    };

    const handleAddNew = () => {
        setEditingClient({ name: '', tradeName: '', address: '', state: '', gstin: '', contactPerson: '', contactPhone: '', contactEmail: '' });
    };

    const handleEdit = (client: Customer) => {
        setEditingClient(client);
    };

    const handleCloseModal = () => {
        setEditingClient(null);
    };

    return (
        <div className="space-y-6">
            {editingClient && <ClientFormModal client={editingClient} onSave={onSave} onClose={handleCloseModal} />}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Manage Clients</h2>
                <div className="space-x-2">
                  <Button onClick={handleAddNew}>Add New Client</Button>
                  <Button variant="secondary" onClick={onBack}>Back</Button>
                </div>
            </div>
            <Card>
                {/* Search and Sort Controls */}
                <div className="mb-6 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search Bar */}
                        <div className="flex-1">
                            <Input
                                label="Search Clients"
                                placeholder="Search by name, trade name, GSTIN, state, contact info, or address..."
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                icon={
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                }
                            />
                        </div>
                        
                        {/* Sort Controls */}
                        <div className="flex gap-2">
                            <Select
                                value={sortBy}
                                onChange={(e) => handleSortChange(e.target.value as 'name' | 'state' | 'gstin' | 'contactPerson')}
                                className="min-w-[140px]"
                            >
                                <option value="name">Sort by Name</option>
                                <option value="state">Sort by State</option>
                                <option value="gstin">Sort by GSTIN</option>
                                <option value="contactPerson">Sort by Contact</option>
                            </Select>
                            
                            <Button
                                variant="outline"
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="px-3"
                                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                            >
                                {sortOrder === 'asc' ? (
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                                    </svg>
                                ) : (
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                                    </svg>
                                )}
                            </Button>
                        </div>
                    </div>
                    
                    {/* Results Summary */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <p className="text-sm text-gray-600">
                                Showing <span className="font-semibold text-gray-800">{paginatedCustomers.length}</span> of{' '}
                                <span className="font-semibold text-gray-800">{filteredAndSortedCustomers.length}</span> clients
                                {searchTerm && (
                                    <span className="ml-1">
                                        (filtered from <span className="font-semibold text-gray-800">{customers.length}</span> total)
                                    </span>
                                )}
                            </p>
                            
                            {/* Sort Status */}
                            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                Sorted by {sortBy === 'name' ? 'Name' : sortBy === 'state' ? 'State' : sortBy === 'gstin' ? 'GSTIN' : 'Contact'} ({sortOrder === 'asc' ? 'A-Z' : 'Z-A'})
                            </div>
                        </div>
                        
                        {searchTerm && (
                            <Button
                                variant="link"
                                onClick={() => handleSearchChange('')}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                Clear Search
                            </Button>
                        )}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-slate-100">
                            <tr>
                                <th 
                                    className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-slate-200 transition-colors"
                                    onClick={() => handleSortChange('name')}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>Client Name</span>
                                        {sortBy === 'name' && (
                                            <span className="text-indigo-600">
                                                {sortOrder === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th 
                                    className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-slate-200 transition-colors"
                                    onClick={() => handleSortChange('state')}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>Address & State</span>
                                        {sortBy === 'state' && (
                                            <span className="text-indigo-600">
                                                {sortOrder === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th 
                                    className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-slate-200 transition-colors"
                                    onClick={() => handleSortChange('gstin')}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>GSTIN</span>
                                        {sortBy === 'gstin' && (
                                            <span className="text-indigo-600">
                                                {sortOrder === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th 
                                    className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-slate-200 transition-colors"
                                    onClick={() => handleSortChange('contactPerson')}
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>Contact Info</span>
                                        {sortBy === 'contactPerson' && (
                                            <span className="text-indigo-600">
                                                {sortOrder === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedCustomers.map(client => (
                                <tr key={client._id} className="hover:bg-slate-50 transition-colors duration-200">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm align-top">
                                        <div className="font-medium text-gray-900">{client.name}</div>
                                        {client.tradeName && <div className="text-gray-500">{client.tradeName}</div>}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500 align-top">
                                        <p className="whitespace-pre-line">{client.address}</p>
                                        <p className="font-semibold text-gray-700 mt-1">{client.state}</p>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 align-top">{client.gstin || '-'}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 align-top">
                                        {client.contactPerson && <div className="font-semibold">{client.contactPerson}</div>}
                                        {client.contactPhone && <div className="text-xs">{client.contactPhone}</div>}
                                        {client.contactEmail && <div className="text-xs">{client.contactEmail}</div>}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2 align-top">
                                        <button onClick={() => handleEdit(client)} className="text-indigo-600 hover:text-indigo-900 transition-colors">Edit</button>
                                        <button onClick={() => onDelete(client._id)} className="text-red-600 hover:text-red-900 transition-colors">Delete</button>
                                    </td>
                                </tr>
                            ))}
                             {paginatedCustomers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-500">
                                        {searchTerm ? (
                                            <div>
                                                <p>No clients found matching "{searchTerm}"</p>
                                                <Button 
                                                    variant="link" 
                                                    onClick={() => handleSearchChange('')}
                                                    className="mt-2 text-sm"
                                                >
                                                    Clear search to see all clients
                                                </Button>
                                            </div>
                                        ) : (
                                            "No clients found. Click 'Add New Client' to get started."
                                        )}
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
                        totalItems={filteredAndSortedCustomers.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={setItemsPerPage}
                    />
                </div>
            </Card>
        </div>
    );
};