import { useState, useEffect, useRef } from 'react';
import type { TruckHiringNote, CompanyInfo } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';
import { ValidatedInput } from './ui/ValidatedInput';
import { ValidatedSelect } from './ui/ValidatedSelect';
import { ValidatedTextarea } from './ui/ValidatedTextarea';
import { AutocompleteInput } from './ui/AutocompleteInput';
import { getCurrentDate } from '../services/utils';
import { commonCities } from '../constants/formData';
import { useFormValidation } from '../hooks/useFormValidation';
import { fieldRules } from '../services/formValidation';

interface TruckHiringNoteFormProps {
    existingNote?: TruckHiringNote;
    companyInfo: CompanyInfo;
    onSave: (note: Partial<Omit<TruckHiringNote, '_id' | 'thnNumber' | 'balanceAmount' | 'paidAmount' | 'payments' | 'status'>>) => Promise<any>;
    onCancel: () => void;
}

export const TruckHiringNoteForm = ({ existingNote, companyInfo, onSave, onCancel }: TruckHiringNoteFormProps) => {
    const getInitialState = (): Partial<Omit<TruckHiringNote, '_id' | 'thnNumber' | 'balanceAmount' | 'paidAmount' | 'payments' | 'status'>> => ({
        date: getCurrentDate(),
        truckNumber: '',
        truckType: '',
        vehicleCapacity: 0,
        loadingLocation: '',
        unloadingLocation: '',
        loadingDateTime: '',
        expectedDeliveryDate: '',
        goodsType: '',
        agencyName: companyInfo?.name || '', // Auto-populate with company name
        truckOwnerName: '',
        truckOwnerContact: '',
        freightRate: 0,
        freightRateType: 'per_trip',
        advanceAmount: 0,
        paymentMode: 'Cash',
        paymentTerms: '',
        additionalCharges: 0,
        remarks: '',
        linkedLR: '',
        linkedInvoice: ''
    });

    const [note, setNote] = useState(existingNote || getInitialState());
    const [isSaving, setIsSaving] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    // Validation rules for THN form
    const validationRules = {
        date: fieldRules.date,
        truckNumber: fieldRules.vehicleNumber,
        truckType: { required: true, message: 'Truck type is required' },
        vehicleCapacity: fieldRules.vehicleCapacity,
        loadingLocation: { required: true, minLength: 2, message: 'Loading location is required' },
        unloadingLocation: { required: true, minLength: 2, message: 'Unloading location is required' },
        loadingDateTime: { required: true, message: 'Loading date & time is required' },
        expectedDeliveryDate: fieldRules.futureDate,
        goodsType: { required: true, minLength: 2, message: 'Type of goods is required' },
        agencyName: { required: true, minLength: 2, message: 'Agency name is required' },
        truckOwnerName: { required: true, minLength: 2, message: 'Truck owner name is required' },
        truckOwnerContact: { 
            pattern: /^[6-9]\d{9}$/, 
            message: 'Contact number must be 10 digits starting with 6-9' 
        },
        freightRate: fieldRules.freightRate,
        additionalCharges: { min: 0, message: 'Additional charges cannot be negative' },
        advanceAmount: fieldRules.advanceAmount,
        paymentMode: { required: true, message: 'Payment mode is required' },
        paymentTerms: { maxLength: 500, message: 'Payment terms cannot exceed 500 characters' },
        linkedLR: { maxLength: 50, message: 'Linked LR number cannot exceed 50 characters' },
        linkedInvoice: { maxLength: 50, message: 'Linked invoice number cannot exceed 50 characters' },
        remarks: fieldRules.remarks
    };

    // Form validation hook
    const {
        errors,
        isValid,
        validateForm: validateEntireForm,
        setFieldError,
        clearFieldError,
        setErrors
    } = useFormValidation({
        validationRules,
        validateOnChange: true,
        validateOnBlur: true,
        validateOnSubmit: true
    });

    // Common truck types
    const truckTypes = [
        'Open Body', 'Container', 'Trailer', 'Tanker', 'Refrigerated', 
        'Flatbed', 'Box Truck', 'Dump Truck', 'Crane Truck', 'Other'
    ];

    // Common goods types
    const commonGoodsTypes = [
        'General Cargo', 'Textiles', 'Electronics', 'Machinery', 'Food Items', 
        'Pharmaceuticals', 'Automotive Parts', 'Construction Materials', 
        'Agricultural Products', 'Chemicals', 'Furniture', 'Books & Stationery', 
        'Garments', 'Footwear', 'Home Appliances'
    ];

    // Common cities for autocomplete
    const commonCities = [
        'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad',
        'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
        'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana',
        'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivli', 'Vasai-Virar'
    ];

    useEffect(() => {
        if (existingNote) {
            setNote(existingNote);
        }
    }, [existingNote]);

    // Validation function
    const validateForm = (): boolean => {
        const formErrors = validateEntireForm(note);
        
        // Additional custom validations
        const customErrors: Record<string, string> = {};
        
        // Validate dates
        if (note.loadingDateTime && note.expectedDeliveryDate) {
            const loadingDate = new Date(note.loadingDateTime);
            const deliveryDate = new Date(note.expectedDeliveryDate);
            if (deliveryDate < loadingDate) {
                customErrors.expectedDeliveryDate = 'Delivery date cannot be before loading date';
            }
        }
        
        // Merge all errors
        const allErrors = { ...formErrors, ...customErrors };
        setErrors(allErrors);
        
        return Object.keys(allErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        // Clear error for this field
        clearFieldError(name);
        
        setNote(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleValueChange = (fieldName: string, value: any) => {
        clearFieldError(fieldName);
        setNote(prev => ({
            ...prev,
            [fieldName]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            // Focus on first error field
            const firstErrorField = Object.keys(errors)[0];
            if (firstErrorField) {
                const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
                element?.focus();
            }
            return;
        }
        
        setIsSaving(true);
        try {
            await onSave(note);
        } catch (error) {
            console.error("Failed to save Truck Hiring Note", error);
        } finally {
            setIsSaving(false);
        }
    };


    const balanceAmount = (note.freightRate || 0) + (note.additionalCharges || 0) - (note.advanceAmount || 0);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start p-4 overflow-y-auto" data-form-modal="true">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl my-4 sm:my-8 max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <form ref={formRef} onSubmit={handleSubmit}>
                    <Card title={existingNote ? `Edit Truck Hiring Note #${existingNote.thnNumber}` : 'Create New Truck Hiring Note'}>
                        <div className="space-y-8">
                            {/* Basic Information Section */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <ValidatedInput
                                        fieldName="date"
                                        validationRules={validationRules}
                                        value={note.date || ''}
                                        onValueChange={(value) => handleValueChange('date', value)}
                                        type="date"
                                        required
                                    />
                                    <ValidatedInput
                                        fieldName="truckNumber"
                                        validationRules={validationRules}
                                        value={note.truckNumber || ''}
                                        onValueChange={(value) => handleValueChange('truckNumber', value)}
                                        required
                                        placeholder="e.g., MH-12-AB-1234"
                                    />
                                    <ValidatedSelect
                                        fieldName="truckType"
                                        validationRules={validationRules}
                                        value={note.truckType || ''}
                                        onValueChange={(value) => handleValueChange('truckType', value)}
                                        options={truckTypes.map(type => ({ value: type, label: type }))}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <ValidatedInput
                                        fieldName="vehicleCapacity"
                                        validationRules={validationRules}
                                        value={note.vehicleCapacity || 0}
                                        onValueChange={(value) => handleValueChange('vehicleCapacity', value)}
                                        type="number"
                                        required
                                        min="0"
                                        step="0.1"
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Your Agency Name
                                            <span className="text-green-600 text-xs ml-2">(Pre-filled from company settings)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={note.agencyName || ''}
                                            readOnly
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 cursor-not-allowed"
                                        />
                                    </div>
                                    <ValidatedInput
                                        fieldName="truckOwnerName"
                                        validationRules={validationRules}
                                        value={note.truckOwnerName || ''}
                                        onValueChange={(value) => handleValueChange('truckOwnerName', value)}
                                        required
                                        placeholder="Enter truck owner name"
                                    />
                                </div>

                                <ValidatedInput
                                    fieldName="truckOwnerContact"
                                    validationRules={validationRules}
                                    value={note.truckOwnerContact || ''}
                                    onValueChange={(value) => handleValueChange('truckOwnerContact', value)}
                                    placeholder="Enter contact number"
                                />
                            </div>

                            {/* Trip Details Section */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Trip Details</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Loading Location <span className="text-red-500">*</span>
                                        </label>
                                        <AutocompleteInput
                                            name="loadingLocation"
                                            value={note.loadingLocation || ''}
                                            onChange={handleChange}
                                            suggestions={commonCities}
                                            placeholder="Enter loading location"
                                            required
                                            error={errors.loadingLocation}
                                            helpText="Start typing to see city suggestions"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Unloading Location <span className="text-red-500">*</span>
                                        </label>
                                        <AutocompleteInput
                                            name="unloadingLocation"
                                            value={note.unloadingLocation || ''}
                                            onChange={handleChange}
                                            suggestions={commonCities}
                                            placeholder="Enter unloading location"
                                            required
                                            error={errors.unloadingLocation}
                                            helpText="Start typing to see city suggestions"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Loading Date & Time <span className="text-red-500">*</span>
                                        </label>
                                        <Input 
                                            name="loadingDateTime" 
                                            type="datetime-local" 
                                            value={note.loadingDateTime || ''} 
                                            onChange={handleChange} 
                                            required 
                                            error={errors.loadingDateTime}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Expected Delivery Date <span className="text-red-500">*</span>
                                        </label>
                                        <Input 
                                            name="expectedDeliveryDate" 
                                            type="date" 
                                            value={note.expectedDeliveryDate || ''} 
                                            onChange={handleChange} 
                                            required 
                                            error={errors.expectedDeliveryDate}
                                        />
                                        <p className="text-xs text-gray-500">Format: DD/MM/YYYY</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type of Goods</label>
                                    <input
                                        type="text"
                                        name="goodsType"
                                        value={note.goodsType || ''}
                                        onChange={handleChange}
                                        list="goods-types"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter type of goods"
                                        required
                                    />
                                    <datalist id="goods-types">
                                        {commonGoodsTypes.map(type => <option key={type} value={type} />)}
                                    </datalist>
                                    {errors.goodsType && <p className="text-red-500 text-xs mt-1">{errors.goodsType}</p>}
                                </div>
                            </div>

                            {/* Freight Details Section */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Freight Details</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <ValidatedInput
                                        fieldName="freightRate"
                                        validationRules={validationRules}
                                        value={note.freightRate || 0}
                                        onValueChange={(value) => handleValueChange('freightRate', value)}
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                    <Select 
                                        label="Freight Rate Type" 
                                        name="freightRateType" 
                                        value={note.freightRateType || 'per_trip'} 
                                        onChange={handleChange}
                                        options={[
                                            { value: 'per_trip', label: 'Per Trip' },
                                            { value: 'per_ton', label: 'Per Ton' },
                                            { value: 'per_km', label: 'Per KM' }
                                        ]}
                                        required 
                                    />
                                    <ValidatedInput
                                        fieldName="additionalCharges"
                                        validationRules={validationRules}
                                        value={note.additionalCharges || 0}
                                        onValueChange={(value) => handleValueChange('additionalCharges', value)}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="e.g., detention charges"
                                    />
                                </div>
                            </div>

                            {/* Payment Details Section */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Payment Details</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Select 
                                        label="Payment Mode" 
                                        name="paymentMode" 
                                        value={note.paymentMode || 'Cash'} 
                                        onChange={handleChange}
                                        options={[
                                            { value: 'Cash', label: 'Cash' },
                                            { value: 'UPI', label: 'UPI' },
                                            { value: 'Bank Transfer', label: 'Bank Transfer' },
                                            { value: 'Cheque', label: 'Cheque' },
                                            { value: 'Other', label: 'Other' }
                                        ]}
                                        required 
                                        error={errors.paymentMode}
                                    />
                                    <Input 
                                        label="Advance Amount (₹)" 
                                        name="advanceAmount" 
                                        type="number" 
                                        value={note.advanceAmount || 0} 
                                        onChange={handleChange} 
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <Textarea 
                                    label="Payment Terms (Optional)" 
                                    name="paymentTerms" 
                                    value={note.paymentTerms || ''} 
                                    onChange={handleChange} 
                                    rows={3}
                                    placeholder="e.g., 50% advance, balance after delivery"
                                />

                                {/* Payment Summary */}
                                <div className="bg-green-50 rounded-lg p-4">
                                    <h4 className="text-md font-semibold text-gray-700 mb-4">Payment Summary</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Total Amount (₹)</label>
                                            <div className="mt-1 p-3 border border-gray-300 rounded-md bg-white font-semibold">
                                                {((note.freightRate || 0) + (note.additionalCharges || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Advance Paid (₹)</label>
                                            <div className="mt-1 p-3 border border-gray-300 rounded-md bg-white">
                                                {(note.advanceAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Balance Amount (₹)</label>
                                            <div className="mt-1 p-3 border border-gray-300 rounded-md bg-white font-bold text-lg text-red-600">
                                                {balanceAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input 
                                        label="Linked LR Number (Optional)" 
                                        name="linkedLR" 
                                        value={note.linkedLR || ''} 
                                        onChange={handleChange} 
                                        placeholder="Link to Lorry Receipt"
                                    />
                                    <Input 
                                        label="Linked Invoice Number (Optional)" 
                                        name="linkedInvoice" 
                                        value={note.linkedInvoice || ''} 
                                        onChange={handleChange} 
                                        placeholder="Link to Invoice"
                                    />
                                </div>

                                <ValidatedTextarea
                                    fieldName="remarks"
                                    validationRules={validationRules}
                                    value={note.remarks || ''}
                                    onValueChange={(value) => handleValueChange('remarks', value)}
                                    rows={3}
                                    placeholder="Any special instructions or notes..."
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-2 pt-6 mt-6 border-t">
                            <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save THN'}
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </div>
    );
};
