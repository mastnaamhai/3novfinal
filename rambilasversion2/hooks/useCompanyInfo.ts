import { useState, useCallback, useEffect } from 'react';
import { CompanyInfo, BankAccount } from '../types';
import {
  getCompanyInfo as getCompanyInfoService,
  createOrUpdateCompanyInfo as createOrUpdateCompanyInfoService,
  updateCompanyInfo as updateCompanyInfoService,
  setCurrentBankAccount as setCurrentBankAccountService,
} from '../services/companyInfoService';
import {
  getBankAccounts as getBankAccountsService,
  createBankAccount as createBankAccountService,
  updateBankAccount as updateBankAccountService,
  deleteBankAccount as deleteBankAccountService,
  toggleBankAccountStatus as toggleBankAccountStatusService,
} from '../services/bankAccountService';

export const useCompanyInfo = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanyInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCompanyInfoService();
      setCompanyInfo(data);
      setBankAccounts(data.bankAccounts || []);
    } catch (err: any) {
      console.error('Failed to fetch company info:', err);
      setError(err.message || 'Failed to fetch company information');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBankAccounts = useCallback(async () => {
    try {
      const accounts = await getBankAccountsService();
      setBankAccounts(accounts);
    } catch (err: any) {
      console.error('Failed to fetch bank accounts:', err);
      setError(err.message || 'Failed to fetch bank accounts');
    }
  }, []);

  const saveCompanyInfo = useCallback(async (data: Partial<CompanyInfo>) => {
    try {
      setError(null);
      const updatedInfo = await createOrUpdateCompanyInfoService(data as any);
      setCompanyInfo(updatedInfo);
      setBankAccounts(updatedInfo.bankAccounts || []);
      return updatedInfo;
    } catch (err: any) {
      console.error('Failed to save company info:', err);
      setError(err.message || 'Failed to save company information');
      throw err;
    }
  }, []);

  const updateCompanyInfo = useCallback(async (data: Partial<CompanyInfo>) => {
    try {
      setError(null);
      const updatedInfo = await updateCompanyInfoService(data as any);
      setCompanyInfo(updatedInfo);
      setBankAccounts(updatedInfo.bankAccounts || []);
      return updatedInfo;
    } catch (err: any) {
      console.error('Failed to update company info:', err);
      setError(err.message || 'Failed to update company information');
      throw err;
    }
  }, []);

  const createBankAccount = useCallback(async (data: Omit<BankAccount, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const newAccount = await createBankAccountService(data as any);
      setBankAccounts(prev => [...prev, newAccount]);
      
      // Refresh company info to get updated bank accounts
      await fetchCompanyInfo();
      return newAccount;
    } catch (err: any) {
      console.error('Failed to create bank account:', err);
      setError(err.message || 'Failed to create bank account');
      throw err;
    }
  }, [fetchCompanyInfo]);

  const updateBankAccount = useCallback(async (id: string, data: Partial<BankAccount>) => {
    try {
      setError(null);
      const updatedAccount = await updateBankAccountService(id, data as any);
      setBankAccounts(prev => prev.map(account => 
        account._id === id ? updatedAccount : account
      ));
      return updatedAccount;
    } catch (err: any) {
      console.error('Failed to update bank account:', err);
      setError(err.message || 'Failed to update bank account');
      throw err;
    }
  }, []);

  const deleteBankAccount = useCallback(async (id: string) => {
    try {
      setError(null);
      await deleteBankAccountService(id);
      setBankAccounts(prev => prev.filter(account => account._id !== id));
      
      // Refresh company info to get updated bank accounts
      await fetchCompanyInfo();
    } catch (err: any) {
      console.error('Failed to delete bank account:', err);
      setError(err.message || 'Failed to delete bank account');
      throw err;
    }
  }, [fetchCompanyInfo]);

  const toggleBankAccountStatus = useCallback(async (id: string) => {
    try {
      setError(null);
      const updatedAccount = await toggleBankAccountStatusService(id);
      setBankAccounts(prev => prev.map(account => 
        account._id === id ? updatedAccount : account
      ));
      return updatedAccount;
    } catch (err: any) {
      console.error('Failed to toggle bank account status:', err);
      setError(err.message || 'Failed to toggle bank account status');
      throw err;
    }
  }, []);

  const setCurrentBankAccount = useCallback(async (bankAccountId: string) => {
    try {
      setError(null);
      const updatedInfo = await setCurrentBankAccountService(bankAccountId);
      setCompanyInfo(updatedInfo);
      setBankAccounts(updatedInfo.bankAccounts || []);
      return updatedInfo;
    } catch (err: any) {
      console.error('Failed to set current bank account:', err);
      setError(err.message || 'Failed to set current bank account');
      throw err;
    }
  }, []);

  // Fetch company info on mount
  useEffect(() => {
    fetchCompanyInfo();
  }, [fetchCompanyInfo]);

  return {
    companyInfo,
    bankAccounts,
    isLoading,
    error,
    fetchCompanyInfo,
    fetchBankAccounts,
    saveCompanyInfo,
    updateCompanyInfo,
    createBankAccount,
    updateBankAccount,
    deleteBankAccount,
    toggleBankAccountStatus,
    setCurrentBankAccount,
  };
};
