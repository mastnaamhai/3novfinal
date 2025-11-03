import { API_BASE_URL } from '../constants';
import type { LorryReceipt } from '../types';


export const getLorryReceipts = async (): Promise<LorryReceipt[]> => {
    // Fetch all lorry receipts by setting a high limit
    const response = await fetch(`${API_BASE_URL}/lorryreceipts?limit=1000`);
    if (!response.ok) {
        throw new Error('Failed to fetch lorry receipts');
    }
    const data = await response.json();
    // Handle both paginated and direct array responses
    return Array.isArray(data) ? data : (data.items || []);
};

export const createLorryReceipt = async (lorryReceipt: Omit<LorryReceipt, 'id' | '_id'>): Promise<LorryReceipt> => {
    // Send data as-is, let backend handle transformation
    const response = await fetch(`${API_BASE_URL}/lorryreceipts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(lorryReceipt),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
        console.error('Server validation error:', errorData);
        const details = (errorData?.errors?.fieldErrors) ?
          Object.entries(errorData.errors.fieldErrors)
            .map(([k, v]) => `${k}: ${(v as string[]).join(', ')}`)
            .join(' | ') : undefined;
        const composed = [errorData?.message, details].filter(Boolean).join(' - ');
        const err = new Error(`Failed to create lorry receipt: ${composed || 'Unknown server error'}`);
        (err as any).fieldErrors = errorData?.errors?.fieldErrors;
        throw err;
    }
    return response.json();
};

export const updateLorryReceipt = async (id: string, lorryReceipt: Partial<LorryReceipt>): Promise<LorryReceipt> => {
    // Send data as-is, let backend handle transformation
    const response = await fetch(`${API_BASE_URL}/lorryreceipts/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(lorryReceipt),
    });
    if (!response.ok) {
        throw new Error('Failed to update lorry receipt');
    }
    return response.json();
};

export const deleteLorryReceipt = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/lorryreceipts/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete lorry receipt');
    }
};


export interface UnbilledLrFilters {
    customerId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    search?: string;
}

export const getUnbilledLorryReceipts = async (filters: UnbilledLrFilters = {}): Promise<LorryReceipt[]> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
        }
    });
    
    const response = await fetch(`${API_BASE_URL}/lorryreceipts/unbilled?${params.toString()}`);
    if (!response.ok) {
        throw new Error('Failed to fetch unbilled lorry receipts');
    }
    const data = await response.json();
    return Array.isArray(data) ? data : (data.items || []);
};
