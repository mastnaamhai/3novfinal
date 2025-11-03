import { useState, useEffect, useCallback } from 'react';
import { LorryReceipt, GstPayableBy, RiskBearer } from '../types';

type LorryReceiptFormData = Omit<LorryReceipt, '_id' | 'id' | 'status' | 'consignor' | 'consignee' | 'vehicleId' | 'vehicle'> & {
    remarks?: string;
};

interface ManualCustomerData {
    name: string;
    address: string;
    state: string;
    gstin?: string;
    contactPerson?: string;
    contactPhone?: string;
    contactEmail?: string;
    city?: string;
    pin?: string;
    phone?: string;
    email?: string;
    tradeName?: string;
}

const STORAGE_KEY = 'lorryReceiptFormState';

const getInitialState = (): LorryReceiptFormData => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const currentDate = `${year}-${month}-${day}`;
    
    return {
        lrNumber: 0,
        date: currentDate,
        consignorId: '',
        consigneeId: '',
        vehicleNumber: '',
        from: '',
        to: '',
        loadingAddress: '',
        deliveryAddress: '',
        packages: [{ count: 1, packingMethod: 'Bags', description: '', actualWeight: 0, chargedWeight: 0 }],
        charges: { freight: 0, aoc: 0, hamali: 0, bCh: 0, trCh: 0, detentionCh: 0 },
        totalAmount: 0,
        eWayBillNo: '',
        eWayBillValidUpto: '',
        valueGoods: 0,
        gstPayableBy: GstPayableBy.CONSIGNOR,
        riskBearer: RiskBearer.OWNER,
        insurance: { 
            hasInsured: false,
            company: '',
            policyNo: '',
            date: '',
            amount: 0
        },
        invoiceNo: '',
        sealNo: '',
        reportingDate: '',
        deliveryDate: '',
        remarks: '',
    };
};

const getInitialManualState = (): ManualCustomerData => ({
    name: '',
    address: '',
    state: '',
    gstin: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    city: '',
    pin: '',
    phone: '',
    email: '',
    tradeName: ''
});

