import { API_BASE_URL } from '../constants';
import type { Invoice } from '../types';


export const getInvoices = async (): Promise<Invoice[]> => {
    // Fetch all invoices by setting a high limit
    const response = await fetch(`${API_BASE_URL}/invoices?limit=1000`);
    if (!response.ok) {
        throw new Error('Failed to fetch invoices');
    }
    const data = await response.json();
    // Handle both paginated and direct array responses
    return Array.isArray(data) ? data : (data.items || []);
};

export const createInvoice = async (invoice: Omit<Invoice, 'id' | '_id'>): Promise<Invoice> => {
    console.log('=== FRONTEND INVOICE SERVICE ===');
    console.log('Original invoice data:', JSON.stringify(invoice, null, 2));
    
    // Send data as-is, let backend handle transformation
    console.log('Making POST request to:', `${API_BASE_URL}/invoices`);
    console.log('Request body:', JSON.stringify(invoice, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/invoices`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoice),
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
        const details = (errorData?.errors?.fieldErrors) ?
          Object.entries(errorData.errors.fieldErrors)
            .map(([k, v]) => `${k}: ${(v as string[]).join(', ')}`)
            .join(' | ') : undefined;
        const composed = [errorData?.message, details].filter(Boolean).join(' - ');
        const err = new Error(composed || 'Failed to create invoice');
        (err as any).fieldErrors = errorData?.errors?.fieldErrors;
        throw err;
    }
    return response.json();
};

export const updateInvoice = async (id: string, invoice: Partial<Invoice>): Promise<Invoice> => {
    // Transform frontend data format to backend format
    const backendData = { ...invoice };
    
    if (invoice.customerId) {
        backendData.customer = invoice.customerId;
        delete (backendData as any).customerId;
    }
    
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
    });
    if (!response.ok) {
        throw new Error('Failed to update invoice');
    }
    return response.json();
};

export const deleteInvoice = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Failed to delete invoice');
    }
};
