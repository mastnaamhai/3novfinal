export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
    message?: string;
}

export interface ValidationRules {
    [key: string]: ValidationRule;
}

export interface ValidationErrors {
    [key: string]: string;
}

export const validateField = (value: any, rules: ValidationRule): string | null => {
    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
        return rules.message || 'This field is required';
    }

    // Skip other validations if value is empty and not required
    if (!value && !rules.required) {
        return null;
    }

    // String length validations
    if (typeof value === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
            return rules.message || `Must be at least ${rules.minLength} characters`;
        }
        if (rules.maxLength && value.length > rules.maxLength) {
            return rules.message || `Must be no more than ${rules.maxLength} characters`;
        }
    }

    // Number validations
    if (typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min) {
            return rules.message || `Must be at least ${rules.min}`;
        }
        if (rules.max !== undefined && value > rules.max) {
            return rules.message || `Must be no more than ${rules.max}`;
        }
    }

    // Pattern validation
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
        return rules.message || 'Invalid format';
    }

    // Custom validation
    if (rules.custom) {
        return rules.custom(value);
    }

    return null;
};

// Helper function to get nested value from object
const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => {
        if (current === null || current === undefined) return undefined;
        if (key.includes('[') && key.includes(']')) {
            // Handle array access like 'packages.0.description'
            const [arrayKey, indexStr] = key.split('[');
            const index = parseInt(indexStr.replace(']', ''), 10);
            return current[arrayKey]?.[index];
        }
        return current[key];
    }, obj);
};

export const validateForm = (data: any, rules: ValidationRules): ValidationErrors => {
    const errors: ValidationErrors = {};

    for (const [field, fieldRules] of Object.entries(rules)) {
        const value = getNestedValue(data, field);
        const error = validateField(value, fieldRules);
        if (error) {
            errors[field] = error;
        }
    }

    return errors;
};

// Common validation rules
export const commonRules = {
    required: { required: true },
    email: { 
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
        message: 'Invalid email address' 
    },
    phone: { 
        pattern: /^\d{10}$/, 
        message: 'Phone number must be exactly 10 digits' 
    },
    gstin: { 
        pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 
        message: 'Invalid GSTIN format' 
    },
    pan: { 
        pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 
        message: 'Invalid PAN format' 
    },
    positiveNumber: { 
        min: 0, 
        message: 'Must be a positive number' 
    },
    // Note: Backend validation with Zod schemas is the source of truth
};

// Enhanced validation rules for different field types
export const fieldRules = {
    // Text fields
    name: { 
        required: true, 
        minLength: 2, 
        maxLength: 100,
        message: 'Name must be between 2 and 100 characters'
    },
    address: { 
        minLength: 10, 
        maxLength: 500,
        message: 'Address must be between 10 and 500 characters'
    },
    city: { 
        minLength: 2, 
        maxLength: 50,
        message: 'City must be between 2 and 50 characters'
    },
    pin: { 
        required: false,
        pattern: /^[1-9][0-9]{5}$/, 
        message: 'PIN code must be 6 digits starting with 1-9'
    },
    
    // Contact fields
    contactPhone: { 
        pattern: /^\d{10}$/, 
        message: 'Contact phone must be exactly 10 digits'
    },
    contactEmail: { 
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
        message: 'Invalid email address'
    },
    
    // Financial fields
    amount: { 
        required: true, 
        min: 0.01, 
        message: 'Amount must be greater than 0'
    },
    currencyAmount: { 
        required: true, 
        min: 0.01, 
        message: 'Amount must be greater than 0'
    },
    freightRate: { 
        required: false, 
        min: 0.00, 
        message: 'Freight rate must be greater than or equal to 0'
    },
    freightCharges: { 
        required: false, 
        min: 0.00, 
        message: 'Freight charges must be greater than or equal to 0'
    },
    advanceAmount: { 
        min: 0, 
        message: 'Advance amount cannot be negative'
    },
    
    // Vehicle fields
    vehicleNumber: { 
        required: true, 
        minLength: 8,
        maxLength: 15,
        message: 'Vehicle number must be between 8 and 15 characters'
    },
    vehicleCapacity: { 
        required: true, 
        min: 0.1, 
        max: 100,
        message: 'Vehicle capacity must be between 0.1 and 100 tons'
    },
    
    // Package fields
    packageDescription: { 
        required: true, 
        minLength: 5, 
        maxLength: 200,
        message: 'Package description must be between 5 and 200 characters'
    },
    actualWeight: { 
        required: true, 
        min: 0.00, 
        max: 100000,
        message: 'Weight must be between 0.00 and 100,000 kg'
    },
    chargedWeight: { 
        required: true, 
        min: 0.00, 
        max: 100000,
        message: 'Charged weight must be between 0.00 and 100,000 kg'
    },
    
    // Date fields
    date: { 
        required: true, 
        custom: (value: string) => {
            if (!value || value.trim() === '') return 'Date is required';
            const date = new Date(value + 'T00:00:00'); // Force local timezone
            if (isNaN(date.getTime())) return 'Invalid date format';
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (date > today) return 'Date cannot be in the future';
            return null;
        }
    },
    futureDate: { 
        required: true, 
        custom: (value: string) => {
            if (!value) return 'Date is required';
            const date = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (date < today) return 'Date cannot be in the past';
            return null;
        }
    },
    // Allow any valid date (past, present, or future) - useful for custom entries
    anyDate: { 
        required: true, 
        custom: (value: string) => {
            if (!value || value.trim() === '') return 'Date is required';
            const date = new Date(value + 'T00:00:00'); // Force local timezone
            if (isNaN(date.getTime())) return 'Invalid date format';
            return null;
        }
    },
    // Optional date that can be past, present, or future
    optionalDate: { 
        custom: (value: string) => {
            if (!value || value.trim() === '') return null; // Allow empty
            const date = new Date(value + 'T00:00:00'); // Force local timezone
            if (isNaN(date.getTime())) return 'Invalid date format';
            return null;
        }
    },
    
    // GST fields
    gstRate: { 
        min: 0, 
        max: 100,
        message: 'GST rate must be between 0 and 100%'
    },
    
    // Reference fields
    referenceNo: { 
        minLength: 3, 
        maxLength: 50,
        message: 'Reference number must be between 3 and 50 characters'
    },
    
    // Remarks/Notes
    remarks: { 
        maxLength: 1000,
        message: 'Remarks cannot exceed 1000 characters'
    },
    notes: { 
        maxLength: 500,
        message: 'Notes cannot exceed 500 characters'
    }
};

// Date validation helpers
export const validateDateRange = (startDate: string, endDate: string): string | null => {
    if (!startDate || !endDate) return null;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
        return 'End date cannot be before start date';
    }
    
    return null;
};

// GST validation
export const validateGstRate = (rate: number): string | null => {
    if (rate < 0 || rate > 100) {
        return 'GST rate must be between 0 and 100';
    }
    return null;
};

// Weight validation
export const validateWeight = (weight: number): string | null => {
    if (weight <= 0) {
        return 'Weight must be greater than 0';
    }
    if (weight > 100000) {
        return 'Weight seems too high. Please verify.';
    }
    return null;
};
