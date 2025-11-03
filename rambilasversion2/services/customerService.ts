import { API_BASE_URL } from '../constants';
import type { Customer } from '../types';
import { getAuthHeader } from './authService';


export const getCustomers = async (): Promise<Customer[]> => {
    const response = await fetch(`${API_BASE_URL}/customers`, {
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
        },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch customers');
    }
    return response.json();
};

export const createCustomer = async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
        },
        body: JSON.stringify(customer),
    });
    if (!response.ok) {
        if (response.status === 409) {
            // Handle duplicate GSTIN case
            const errorData = await response.json();
            throw new Error(errorData.message || 'Customer with this GSTIN already exists');
        }
        throw new Error('Failed to create customer');
    }
    return response.json();
};

export const updateCustomer = async (id: string, customer: Partial<Customer>): Promise<Customer> => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
        },
        body: JSON.stringify(customer),
    });
    if (!response.ok) {
        throw new Error('Failed to update customer');
    }
    return response.json();
};

export const deleteCustomer = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
        method: 'DELETE',
        headers: {
            ...getAuthHeader(),
        },
    });
    if (!response.ok) {
        throw new Error('Failed to delete customer');
    }
};
