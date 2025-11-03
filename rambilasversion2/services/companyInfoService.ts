import { CompanyInfo } from '../types';

import { API_BASE_URL } from '../constants';

export interface CompanyInfoResponse extends CompanyInfo {
  _id: string;
  bankAccounts: BankAccountResponse[];
  currentBankAccount?: BankAccountResponse;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccountResponse {
  _id: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  accountType: 'Savings' | 'Current' | 'Fixed Deposit' | 'Recurring Deposit';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyInfoData {
  name: string;
  address: string;
  state: string;
  phone1?: string;
  phone2?: string;
  email?: string;
  website?: string;
  gstin?: string;
  pan?: string;
  logo?: string;
  currentBankAccount?: string;
}

export interface UpdateCompanyInfoData extends Partial<CreateCompanyInfoData> {}

// Get company information
export const getCompanyInfo = async (): Promise<CompanyInfoResponse> => {
  const response = await fetch(`${API_BASE_URL}/company-info`);

  if (!response.ok) {
    throw new Error('Failed to fetch company information');
  }

  return response.json();
};

// Create or update company information
export const createOrUpdateCompanyInfo = async (data: CreateCompanyInfoData): Promise<CompanyInfoResponse> => {
  const response = await fetch(`${API_BASE_URL}/company-info`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to save company information');
  }

  return response.json();
};

// Update company information
export const updateCompanyInfo = async (data: UpdateCompanyInfoData): Promise<CompanyInfoResponse> => {
  const response = await fetch(`${API_BASE_URL}/company-info`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update company information');
  }

  return response.json();
};

// Set current bank account
export const setCurrentBankAccount = async (bankAccountId: string): Promise<CompanyInfoResponse> => {
  const response = await fetch(`${API_BASE_URL}/company-info/current-bank-account`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ bankAccountId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to set current bank account');
  }

  return response.json();
};
