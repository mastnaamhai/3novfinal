import React, { useState, useEffect, useCallback } from 'react';
import { GstPayableBy, RiskBearer } from '../types';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { ValidatedInput } from './ui/ValidatedInput';
import { ValidatedAutocompleteSelect } from './ui/ValidatedAutocompleteSelect';
import { ValidatedCitySelect } from './ui/ValidatedCitySelect';
import { ValidatedTextarea } from './ui/ValidatedTextarea';
import { AutocompleteInput } from './ui/AutocompleteInput';
import { EditableSectionBox } from './ui/EditableSectionBox';
import { PincodeInput } from './ui/PincodeInput';
import { StateCityDropdown } from './ui/StateCityDropdown';
import { commonPackingMethods } from '../constants/formData';
import { indianStates } from '../constants';
import { fetchGstDetails } from '../services/simpleGstService';
import { simpleNumberingService } from '../services/simpleNumberingService';
import { useLorryReceiptFormState } from '../hooks/useLorryReceiptFormState';
import { useFormValidation } from '../hooks/useFormValidation';
import { fieldRules } from '../services/formValidation';
import { formatVehicleNumber } from '../services/utils';
import type { PincodeDetails } from '../services/pincodeService';

import type { LorryReceipt, Customer, TruckHiringNote } from '../types';

interface LorryReceiptFormProps {
  onSave: (lr: Partial<LorryReceipt>) => Promise<void>;
  onCancel: () => void;
  customers: Customer[];
  truckHiringNotes: TruckHiringNote[];
  existingLr?: LorryReceipt;
  onSaveCustomer: (customer: Omit<Customer, 'id' | '_id'> & { _id?: string }) => Promise<Customer>;
  onRefreshCustomers?: () => Promise<Customer[]>;
}