export const useLorryReceiptFormState = (existingLr?: LorryReceipt) => {
    // Load initial state from localStorage or use existing LR
    const loadInitialState = useCallback((): LorryReceiptFormData => {
        if (existingLr) {
            return { ...existingLr };
        }
        
        try {
            const savedState = localStorage.getItem(STORAGE_KEY);
            if (savedState) {
                const parsed = JSON.parse(savedState);
                // Ensure all required fields have default values
                return { ...getInitialState(), ...parsed };
            }
        } catch (error) {
            console.warn('Failed to load saved form state:', error);
        }
        
        return getInitialState();
    }, [existingLr]);

    // Main form state
    const [lr, setLr] = useState<Partial<LorryReceipt>>(loadInitialState);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSaving, setIsSaving] = useState(false);

    // Form configuration states
    const [allowManualLr, setAllowManualLr] = useState(false);
    
    // GSTIN verification states
    const [gstinConsignor, setGstinConsignor] = useState('');
    const [gstinConsignee, setGstinConsignee] = useState('');
    const [isVerifyingConsignor, setIsVerifyingConsignor] = useState(false);
    const [isVerifyingConsignee, setIsVerifyingConsignee] = useState(false);
    const [verifyStatus, setVerifyStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    
    // Manual customer entry states
    const [showConsignorManual, setShowConsignorManual] = useState(false);
    const [showConsigneeManual, setShowConsigneeManual] = useState(false);
    const [manualConsignor, setManualConsignor] = useState<Partial<ManualCustomerData>>(getInitialManualState());
    const [manualConsignee, setManualConsignee] = useState<Partial<ManualCustomerData>>(getInitialManualState());
    const [manualConsignorErrors, setManualConsignorErrors] = useState<{ [key: string]: string }>({});
    const [manualConsigneeErrors, setManualConsigneeErrors] = useState<{ [key: string]: string }>({});
    
    // Address display states
    const [showLoadingAddress, setShowLoadingAddress] = useState(false);
    const [showDeliveryAddress, setShowDeliveryAddress] = useState(false);

    // Save state to localStorage whenever form data changes
    useEffect(() => {
        // Don't save if we're editing an existing LR
        if (existingLr) return;
        
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(lr));
        } catch (error) {
            console.warn('Failed to save form state:', error);
        }
    }, [lr, existingLr]);

    // Clear all form state
    const clearFormState = useCallback(() => {
        const initialState = getInitialState();
        setLr(initialState);
        setErrors({});
        setAllowManualLr(false);
        setGstinConsignor('');
        setGstinConsignee('');
        setIsVerifyingConsignor(false);
        setIsVerifyingConsignee(false);
        setVerifyStatus(null);
        setShowConsignorManual(false);
        setShowConsigneeManual(false);
        setManualConsignor(getInitialManualState());
        setManualConsignee(getInitialManualState());
        setManualConsignorErrors({});
        setManualConsigneeErrors({});
        setShowLoadingAddress(false);
        setShowDeliveryAddress(false);
        
        // Clear localStorage
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.warn('Failed to clear form state from localStorage:', error);
        }
    }, []);

    // Reset form to initial state (useful for successful submission)
    const resetForm = useCallback(() => {
        if (existingLr) {
            // If editing existing LR, don't reset
            return;
        }
        clearFormState();
    }, [existingLr, clearFormState]);

    // Update form data with proper validation
    const updateFormData = useCallback((fieldName: string, value: any, type?: string) => {
        // Validate fieldName exists
        if (!fieldName) {
            console.warn('updateFormData called with undefined fieldName');
            return;
        }

        // Clear error for this field
        if (errors[fieldName]) {
            setErrors(prev => ({ ...prev, [fieldName]: '' }));
        }

        setLr(prev => {
            const updatedLr = {
                ...prev,
                [fieldName]: type === 'number' ? parseFloat(value) || 0 : value,
            };

            // Handle nested packages updates
            if (fieldName.startsWith('packages.')) {
                const [_, index, field] = fieldName.split('.');
                const packageIndex = parseInt(index);
                const updatedPackages = [...(prev.packages || [])];
                updatedPackages[packageIndex] = {
                    ...updatedPackages[packageIndex],
                    [field]: type === 'number' ? parseFloat(value) || 0 : value
                };
                return { ...updatedLr, packages: updatedPackages };
            }

            // Handle nested charges updates
            if (fieldName.startsWith('charges.')) {
                const field = fieldName.split('.')[1];
                return {
                    ...updatedLr,
                    charges: {
                        freight: 0,
                        aoc: 0,
                        hamali: 0,
                        bCh: 0,
                        trCh: 0,
                        detentionCh: 0,
                        ...prev.charges,
                        [field]: type === 'number' ? parseFloat(value) || 0 : value
                    }
                };
            }

            // Handle insurance nested updates
            if (fieldName.startsWith('insurance.')) {
                const field = fieldName.split('.')[1];
                return {
                    ...updatedLr,
                    insurance: {
                        hasInsured: prev.insurance?.hasInsured || false,
                        company: prev.insurance?.company || '',
                        policyNo: prev.insurance?.policyNo || '',
                        date: prev.insurance?.date || '',
                        amount: prev.insurance?.amount || 0,
                        ...prev.insurance,
                        [field]: type === 'number' ? parseFloat(value) || 0 : value
                    }
                };
            }

            return updatedLr;
        });
    }, [errors]);

    // Handle checkbox changes
    const handleCheckboxChange = useCallback((fieldName: string, checked: boolean) => {
        if (fieldName === 'insurance.hasInsured') {
            setLr(prev => ({
                ...prev,
                insurance: {
                    hasInsured: checked,
                    company: prev.insurance?.company || '',
                    policyNo: prev.insurance?.policyNo || '',
                    date: prev.insurance?.date || '',
                    amount: prev.insurance?.amount || 0
                }
            }));
        }
    }, []);

    // Add package
    const addPackage = useCallback(() => {
        setLr(prev => ({
            ...prev,
            packages: [...(prev.packages || []), { count: 1, packingMethod: '', description: '', actualWeight: 0, chargedWeight: 0 }]
        }));
    }, []);

    // Remove package
    const removePackage = useCallback((index: number) => {
        setLr(prev => ({
            ...prev,
            packages: prev.packages?.filter((_, i) => i !== index) || []
        }));
    }, []);

    // Calculate total amount
    const calculateTotal = useCallback(() => {
        if (!lr.charges) return 0;
        const { freight = 0, aoc = 0, hamali = 0, bCh = 0, trCh = 0, detentionCh = 0 } = lr.charges;
        return freight + aoc + hamali + bCh + trCh + detentionCh;
    }, [lr.charges]);

    // Update total when charges change
    useEffect(() => {
        const total = calculateTotal();
        setLr(prev => ({ ...prev, totalAmount: total }));
    }, [calculateTotal]);

    return {
        // Main form state
        lr,
        setLr,
        errors,
        setErrors,
        isSaving,
        setIsSaving,
        
        // Form configuration
        allowManualLr,
        setAllowManualLr,
        
        // GSTIN verification
        gstinConsignor,
        setGstinConsignor,
        gstinConsignee,
        setGstinConsignee,
        isVerifyingConsignor,
        setIsVerifyingConsignor,
        isVerifyingConsignee,
        setIsVerifyingConsignee,
        verifyStatus,
        setVerifyStatus,
        
        // Manual customer entry
        showConsignorManual,
        setShowConsignorManual,
        showConsigneeManual,
        setShowConsigneeManual,
        manualConsignor,
        setManualConsignor,
        manualConsignee,
        setManualConsignee,
        manualConsignorErrors,
        setManualConsignorErrors,
        manualConsigneeErrors,
        setManualConsigneeErrors,
        
        // Address display
        showLoadingAddress,
        setShowLoadingAddress,
        showDeliveryAddress,
        setShowDeliveryAddress,
        
        // Actions
        updateFormData,
        handleCheckboxChange,
        addPackage,
        removePackage,
        clearFormState,
        resetForm,
        calculateTotal,
        
        // Initial state getter
        getInitialState
    };
};

