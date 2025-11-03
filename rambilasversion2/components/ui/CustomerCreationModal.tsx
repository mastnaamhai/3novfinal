import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Select } from './Select';
import { ValidatedInput } from './ValidatedInput';
import { ValidatedSelect } from './ValidatedSelect';
import { ValidatedCitySelect } from './ValidatedCitySelect';
import { ValidatedTextarea } from './ValidatedTextarea';
import { PincodeInput } from './PincodeInput';
import { StateCityDropdown } from './StateCityDropdown';
import { fetchGstDetails } from '../../services/simpleGstService';
import { indianStates } from '../../constants';
import { useFormValidation } from '../../hooks/useFormValidation';
import { fieldRules } from '../../services/formValidation';
import type { Customer } from '../../types';
import type { PincodeDetails } from '../../services/pincodeService';

interface CustomerCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Omit<Customer, 'id'>) => Promise<Customer>;
  onSelect: (customer: Customer) => void;
}

export const CustomerCreationModal: React.FC<CustomerCreationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onSelect
}) => {
  const [formData, setFormData] = useState<Partial<Customer>>({
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

  const [isVerifying, setIsVerifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Validation rules for customer form - only name and pincode are required
  const validationRules = {
    name: fieldRules.name,
    tradeName: { maxLength: 100, message: 'Trade name cannot exceed 100 characters' },
    address: fieldRules.address,
    state: fieldRules.city, // Make state optional, will be auto-filled from pincode
    city: fieldRules.city,
    pin: fieldRules.pin,
    gstin: { 
      pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 
      message: 'Invalid GSTIN format' 
    },
    contactPerson: { maxLength: 100, message: 'Contact person name cannot exceed 100 characters' },
    contactPhone: fieldRules.contactPhone,
    contactEmail: fieldRules.contactEmail,
    phone: fieldRules.phone,
    email: fieldRules.contactEmail
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearFieldError(name);
  };

  const handleValueChange = (fieldName: string, value: any) => {
    clearFieldError(fieldName);
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handlePincodeFound = (details: PincodeDetails) => {
    setFormData(prev => ({
      ...prev,
      city: details.city,
      state: details.state,
      pin: details.pincode
    }));
  };

  const handlePincodeNotFound = () => {
    // Enable manual entry of city and state when pincode is not found
    setFormData(prev => ({
      ...prev,
      city: prev.city || '',
      state: prev.state || ''
    }));
  };

  const handleVerifyGstin = async () => {
    if (!formData.gstin || formData.gstin.length !== 15) {
      setVerifyStatus({ message: 'Please enter a valid 15-digit GSTIN.', type: 'error' });
      return;
    }
    setIsVerifying(true);
    setVerifyStatus(null);
    setErrors(prev => ({...prev, gstin: undefined}));
    try {
      const result = await fetchGstDetails(formData.gstin);
      
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
      setVerifyStatus({ message: error.message || 'Verification failed.', type: 'error' });
    } finally {
      setIsVerifying(false);
    }
  };

  const validate = () => {
    const formErrors = validateEntireForm(formData);
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    setIsSaving(true);
    try {
      const { _id, ...customerData } = formData as Customer;
      
      // Filter out empty strings for optional fields to prevent MongoDB duplicate key errors
      const processedCustomerData = {
        ...customerData,
        gstin: customerData.gstin && customerData.gstin.trim() !== '' ? customerData.gstin : undefined,
        contactPerson: customerData.contactPerson && customerData.contactPerson.trim() !== '' ? customerData.contactPerson : undefined,
        contactPhone: customerData.contactPhone && customerData.contactPhone.trim() !== '' ? customerData.contactPhone : undefined,
        contactEmail: customerData.contactEmail && customerData.contactEmail.trim() !== '' ? customerData.contactEmail : undefined,
        city: customerData.city && customerData.city.trim() !== '' ? customerData.city : undefined,
        pin: customerData.pin && customerData.pin.trim() !== '' ? customerData.pin : undefined,
        phone: customerData.phone && customerData.phone.trim() !== '' ? customerData.phone : undefined,
        email: customerData.email && customerData.email.trim() !== '' ? customerData.email : undefined,
        tradeName: customerData.tradeName && customerData.tradeName.trim() !== '' ? customerData.tradeName : undefined,
      };
      
      const newCustomer = await onSave(processedCustomerData);
      onSelect(newCustomer);
      onClose();
      // Reset form
      setFormData({
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
      setErrors({});
      setVerifyStatus(null);
    } catch (error: any) {
      setVerifyStatus({ message: error.message || 'Failed to save customer.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4 overflow-y-auto" data-form-modal="true">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-4 sm:my-8 max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Add New Customer</h2>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              size="sm"
            >
              ✕
            </Button>
          </div>

          <div className="space-y-6">
            {/* Required Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Required Information</h3>
              <div className="space-y-4">
                <ValidatedInput
                  fieldName="name"
                  validationRules={validationRules}
                  value={formData.name || ''}
                  onValueChange={(value) => handleValueChange('name', value)}
                  required
                  label="Customer Name"
                  placeholder="Enter customer name"
                />
                
                <PincodeInput
                  label="PIN Code"
                  name="pin"
                  value={formData.pin || ''}
                  onChange={handleChange}
                  onPincodeFound={handlePincodeFound}
                  onPincodeNotFound={handlePincodeNotFound}
                  error={errors.pin}
                  helpText="Enter pincode to auto-fill city and state"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StateCityDropdown
                    label="City"
                    name="city"
                    value={formData.city || ''}
                    onChange={handleChange}
                    onCityChange={(city) => handleValueChange('city', city)}
                    type="city"
                    selectedState={formData.state}
                    placeholder={formData.pin ? "Auto-filled from pincode" : "Enter city manually"}
                    error={errors.city}
                  />
                  <StateCityDropdown
                    label="State"
                    name="state"
                    value={formData.state || ''}
                    onChange={handleChange}
                    onStateChange={(state) => handleValueChange('state', state)}
                    type="state"
                    placeholder={formData.pin ? "Auto-filled from pincode" : "Enter state manually"}
                    error={errors.state}
                  />
                </div>
              </div>
            </div>

            {/* Optional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Optional Information</h3>
              
              {/* GSTIN Verification */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  GSTIN (Optional)
                </label>
                <div className="flex items-end space-x-2">
                  <Input
                    name="gstin"
                    value={formData.gstin || ''}
                    onChange={handleChange}
                    placeholder="Enter 15-digit GSTIN"
                    maxLength={15}
                    className="flex-grow"
                    error={errors.gstin}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleVerifyGstin}
                    disabled={isVerifying || !formData.gstin || formData.gstin.length !== 15}
                    size="sm"
                  >
                    {isVerifying ? 'Verifying...' : 'Fetch Details'}
                  </Button>
                </div>
                {verifyStatus && (
                  <div className={`text-sm p-2 rounded ${
                    verifyStatus.type === 'success' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {verifyStatus.message}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ValidatedInput
                  fieldName="tradeName"
                  validationRules={validationRules}
                  value={formData.tradeName || ''}
                  onValueChange={(value) => handleValueChange('tradeName', value)}
                  label="Trade Name"
                  placeholder="Enter trade name (optional)"
                />
              </div>

              <ValidatedTextarea
                fieldName="address"
                validationRules={validationRules}
                value={formData.address || ''}
                onValueChange={(value) => handleValueChange('address', value)}
                label="Address"
                placeholder="Enter address (optional)"
                rows={3}
              />
            </div>

            {/* Contact Information */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Contact Person"
                  name="contactPerson"
                  value={formData.contactPerson || ''}
                  onChange={handleChange}
                />
                <Input
                  label="Contact Phone"
                  name="contactPhone"
                  value={formData.contactPhone || ''}
                  onChange={handleChange}
                />
                <Input
                  label="Contact Email"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail || ''}
                  onChange={handleChange}
                />
                <Input
                  label="Phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save & Select Customer'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
