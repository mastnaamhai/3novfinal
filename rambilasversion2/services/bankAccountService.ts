import { BankAccountResponse } from './companyInfoService';

import { API_BASE_URL } from '../constants';

export interface CreateBankAccountData {
  accountName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  accountType: 'Savings' | 'Current' | 'Fixed Deposit' | 'Recurring Deposit';
  isActive?: boolean;
}

export interface UpdateBankAccountData extends Partial<CreateBankAccountData> {}

// Get all bank accounts
export const getBankAccounts = async (): Promise<BankAccountResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/bank-accounts`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch bank accounts');
  }

  return response.json();
};

// Get bank account by ID
export const getBankAccountById = async (id: string): Promise<BankAccountResponse> => {
  const response = await fetch(`${API_BASE_URL}/bank-accounts/${id}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch bank account');
  }

  return response.json();
};

// Create bank account
export const createBankAccount = async (data: CreateBankAccountData): Promise<BankAccountResponse> => {
  const response = await fetch(`${API_BASE_URL}/bank-accounts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create bank account');
  }

  return response.json();
};

// Update bank account
export const updateBankAccount = async (id: string, data: UpdateBankAccountData): Promise<BankAccountResponse> => {
  const response = await fetch(`${API_BASE_URL}/bank-accounts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update bank account');
  }

  return response.json();
};

// Delete bank account
export const deleteBankAccount = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/bank-accounts/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete bank account');
  }
};

// Toggle bank account status
export const toggleBankAccountStatus = async (id: string): Promise<BankAccountResponse> => {
  const response = await fetch(`${API_BASE_URL}/bank-accounts/${id}/toggle`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to toggle bank account status');
  }

  return response.json();
};