export const LorryReceiptForm: React.FC<LorryReceiptFormProps> = ({ 
    onSave, 
    onCancel, 
    customers, 
    truckHiringNotes, 
    existingLr, 
    onSaveCustomer,
    onRefreshCustomers
}) => {
    // Use the custom hook for state management
    const {
        lr,
        setLr,
        errors,
        setErrors,
        isSaving,
        setIsSaving,
        allowManualLr,
        setAllowManualLr,
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
        showLoadingAddress,
        setShowLoadingAddress,
        showDeliveryAddress,
        setShowDeliveryAddress,
        updateFormData,
        handleCheckboxChange,
        addPackage,
        removePackage,
        clearFormState,
        resetForm,
        getInitialState
    } = useLorryReceiptFormState(existingLr);

    // State for auto-generated LR number display
    const [lrNumber, setLrNumber] = useState('');
    const [isLoadingLrNumber, setIsLoadingLrNumber] = useState(false);

    // Validation rules for LR form
    const validationRules = {
        // Use anyDate when manual LR is enabled to allow past dates for custom entries
        date: allowManualLr ? fieldRules.anyDate : fieldRules.date,
        consignorId: { required: true, message: 'Please select a consignor' },
        consigneeId: { required: true, message: 'Please select a consignee' },
        vehicleNumber: fieldRules.vehicleNumber,
        from: { required: true, minLength: 2, message: 'From location is required' },
        to: { required: true, minLength: 2, message: 'To location is required' },
        'packages.0.description': fieldRules.packageDescription,
        'packages.0.actualWeight': fieldRules.actualWeight,
        'packages.0.chargedWeight': fieldRules.chargedWeight,
        'packages.0.count': { required: true, min: 1, message: 'Package count must be at least 1' },
        'packages.0.packingMethod': { required: true, message: 'Packing method is required' },
        'charges.freight': fieldRules.freightCharges,
        'charges.aoc': { min: 0, message: 'AOC cannot be negative' },
        'charges.hamali': { min: 0, message: 'Hamali cannot be negative' },
        'charges.bCh': { min: 0, message: 'B.Ch cannot be negative' },
        'charges.trCh': { min: 0, message: 'Tr.Ch cannot be negative' },
        'charges.detentionCh': { min: 0, message: 'Detention charges cannot be negative' },
        gstPayableBy: { required: true, message: 'GST Payable By is required' },
        riskBearer: { required: true, message: 'Risk Bearer is required' },
        lrNumber: {
            custom: (value: number) => {
                if (allowManualLr && value) {
                    if (value <= 0) return 'LR number must be greater than 0';
                }
                return null;
            }
        },
        loadingAddress: { maxLength: 500, message: 'Loading address cannot exceed 500 characters' },
        deliveryAddress: { maxLength: 500, message: 'Delivery address cannot exceed 500 characters' },
        eWayBillNo: { maxLength: 50, message: 'E-Way Bill number cannot exceed 50 characters' },
        eWayBillValidUpto: fieldRules.optionalDate,
        valueGoods: { min: 0, message: 'Value of goods cannot be negative' },
        invoiceNo: { maxLength: 50, message: 'Invoice number cannot exceed 50 characters' },
        sealNo: { maxLength: 50, message: 'Seal number cannot exceed 50 characters' },
        // Make reporting date optional - allow any valid date or empty
        reportingDate: fieldRules.optionalDate,
        // Make delivery date optional - allow any valid date or empty
        deliveryDate: fieldRules.optionalDate,
        remarks: fieldRules.remarks
    };

    // Form validation hook
    const {
        validateForm: validateEntireForm,
        clearFieldError,
        setErrors: setValidationErrors
    } = useFormValidation({
        validationRules,
        validateOnChange: true,
        validateOnBlur: true,
        validateOnSubmit: true
    });

    // Get unique vehicle numbers from THN for autocomplete
    const getVehicleSuggestions = useCallback(() => {
        const vehicleNumbers = truckHiringNotes
            .map((thn: TruckHiringNote) => thn.truckNumber)
            .filter((number: string, index: number, self: string[]) => number && self.indexOf(number) === index)
            .sort();
        return vehicleNumbers;
    }, [truckHiringNotes]);


    // Note: citySuggestions removed - now using ValidatedCitySelect with comprehensive city data

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

    // Load numbering configuration for display purposes only
    useEffect(() => {
        const loadNumberingConfig = async () => {
            try {
                await simpleNumberingService.initialize();
            } catch (error) {
                console.error('Failed to load numbering configuration:', error);
            }
        };
        loadNumberingConfig();
    }, []);

    // Initialize checkbox states when editing existing LR
    useEffect(() => {
        if (existingLr) {
            setShowLoadingAddress(!!existingLr.loadingAddress);
            setShowDeliveryAddress(!!existingLr.deliveryAddress);
        }
    }, [existingLr]);

    // Load LR numbering configuration for display purposes
    useEffect(() => {
        const loadLrNumber = async () => {
            if (!existingLr && !allowManualLr) {
                try {
                    setIsLoadingLrNumber(true);
                    await simpleNumberingService.initialize();
                    // Get the next number without actually consuming it
                    const config = simpleNumberingService.getConfig('consignment');
                    if (config) {
                        const formattedNumber = simpleNumberingService.formatNumber('consignment', config.currentNumber);
                        setLrNumber(formattedNumber);
                    } else {
                        setLrNumber('LR-5001'); // Default fallback
                    }
                } catch (error) {
                    console.error('Failed to load LR numbering:', error);
                    setLrNumber('LR-5001'); // Better fallback
                } finally {
                    setIsLoadingLrNumber(false);
                }
            }
        };
        loadLrNumber();
    }, [existingLr, allowManualLr]);

    // GSTIN verification functions - Database-first approach
    const handleVerifyGstinConsignor = async () => {
        if (!gstinConsignor || gstinConsignor.length !== 15) {
            setVerifyStatus({ message: 'Please enter a valid 15-digit GSTIN.', type: 'error' });
            return;
        }
        setIsVerifyingConsignor(true);
        setVerifyStatus(null);
        
        try {
            // STEP 1: Check database first (FREE)
            const normalizedGstin = gstinConsignor.toUpperCase();
            const existingCustomer = customers.find((c: Customer) => 
                c.gstin && c.gstin.toUpperCase() === normalizedGstin
            );
            
            if (existingCustomer) {
                // Customer exists in database - use it immediately (NO API CALL)
                setLr(prev => ({ ...prev, consignorId: existingCustomer._id }));
                setVerifyStatus({ 
                    message: `Consignor found in database: ${existingCustomer.name} (${existingCustomer.gstin})`, 
                    type: 'success' 
                });
                return;
            }

            // STEP 2: Customer not in database - fetch from API (COST MONEY)
            console.log('Customer not found in database, fetching from GST API...');
            const result = await fetchGstDetails(gstinConsignor);
            
            if (!result.success) {
                setVerifyStatus({ 
                    message: result.error || 'Failed to verify GSTIN. Please try again.', 
                    type: 'error' 
                });
                
                // If credits are exhausted, automatically show manual entry option
                if (result.error && result.error.includes('credits exhausted')) {
                    setShowConsignorManual(true);
                }
                return;
            }

            // STEP 3: Create new customer from GST data
            try {
                const newCustomer = await onSaveCustomer(result.data!);
                setLr(prev => ({ ...prev, consignorId: newCustomer._id }));
                setVerifyStatus({ 
                    message: `Consignor created from GST API: ${newCustomer.name} (${newCustomer.gstin})`, 
                    type: 'success' 
                });
            } catch (createError: any) {
                console.error('Failed to create customer:', createError);
                setVerifyStatus({ 
                    message: `GSTIN verified but failed to create customer. Please try again.`, 
                    type: 'error' 
                });
            }
        } catch (error: any) {
            const errorMessage = error.message || 'Verification failed.';
            setVerifyStatus({ message: errorMessage, type: 'error' });
            
            // If API failed due to credits or other issues, suggest manual entry
            if (errorMessage.includes('credits exhausted') || errorMessage.includes('API') || errorMessage.includes('unavailable')) {
                setShowConsignorManual(true);
            }
        } finally {
            setIsVerifyingConsignor(false);
        }
    };

    const handleVerifyGstinConsignee = async () => {
        if (!gstinConsignee || gstinConsignee.length !== 15) {
            setVerifyStatus({ message: 'Please enter a valid 15-digit GSTIN.', type: 'error' });
            return;
        }
        setIsVerifyingConsignee(true);
        setVerifyStatus(null);
        
        try {
            // STEP 1: Check database first (FREE)
            const normalizedGstin = gstinConsignee.toUpperCase();
            const existingCustomer = customers.find((c: Customer) => 
                c.gstin && c.gstin.toUpperCase() === normalizedGstin
            );
            
            if (existingCustomer) {
                // Customer exists in database - use it immediately (NO API CALL)
                setLr(prev => ({ ...prev, consigneeId: existingCustomer._id }));
                setVerifyStatus({ 
                    message: `Consignee found in database: ${existingCustomer.name} (${existingCustomer.gstin})`, 
                    type: 'success' 
                });
                return;
            }

            // STEP 2: Customer not in database - fetch from API (COST MONEY)
            console.log('Customer not found in database, fetching from GST API...');
            const result = await fetchGstDetails(gstinConsignee);
            
            if (!result.success) {
                setVerifyStatus({ 
                    message: result.error || 'Failed to verify GSTIN. Please try again.', 
                    type: 'error' 
                });
                
                // If credits are exhausted, automatically show manual entry option
                if (result.error && result.error.includes('credits exhausted')) {
                    setShowConsigneeManual(true);
                }
                return;
            }

            // STEP 3: Create new customer from GST data
            try {
                const newCustomer = await onSaveCustomer(result.data!);
                setLr(prev => ({ ...prev, consigneeId: newCustomer._id }));
                setVerifyStatus({ 
                    message: `Consignee created from GST API: ${newCustomer.name} (${newCustomer.gstin})`, 
                    type: 'success' 
                });
            } catch (createError: any) {
                console.error('Failed to create customer:', createError);
                setVerifyStatus({ 
                    message: `GSTIN verified but failed to create customer. Please try again.`, 
                    type: 'error' 
                });
            }
        } catch (error: any) {
            const errorMessage = error.message || 'Verification failed.';
            setVerifyStatus({ message: errorMessage, type: 'error' });
            
            // If API failed due to credits or other issues, suggest manual entry
            if (errorMessage.includes('credits exhausted') || errorMessage.includes('API') || errorMessage.includes('unavailable')) {
                setShowConsigneeManual(true);
            }
        } finally {
            setIsVerifyingConsignee(false);
        }
    };

    const handleManualConsignorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setManualConsignor(prev => ({ ...prev, [name]: value }));
        setManualConsignorErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleManualConsigneeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setManualConsignee(prev => ({ ...prev, [name]: value }));
        setManualConsigneeErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleConsignorPincodeFound = (details: PincodeDetails) => {
        setManualConsignor(prev => ({
            ...prev,
            city: details.city,
            state: details.state,
            pin: details.pincode
        }));
    };

    const handleConsignorPincodeNotFound = () => {
        // Enable manual entry of city and state when pincode is not found
        setManualConsignor(prev => ({
            ...prev,
            city: prev.city || '',
            state: prev.state || ''
        }));
    };

    const handleConsigneePincodeFound = (details: PincodeDetails) => {
        setManualConsignee(prev => ({
            ...prev,
            city: details.city,
            state: details.state,
            pin: details.pincode
        }));
    };

    const handleConsigneePincodeNotFound = () => {
        // Enable manual entry of city and state when pincode is not found
        setManualConsignee(prev => ({
            ...prev,
            city: prev.city || '',
            state: prev.state || ''
        }));
    };

    const handleAddManualConsignor = async () => {
        const newErrors: { [key: string]: string } = {};
        if (!manualConsignor.name) newErrors.name = 'Name is required';
        // PIN code is optional - only validate format if provided
        if (manualConsignor.pin && !/^[1-9][0-9]{5}$/.test(manualConsignor.pin)) {
            newErrors.pin = 'PIN code must be 6 digits starting with 1-9';
        }
        if (Object.keys(newErrors).length > 0) {
            setManualConsignorErrors(newErrors);
            return;
        }
        try {
            if (manualConsignor.name) {
                // Filter out empty strings for optional fields to prevent MongoDB duplicate key errors
                const processedConsignorData = {
                    ...manualConsignor,
                    address: manualConsignor.address && manualConsignor.address.trim() !== '' ? manualConsignor.address : undefined,
                    state: manualConsignor.state && manualConsignor.state.trim() !== '' ? manualConsignor.state : undefined,
                    gstin: manualConsignor.gstin && manualConsignor.gstin.trim() !== '' ? manualConsignor.gstin : undefined,
                    contactPerson: manualConsignor.contactPerson && manualConsignor.contactPerson.trim() !== '' ? manualConsignor.contactPerson : undefined,
                    contactPhone: manualConsignor.contactPhone && manualConsignor.contactPhone.trim() !== '' ? manualConsignor.contactPhone : undefined,
                    contactEmail: manualConsignor.contactEmail && manualConsignor.contactEmail.trim() !== '' ? manualConsignor.contactEmail : undefined,
                    city: manualConsignor.city && manualConsignor.city.trim() !== '' ? manualConsignor.city : undefined,
                    pin: manualConsignor.pin && manualConsignor.pin.trim() !== '' ? manualConsignor.pin : undefined,
                    phone: manualConsignor.phone && manualConsignor.phone.trim() !== '' ? manualConsignor.phone : undefined,
                    email: manualConsignor.email && manualConsignor.email.trim() !== '' ? manualConsignor.email : undefined,
                    tradeName: manualConsignor.tradeName && manualConsignor.tradeName.trim() !== '' ? manualConsignor.tradeName : undefined,
                };
                
                const newCustomer = await onSaveCustomer(processedConsignorData as Omit<Customer, 'id'>);
                setLr(prev => ({ ...prev, consignorId: newCustomer._id }));
                setShowConsignorManual(false);
                setManualConsignor(getInitialState().consignorId as any); // Reset manual form
                setVerifyStatus({ message: 'Consignor added manually and selected.', type: 'success' });
            }
        } catch (error: any) {
            setVerifyStatus({ message: error.message || 'Failed to add consignor manually.', type: 'error' });
        }
    };

    const handleAddManualConsignee = async () => {
        const newErrors: { [key: string]: string } = {};
        if (!manualConsignee.name) newErrors.name = 'Name is required';
        // PIN code is optional - only validate format if provided
        if (manualConsignee.pin && !/^[1-9][0-9]{5}$/.test(manualConsignee.pin)) {
            newErrors.pin = 'PIN code must be 6 digits starting with 1-9';
        }
        if (Object.keys(newErrors).length > 0) {
            setManualConsigneeErrors(newErrors);
            return;
        }
        try {
            if (manualConsignee.name) {
                // Filter out empty strings for optional fields to prevent MongoDB duplicate key errors
                const processedConsigneeData = {
                    ...manualConsignee,
                    address: manualConsignee.address && manualConsignee.address.trim() !== '' ? manualConsignee.address : undefined,
                    state: manualConsignee.state && manualConsignee.state.trim() !== '' ? manualConsignee.state : undefined,
                    gstin: manualConsignee.gstin && manualConsignee.gstin.trim() !== '' ? manualConsignee.gstin : undefined,
                    contactPerson: manualConsignee.contactPerson && manualConsignee.contactPerson.trim() !== '' ? manualConsignee.contactPerson : undefined,
                    contactPhone: manualConsignee.contactPhone && manualConsignee.contactPhone.trim() !== '' ? manualConsignee.contactPhone : undefined,
                    contactEmail: manualConsignee.contactEmail && manualConsignee.contactEmail.trim() !== '' ? manualConsignee.contactEmail : undefined,
                    city: manualConsignee.city && manualConsignee.city.trim() !== '' ? manualConsignee.city : undefined,
                    pin: manualConsignee.pin && manualConsignee.pin.trim() !== '' ? manualConsignee.pin : undefined,
                    phone: manualConsignee.phone && manualConsignee.phone.trim() !== '' ? manualConsignee.phone : undefined,
                    email: manualConsignee.email && manualConsignee.email.trim() !== '' ? manualConsignee.email : undefined,
                    tradeName: manualConsignee.tradeName && manualConsignee.tradeName.trim() !== '' ? manualConsignee.tradeName : undefined,
                };
                
                const newCustomer = await onSaveCustomer(processedConsigneeData as Omit<Customer, 'id'>);
                setLr(prev => ({ ...prev, consigneeId: newCustomer._id }));
                setShowConsigneeManual(false);
                setManualConsignee(getInitialState().consigneeId as any); // Reset manual form
                setVerifyStatus({ message: 'Consignee added manually and selected.', type: 'success' });
            }
        } catch (error: any) {
            setVerifyStatus({ message: error.message || 'Failed to add consignee manually.', type: 'error' });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        updateFormData(name, value, type);
    };

    const handleValueChange = (fieldName: string, value: any) => {
        clearFieldError(fieldName);
        updateFormData(fieldName, value, typeof value === 'number' ? 'number' : 'text');
    };

    const handleCheckboxChangeEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        handleCheckboxChange(name, checked);
    };

    const validateFormData = async (): Promise<{ isValid: boolean; errors: { [key: string]: string } }> => {
        // Use the centralized validation
        const formErrors = validateEntireForm(lr);
        
        // Additional custom validations
        const customErrors: { [key: string]: string } = {};
        
        // Validate custom LR number format if manual entry is enabled
        if (allowManualLr && lr.lrNumber) {
            try {
                // Extract number from formatted string (remove prefix)
                const config = simpleNumberingService.getConfig('consignment');
                const numberPart = String(lr.lrNumber).replace(config?.prefix || 'LR', '');
                const number = parseInt(numberPart, 10);
                
                if (isNaN(number)) {
                    customErrors.lrNumber = 'Please enter a valid number';
                } else {
                    const validation = await simpleNumberingService.validateManualNumber('consignment', number);
                    if (!validation.valid) {
                        customErrors.lrNumber = validation.message || 'Invalid LR number format';
                    }
                }
            } catch (error) {
                customErrors.lrNumber = 'Failed to validate LR number';
            }
        }

        // Merge all errors
        const allErrors = { ...formErrors, ...customErrors };
        setErrors(allErrors);
        setValidationErrors(allErrors);
        
        // Log validation errors for debugging
        if (Object.keys(allErrors).length > 0) {
            console.log('Validation errors:', allErrors);
        }
        
        return { isValid: Object.keys(allErrors).length === 0, errors: allErrors };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('=== LR FORM SUBMIT START ===');
        console.log('Form data:', lr);
        
        const validation = await validateFormData();
        console.log('Validation result:', validation);
        
        if (!validation.isValid) {
            console.log('Validation failed, errors:', validation.errors);
            // Focus on first error field
            const firstErrorField = Object.keys(validation.errors)[0];
            if (firstErrorField) {
            const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
            element?.focus();
            }
            return;
        }

        console.log('Validation passed, proceeding with save...');
        setIsSaving(true);
        try {
            // Prepare LR data for submission
            const lrData = { ...lr };
            
            // Handle LR number based on manual entry setting
            if (allowManualLr) {
                // Manual entry enabled - only send lrNumber if user provided a valid value
                if (lrData.lrNumber && lrData.lrNumber > 0) {
                    // Convert string to number if it's a string
                    lrData.lrNumber = typeof lrData.lrNumber === 'string' 
                        ? parseInt(lrData.lrNumber, 10) 
                        : lrData.lrNumber;
                } else {
                    delete lrData.lrNumber; // Let backend generate it
                }
            } else {
                // Auto-generated - let backend handle numbering completely
                delete lrData.lrNumber; // Always let backend generate for auto mode
            }
            
            console.log('Sending LR data to onSave:', lrData);
            await onSave(lrData);
            console.log('LR saved successfully');
            resetForm(); // Reset form state on successful save
            onCancel(); // Close form on successful save
        } catch (error) {
            console.error('Failed to save Lorry Receipt', error);
        } finally {
            setIsSaving(false);
        }
    };



    const amountInWords = (num: number) => {
        const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
        const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

        const regex = /^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/; // Supports up to 99,99,99,999 (99 Crore)

        const numToString = (n: number) => {
            if (n < 20) return a[n];
            if (n < 100) return b[Math.floor(n / 10)] + ' ' + a[n % 10];
            return '';
        };

        let n = num.toFixed(2).split('.');
        let rupee = parseInt(n[0]);
        let cents = parseInt(n[1]);

        let str = '';
        let inr = rupee.toString();
        let parts = regex.exec(inr);

        if (parts === null) {
            return 'Amount too large';
        }

        let [, H, G, F, E, D] = parts;

        str += (numToString(parseInt(H, 10)) !== '') ? numToString(parseInt(H, 10)) + 'crore ' : '';
        str += (numToString(parseInt(G, 10)) !== '') ? numToString(parseInt(G, 10)) + 'lakh ' : '';
        str += (numToString(parseInt(F, 10)) !== '') ? numToString(parseInt(F, 10)) + 'thousand ' : '';
        str += (numToString(parseInt(E, 10)) !== '') ? numToString(parseInt(E, 10)) + 'hundred ' : '';
        str += (numToString(parseInt(D, 10)) !== '') ? numToString(parseInt(D, 10)) : '';

        let result = str.trim();
        if (result === '') result = 'Zero';
        result += ' Rupees';

        if (cents > 0) {
            result += ' and ' + numToString(cents) + ' Paise';
        }

        return result.trim() + ' Only';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start p-4 overflow-y-auto" data-form-modal="true">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl my-4 sm:my-8 max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <Card>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {existingLr ? `Edit Consignment Note #${existingLr.lrNumber}` : 'Create New Consignment Note'}
                            </h2>
                            <div className="text-xl font-bold text-green-600">
                                Total: ₹{lr.totalAmount?.toFixed(2) || '0.00'}
                            </div>
                        </div>

                        {/* Shipment Details */}
                        <div className="space-y-4 mb-6 p-4 border border-gray-200 rounded-lg">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Shipment Details</h3>
                                <div className="border-t border-gray-300"></div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 h-6 flex items-center">
                                            Consignment Note Number
                                        </label>
                                        {!allowManualLr ? (
                                            <div className="w-full px-3 py-3 border border-green-200 rounded-md bg-green-50 text-green-800 text-base h-12 flex items-center">
                                                {isLoadingLrNumber ? (
                                                    <span className="flex items-center">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                                                        Loading LR number...
                                                    </span>
                                                ) : (
                                                    <span className="font-semibold">LR Number: {lrNumber}</span>
                                                )}
                                            </div>
                                        ) : (
                                            <input
                                                name="lrNumber"
                                                type="number"
                                                value={lr.lrNumber || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    updateFormData('lrNumber', value ? parseInt(value, 10) : '', 'number');
                                                }}
                                                placeholder="Enter consignment number or leave empty for auto-generation"
                                                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 h-12"
                                            />
                                        )}
                                        {errors.lrNumber && <p className="text-red-500 text-xs mt-1">{errors.lrNumber}</p>}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 h-6 flex items-center">
                                            Date <span className="text-red-500">*</span>
                                        </label>
                                        <ValidatedInput
                                            fieldName="date"
                                            validationRules={validationRules}
                                            value={lr.date || ''}
                                            onValueChange={(value) => handleValueChange('date', value)}
                                            type="date"
                                            required
                                            className="h-12"
                                        />
                                        <p className="text-xs text-gray-500">Format: DD/MM/YYYY</p>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <AutocompleteInput
                                            name="vehicleNumber" 
                                            value={lr.vehicleNumber || ''} 
                                            onChange={(e) => {
                                                const formatted = formatVehicleNumber(e.target.value);
                                                updateFormData('vehicleNumber', formatted, 'text');
                                            }}
                                            label="Vehicle No."
                                            required 
                                            error={errors.vehicleNumber}
                                            suggestions={getVehicleSuggestions()}
                                            placeholder="e.g., MH12AB1234 or MH-12-AB-1234"
                                            helpText="Enter vehicle number - will be auto-formatted. Start typing to see suggestions from Truck Hiring Notes"
                                            className="h-12"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="customLrCheckbox"
                                        checked={allowManualLr}
                                        onChange={(e) => setAllowManualLr(e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="customLrCheckbox" className="text-sm text-gray-700">
                                        Enter custom consignment number
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <ValidatedCitySelect
                                        fieldName="from"
                                        validationRules={validationRules}
                                        value={lr.from || ''}
                                        onValueChange={(value) => handleValueChange('from', value)}
                                        label="From"
                                        placeholder="Type to search cities or enter manually..."
                                        required
                                        allowManualEntry={true}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <ValidatedCitySelect
                                        fieldName="to"
                                        validationRules={validationRules}
                                        value={lr.to || ''}
                                        onValueChange={(value) => handleValueChange('to', value)}
                                        label="To"
                                        placeholder="Type to search cities or enter manually..."
                                        required
                                        allowManualEntry={true}
                                    />
                                </div>
                            </div>

                            {/* Optional Address Fields */}
                            <div className="space-y-4 mt-12 pt-6 border-t border-gray-200">
                                <h4 className="text-sm font-semibold text-gray-800 mb-4">Optional Address Details</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            id="showLoadingAddress"
                                            checked={showLoadingAddress}
                                            onChange={(e) => setShowLoadingAddress(e.target.checked)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded flex-shrink-0"
                                        />
                                        <label htmlFor="showLoadingAddress" className="text-sm text-gray-700 leading-relaxed">
                                            Add Loading Address (different from consignor address)
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            id="showDeliveryAddress"
                                            checked={showDeliveryAddress}
                                            onChange={(e) => setShowDeliveryAddress(e.target.checked)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded flex-shrink-0"
                                        />
                                        <label htmlFor="showDeliveryAddress" className="text-sm text-gray-700 leading-relaxed">
                                            Add Delivery Address (different from consignee address)
                                        </label>
                                    </div>
                                </div>

                                {showLoadingAddress && (
                                    <div className="space-y-2 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Loading Address
                                        </label>
                                        <Textarea
                                            name="loadingAddress"
                                            value={lr.loadingAddress || ''}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="Enter specific loading address if different from consignor address"
                                            className="w-full"
                                        />
                                    </div>
                                )}

                                {showDeliveryAddress && (
                                    <div className="space-y-2 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Delivery Address
                                        </label>
                                        <Textarea
                                            name="deliveryAddress"
                                            value={lr.deliveryAddress || ''}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="Enter specific delivery address if different from consignee address"
                                            className="w-full"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Consignor Details */}
                        <div className="space-y-4 mb-6 p-4 border border-gray-200 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Consignor Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <ValidatedAutocompleteSelect
                                        fieldName="consignorId"
                                        validationRules={validationRules}
                                        value={lr.consignorId || ''}
                                        onValueChange={(value) => handleValueChange('consignorId', value)}
                                        customers={customers}
                                        label="Consignor"
                                        placeholder="Type to search consignor..."
                                        required
                                        onSaveCustomer={onSaveCustomer}
                                        onSelect={(customer) => {
                                            console.log('Consignor selected:', customer);
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 h-6 flex items-center">
                                        Consignor GSTIN
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <Input 
                                            name="gstinConsignor" 
                                            value={gstinConsignor} 
                                            onChange={(e) => setGstinConsignor(e.target.value)} 
                                            placeholder="Enter 15-digit GSTIN"
                                            maxLength={15}
                                            className="flex-grow h-12"
                                        />
                                        <Button 
                                            type="button" 
                                            variant="secondary" 
                                            onClick={handleVerifyGstinConsignor} 
                                            disabled={isVerifyingConsignor || !gstinConsignor || gstinConsignor.length !== 15}
                                            size="sm"
                                            className="h-12"
                                        >
                                            {isVerifyingConsignor ? 'Verifying...' : 'Fetch'}
                                        </Button>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={() => setShowConsignorManual(!showConsignorManual)}
                                            size="sm"
                                            className="h-12"
                                        >
                                            {showConsignorManual ? 'Hide Manual' : 'Add Manually'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            {showConsignorManual && (
                                <div className="border border-gray-300 p-4 rounded-lg bg-gray-50 space-y-4 mt-4">
                                    <h4 className="text-md font-medium text-gray-700">Manual Consignor Entry</h4>
                                    
                                    {/* Required Fields */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-3">
                                        <h5 className="text-sm font-semibold text-blue-800">Required Information</h5>
                                        <Input label="Name" name="name" value={manualConsignor.name || ''} onChange={handleManualConsignorChange} error={manualConsignorErrors.name} required />
                                        
                                        <PincodeInput
                                            label="PIN Code"
                                            name="pin"
                                            value={manualConsignor.pin || ''}
                                            onChange={handleManualConsignorChange}
                                            onPincodeFound={handleConsignorPincodeFound}
                                            onPincodeNotFound={handleConsignorPincodeNotFound}
                                            error={manualConsignorErrors.pin}
                                            helpText="Enter pincode to auto-fill city and state"
                                        />
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <StateCityDropdown
                                                label="City"
                                                name="city"
                                                value={manualConsignor.city || ''}
                                                onChange={handleManualConsignorChange}
                                                onCityChange={(city) => setManualConsignor(prev => ({ ...prev, city }))}
                                                type="city"
                                                selectedState={manualConsignor.state}
                                                placeholder={manualConsignor.pin ? "Auto-filled from pincode" : "Enter city manually"}
                                            />
                                            <StateCityDropdown
                                                label="State"
                                                name="state"
                                                value={manualConsignor.state || ''}
                                                onChange={handleManualConsignorChange}
                                                onStateChange={(state) => setManualConsignor(prev => ({ ...prev, state }))}
                                                type="state"
                                                placeholder={manualConsignor.pin ? "Auto-filled from pincode" : "Enter state manually"}
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Optional Fields */}
                                    <div className="space-y-3">
                                        <h5 className="text-sm font-semibold text-gray-700">Optional Information</h5>
                                        <Textarea label="Address" name="address" value={manualConsignor.address || ''} onChange={handleManualConsignorChange} placeholder="Enter address (optional)" />
                                        <Input label="GSTIN" name="gstin" value={manualConsignor.gstin || ''} onChange={handleManualConsignorChange} error={manualConsignorErrors.gstin} maxLength={15} placeholder="Enter GSTIN (optional)" />
                                        <Input label="Contact Person" name="contactPerson" value={manualConsignor.contactPerson || ''} onChange={handleManualConsignorChange} placeholder="Enter contact person (optional)" />
                                        <Input label="Contact Phone" name="contactPhone" value={manualConsignor.contactPhone || ''} onChange={handleManualConsignorChange} placeholder="Enter contact phone (optional)" />
                                        <Input label="Contact Email" name="contactEmail" value={manualConsignor.contactEmail || ''} onChange={handleManualConsignorChange} placeholder="Enter contact email (optional)" />
                                    </div>
                                    
                                    <Button type="button" onClick={handleAddManualConsignor} className="w-full">Add Consignor</Button>
                                </div>
                            )}
                            {verifyStatus && verifyStatus.type === 'error' && (
                                <div className={`mt-2 p-3 rounded text-sm bg-red-100 text-red-800 border border-red-200`}>
                                    <div className="font-medium">{verifyStatus.message}</div>
                                    {verifyStatus.message.includes('credits exhausted') && (
                                        <div className="mt-2 text-xs text-red-600">
                                            💡 You can enter customer details manually using the "Add Manually" option below.
                                        </div>
                                    )}
                                    {!verifyStatus.message.includes('credits exhausted') && (
                                        <div className="mt-2 text-xs text-red-600">
                                            💡 You can also enter customer details manually using the "Add Manually" option below.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Consignee Details */}
                        <div className="space-y-4 mb-6 p-4 border border-gray-200 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Consignee Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <ValidatedAutocompleteSelect
                                        fieldName="consigneeId"
                                        validationRules={validationRules}
                                        value={lr.consigneeId || ''}
                                        onValueChange={(value) => handleValueChange('consigneeId', value)}
                                        customers={customers}
                                        label="Consignee"
                                        placeholder="Type to search consignee..."
                                        required
                                        onSaveCustomer={onSaveCustomer}
                                        onSelect={(customer) => {
                                            console.log('Consignee selected:', customer);
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 h-6 flex items-center">
                                        Consignee GSTIN
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <Input 
                                            name="gstinConsignee" 
                                            value={gstinConsignee} 
                                            onChange={(e) => setGstinConsignee(e.target.value)} 
                                            placeholder="Enter 15-digit GSTIN"
                                            maxLength={15}
                                            className="flex-grow h-12"
                                        />
                                        <Button 
                                            type="button" 
                                            variant="secondary" 
                                            onClick={handleVerifyGstinConsignee} 
                                            disabled={isVerifyingConsignee || !gstinConsignee || gstinConsignee.length !== 15}
                                            size="sm"
                                            className="h-12"
                                        >
                                            {isVerifyingConsignee ? 'Verifying...' : 'Fetch'}
                                        </Button>
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={() => setShowConsigneeManual(!showConsigneeManual)}
                                            size="sm"
                                            className="h-12"
                                        >
                                            {showConsigneeManual ? 'Hide Manual' : 'Add Manually'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            {showConsigneeManual && (
                                <div className="border border-gray-300 p-4 rounded-lg bg-gray-50 space-y-4 mt-4">
                                    <h4 className="text-md font-medium text-gray-700">Manual Consignee Entry</h4>
                                    
                                    {/* Required Fields */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-3">
                                        <h5 className="text-sm font-semibold text-blue-800">Required Information</h5>
                                        <Input label="Name" name="name" value={manualConsignee.name || ''} onChange={handleManualConsigneeChange} error={manualConsigneeErrors.name} required />
                                        
                                        <PincodeInput
                                            label="PIN Code"
                                            name="pin"
                                            value={manualConsignee.pin || ''}
                                            onChange={handleManualConsigneeChange}
                                            onPincodeFound={handleConsigneePincodeFound}
                                            onPincodeNotFound={handleConsigneePincodeNotFound}
                                            error={manualConsigneeErrors.pin}
                                            helpText="Enter pincode to auto-fill city and state"
                                        />
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <StateCityDropdown
                                                label="City"
                                                name="city"
                                                value={manualConsignee.city || ''}
                                                onChange={handleManualConsigneeChange}
                                                onCityChange={(city) => setManualConsignee(prev => ({ ...prev, city }))}
                                                type="city"
                                                selectedState={manualConsignee.state}
                                                placeholder={manualConsignee.pin ? "Auto-filled from pincode" : "Enter city manually"}
                                            />
                                            <StateCityDropdown
                                                label="State"
                                                name="state"
                                                value={manualConsignee.state || ''}
                                                onChange={handleManualConsigneeChange}
                                                onStateChange={(state) => setManualConsignee(prev => ({ ...prev, state }))}
                                                type="state"
                                                placeholder={manualConsignee.pin ? "Auto-filled from pincode" : "Enter state manually"}
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Optional Fields */}
                                    <div className="space-y-3">
                                        <h5 className="text-sm font-semibold text-gray-700">Optional Information</h5>
                                        <Textarea label="Address" name="address" value={manualConsignee.address || ''} onChange={handleManualConsigneeChange} placeholder="Enter address (optional)" />
                                        <Input label="GSTIN" name="gstin" value={manualConsignee.gstin || ''} onChange={handleManualConsigneeChange} error={manualConsigneeErrors.gstin} maxLength={15} placeholder="Enter GSTIN (optional)" />
                                        <Input label="Contact Person" name="contactPerson" value={manualConsignee.contactPerson || ''} onChange={handleManualConsigneeChange} placeholder="Enter contact person (optional)" />
                                        <Input label="Contact Phone" name="contactPhone" value={manualConsignee.contactPhone || ''} onChange={handleManualConsigneeChange} placeholder="Enter contact phone (optional)" />
                                        <Input label="Contact Email" name="contactEmail" value={manualConsignee.contactEmail || ''} onChange={handleManualConsigneeChange} placeholder="Enter contact email (optional)" />
                                    </div>
                                    
                                    <Button type="button" onClick={handleAddManualConsignee} className="w-full">Add Consignee</Button>
                                </div>
                            )}
                            {verifyStatus && verifyStatus.type === 'error' && (
                                <div className={`mt-2 p-3 rounded text-sm bg-red-100 text-red-800 border border-red-200`}>
                                    <div className="font-medium">{verifyStatus.message}</div>
                                    {verifyStatus.message.includes('credits exhausted') && (
                                        <div className="mt-2 text-xs text-red-600">
                                            💡 You can enter customer details manually using the "Add Manually" option below.
                                        </div>
                                    )}
                                    {!verifyStatus.message.includes('credits exhausted') && (
                                        <div className="mt-2 text-xs text-red-600">
                                            💡 You can also enter customer details manually using the "Add Manually" option below.
                                        </div>
                                    )}
                                </div>
                            )}
                                </div>

                        {/* Package Details */}
                        <div className="space-y-4 mb-6 p-4 border border-gray-200 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Package Details</h3>
                                    {lr.packages?.map((pkg, index) => (
                                <div key={index} className="border border-gray-300 rounded-lg p-4 bg-gray-50 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-md font-medium text-gray-700">Package {index + 1}</h4>
                                                {lr.packages && lr.packages.length > 1 && (
                                                    <Button 
                                                        type="button" 
                                                variant="destructive" 
                                                size="sm" 
                                                        onClick={() => removePackage(index)}
                                                    >
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Count <span className="text-red-500">*</span>
                                            </label>
                                                <Input 
                                                    name={`packages.${index}.count`} 
                                                    type="number" 
                                                    value={pkg.count || 0} 
                                                    onChange={handleChange} 
                                                    required 
                                                    min="1"
                                                    error={errors[`packages.${index}.count`]}
                                                />
                                        </div>
                                        <div className="space-y-2">
                                            <AutocompleteInput
                                                name={`packages.${index}.packingMethod`}
                                                value={pkg.packingMethod || ''}
                                                onChange={handleChange}
                                                label="Packing Method"
                                                suggestions={commonPackingMethods}
                                                placeholder="Select or type packing method"
                                                helpText="Select from list or type manually"
                                                required
                                                error={errors[`packages.${index}.packingMethod`]}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Description of contents <span className="text-red-500">*</span>
                                            </label>
                                                <Input 
                                                name={`packages.${index}.description`} 
                                                value={pkg.description || ''} 
                                                onChange={handleChange} 
                                                required 
                                                error={errors[`packages.${index}.description`]}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Actual Weight (kg) <span className="text-red-500">*</span>
                                            </label>
                                            <Input 
                                                    name={`packages.${index}.actualWeight`} 
                                                    type="number" 
                                                    value={pkg.actualWeight || 0} 
                                                    onChange={handleChange} 
                                                    required 
                                                min="0.00"
                                                max="100000"
                                                step="0.01"
                                                    error={errors[`packages.${index}.actualWeight`]}
                                                />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Charged Weight (kg) <span className="text-red-500">*</span>
                                            </label>
                                                <Input 
                                                    name={`packages.${index}.chargedWeight`} 
                                                    type="number" 
                                                    value={pkg.chargedWeight || 0} 
                                                    onChange={handleChange} 
                                                    required 
                                                min="0.00"
                                                max="100000"
                                                step="0.01"
                                                    error={errors[`packages.${index}.chargedWeight`]}
                                                />
                                            </div>
                                            </div>
                                        </div>
                                    ))}
                            <Button type="button" variant="outline" onClick={addPackage} className="w-full">
                                        + Add Another Package
                                    </Button>
                            </div>

                        {/* Charges & Financial Details */}
                        <div className="space-y-4 mb-6 p-4 border border-gray-200 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Charges & Financial Details</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <ValidatedInput
                                        fieldName="charges.freight"
                                        validationRules={validationRules}
                                        value={lr.charges?.freight || 0}
                                        onValueChange={(value) => handleValueChange('charges.freight', value)}
                                        type="number"
                                        required={false}
                                        min="0"
                                        step="0.01"
                                        label="Freight Charges (₹) - Optional"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        AOC (Other Charges) (₹)
                                    </label>
                                        <Input 
                                            name="charges.aoc" 
                                            type="number" 
                                            value={lr.charges?.aoc || 0} 
                                            onChange={handleChange} 
                                            min="0"
                                            step="0.01"
                                        />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Hamali (Loading/Unloading) (₹)
                                    </label>
                                        <Input 
                                            name="charges.hamali" 
                                            type="number" 
                                            value={lr.charges?.hamali || 0} 
                                            onChange={handleChange} 
                                            min="0"
                                            step="0.01"
                                        />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        B.Ch (Booking Charges) (₹)
                                    </label>
                                        <Input 
                                            name="charges.bCh" 
                                            type="number" 
                                            value={lr.charges?.bCh || 0} 
                                            onChange={handleChange} 
                                            min="0"
                                            step="0.01"
                                        />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Tr.Ch (Transit Charges) (₹)
                                    </label>
                                        <Input 
                                            name="charges.trCh" 
                                            type="number" 
                                            value={lr.charges?.trCh || 0} 
                                            onChange={handleChange} 
                                            min="0"
                                            step="0.01"
                                        />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Detention Charges (₹)
                                    </label>
                                        <Input 
                                            name="charges.detentionCh" 
                                            type="number" 
                                            value={lr.charges?.detentionCh || 0} 
                                            onChange={handleChange} 
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center mt-6">
                                <h4 className="text-xl font-bold text-green-800">Total Amount: ₹{lr.totalAmount?.toFixed(2) || '0.00'}</h4>
                                <p className="text-sm text-green-700 mt-1">{amountInWords(lr.totalAmount || 0)}</p>
                                            </div>
                                        </div>

                        {/* GST Payable By Section (Yellow) */}
                        <div className="space-y-4 mb-6 p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">GST Payable By</h3>
                            <div className="flex flex-wrap gap-4">
                                {Object.values(GstPayableBy).map(type => (
                                    <label key={type} className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="gstPayableBy"
                                            value={type}
                                            checked={lr.gstPayableBy === type}
                                            onChange={handleChange} 
                                            className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                                        />
                                        <span className="text-sm font-medium text-gray-700">{type}</span>
                                    </label>
                                ))}
                                    </div>
                            {errors.gstPayableBy && <p className="text-red-500 text-xs mt-1">{errors.gstPayableBy}</p>}
                            </div>

                        {/* Risk Bearer Section (Purple) */}
                        <div className="space-y-4 mb-6 p-4 border border-purple-200 rounded-lg bg-purple-50">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Risk Bearer</h3>
                            <div className="flex flex-wrap gap-4">
                                {Object.values(RiskBearer).map(bearer => (
                                    <label key={bearer} className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name="riskBearer"
                                            value={bearer}
                                            checked={lr.riskBearer === bearer}
                                            onChange={handleChange} 
                                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                                        />
                                        <span className="text-sm font-medium text-gray-700">{bearer}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.riskBearer && <p className="text-red-500 text-xs mt-1">{errors.riskBearer}</p>}
                        </div>

                        {/* Insurance Details Section (Blue) */}
                        <div className="space-y-4 mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Insurance Details</h3>
                            <div className="flex items-center mb-4">
                                            <input
                                                type="checkbox"
                                                id="hasInsured"
                                    name="insurance.hasInsured"
                                                checked={lr.insurance?.hasInsured || false}
                                    onChange={handleCheckboxChangeEvent}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                <label htmlFor="hasInsured" className="ml-2 block text-sm text-gray-900">
                                    The Customer has stated that
                                            </label>
                                        </div>
                                        
                                        {lr.insurance?.hasInsured && (
                                <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Input 
                                                    label="Insurance Company" 
                                                    name="insurance.company" 
                                                    value={lr.insurance?.company || ''} 
                                            onChange={handleChange} 
                                                />
                                                <Input 
                                                    label="Policy Number" 
                                                    name="insurance.policyNo" 
                                                    value={lr.insurance?.policyNo || ''} 
                                            onChange={handleChange} 
                                                />
                                                <Input 
                                            label="Policy Date" 
                                                    name="insurance.date" 
                                                    type="date" 
                                                    value={lr.insurance?.date || ''} 
                                            onChange={handleChange} 
                                                />
                                        <Input 
                                            label="Amount (₹)" 
                                            name="insurance.amount" 
                                            type="number" 
                                            value={lr.insurance?.amount || 0} 
                                            onChange={handleChange} 
                                            min="0"
                                            step="0.01"
                                        />
                                            </div>
                            </div>
                        )}
                        </div>

                        {/* Other Details */}
                        <div className="space-y-4 mb-6 p-4 border border-gray-200 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Other Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        E-Way Bill No
                                    </label>
                                    <Input 
                                        name="eWayBillNo" 
                                        value={lr.eWayBillNo || ''} 
                                        onChange={handleChange} 
                                        placeholder="Enter E-Way Bill number"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Valid Upto (Optional)
                                    </label>
                                    <Input 
                                        name="eWayBillValidUpto" 
                                        type="date"
                                        value={lr.eWayBillValidUpto || ''} 
                                        onChange={handleChange} 
                                        placeholder="Select validity date"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Value of Goods (₹)
                                    </label>
                                    <Input 
                                        name="valueGoods" 
                                        type="number" 
                                        value={lr.valueGoods || 0} 
                                        onChange={handleChange} 
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Invoice No
                                    </label>
                                    <Input 
                                        name="invoiceNo" 
                                        value={lr.invoiceNo || ''} 
                                        onChange={handleChange} 
                                        placeholder="Enter invoice number"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Seal No
                                    </label>
                                    <Input 
                                        name="sealNo" 
                                        value={lr.sealNo || ''} 
                                        onChange={handleChange} 
                                        placeholder="Enter seal number"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Reporting Date (Optional)
                                    </label>
                                    <Input 
                                        name="reportingDate" 
                                        type="date" 
                                        value={lr.reportingDate || ''} 
                                        onChange={handleChange} 
                                    />
                                    <p className="text-xs text-gray-500">Format: DD/MM/YYYY</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Delivery Date (Optional)
                                    </label>
                                    <Input 
                                        name="deliveryDate" 
                                        type="date" 
                                        value={lr.deliveryDate || ''} 
                                        onChange={handleChange} 
                                    />
                                    <p className="text-xs text-gray-500">Format: DD/MM/YYYY</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <ValidatedTextarea
                                    fieldName="remarks"
                                    validationRules={validationRules}
                                    value={(lr as any).remarks || ''}
                                    onValueChange={(value) => handleValueChange('remarks', value)}
                                    rows={3}
                                    placeholder="Additional notes or remarks for this lorry receipt"
                                />
                            </div>
                        </div>

                        {/* Fixed Layout Sections */}
                        <div className="space-y-6 mb-6 p-4 border border-gray-200 rounded-lg">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Additional Information</h3>
                                <div className="border-t border-gray-300"></div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Schedule of Demurrage Charges */}
                                <EditableSectionBox
                                    title="SCHEDULE OF DEMURRAGE CHARGES"
                                    content={lr.demurrageCharges || '• Free time: 24 hours from arrival\n• Demurrage charges: ₹500 per day after free time\n• Storage charges: ₹200 per day\n• Loading/unloading time: 2 hours each\n• Weekend and holidays included in calculation\n• Charges payable in advance for extended detention'}
                                    onContentChange={(value) => handleValueChange('demurrageCharges', value)}
                                    placeholder="Enter demurrage charges, rates, and conditions..."
                                    rows={6}
                                />

                                {/* Notice */}
                                <EditableSectionBox
                                    title="NOTICE"
                                    content={lr.notice || 'The consignments covered by this Lorry Receipt shall be stored at the destination under the control of the Transport Operator and shall be delivered to or to the order of the Consignee Bank whose name is mentioned in the Lorry Receipt. It will under no circumstances be delivered to anyone without the written authority from the Consignee Bank or its order, endorsed on the Consignee copy or on a separate letter of Authority.'}
                                    onContentChange={(value) => handleValueChange('notice', value)}
                                    placeholder="Enter important legal or shipping-related notices..."
                                    rows={6}
                                />

                                {/* Risk Declaration */}
                                <EditableSectionBox
                                    title="RISK DECLARATION"
                                    content={lr.riskDeclaration || 'Goods are accepted for carriage at owner\'s risk. The carrier shall not be responsible for any loss, damage, or delay due to:\n• Acts of God, natural disasters, or force majeure\n• War, riots, civil commotion, or government actions\n• Inherent vice or nature of goods\n• Improper packing or marking\n• Theft, pilferage, or mysterious disappearance\n\nPlease ensure proper insurance coverage for your consignment. The carrier\'s liability is limited to the freight charges paid.'}
                                    onContentChange={(value) => handleValueChange('riskDeclaration', value)}
                                    placeholder="Describe the risks involved with the consignment and insurance options..."
                                    rows={6}
                                />

                                {/* Important Notice */}
                                <EditableSectionBox
                                    title="IMPORTANT NOTICE"
                                    content={lr.importantNotice || 'This Consignment will not be detained, diverted, re-routed or re-booked without Consignee Bank\'s written permission. We will be delivered at the destination as per the terms and conditions mentioned in this Lorry Receipt. Any deviation from the agreed terms must be communicated in writing and acknowledged by all parties involved.'}
                                    onContentChange={(value) => handleValueChange('importantNotice', value)}
                                    placeholder="Enter any crucial updates or disclaimers about the consignment process..."
                                    rows={6}
                                />
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-between pt-6 border-t border-gray-200">
                            <div className="flex space-x-2">
                                {!existingLr && (
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={clearFormState}
                                        disabled={isSaving}
                                        className="text-red-600 border-red-300 hover:bg-red-50"
                                    >
                                        Clear All Fields
                                    </Button>
                                )}
                            </div>
                            <div className="flex space-x-4">
                                <Button 
                                    type="button" 
                                    variant="secondary" 
                                    onClick={onCancel}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Saving...' : 'Save Consignment Note'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </form>
            </div>
        </div>
    );
};