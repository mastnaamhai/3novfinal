import React, { useState } from 'react';
import { BankAccount } from '../../types';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Card } from './Card';

interface BankAccountManagerProps {
  bankAccounts: BankAccount[];
  currentBankAccount?: BankAccount;
  onAddBankAccount: (data: Omit<BankAccount, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateBankAccount: (id: string, data: Partial<BankAccount>) => Promise<void>;
  onDeleteBankAccount: (id: string) => Promise<void>;
  onSetCurrentBankAccount: (id: string) => Promise<void>;
  onToggleBankAccountStatus: (id: string) => Promise<void>;
}

interface BankAccountFormData {
  accountName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  accountType: 'Savings' | 'Current' | 'Fixed Deposit' | 'Recurring Deposit';
  isActive: boolean;
}

export const BankAccountManager: React.FC<BankAccountManagerProps> = ({
  bankAccounts,
  currentBankAccount,
  onAddBankAccount,
  onUpdateBankAccount,
  onDeleteBankAccount,
  onSetCurrentBankAccount,
  onToggleBankAccountStatus,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BankAccountFormData>({
    accountName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branch: '',
    accountType: 'Current',
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingId) {
        await onUpdateBankAccount(editingId, formData);
        setEditingId(null);
      } else {
        await onAddBankAccount(formData);
      }
      resetForm();
    } catch (error) {
      console.error('Failed to save bank account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      accountName: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      branch: '',
      accountType: 'Current',
      isActive: true,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (account: BankAccount) => {
    setFormData({
      accountName: account.accountName,
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      ifscCode: account.ifscCode,
      branch: account.branch,
      accountType: account.accountType,
      isActive: account.isActive,
    });
    setEditingId(account._id!);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this bank account?')) {
      try {
        await onDeleteBankAccount(id);
      } catch (error) {
        console.error('Failed to delete bank account:', error);
      }
    }
  };

  const handleSetCurrent = async (id: string) => {
    try {
      await onSetCurrentBankAccount(id);
    } catch (error) {
      console.error('Failed to set current bank account:', error);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await onToggleBankAccountStatus(id);
    } catch (error) {
      console.error('Failed to toggle bank account status:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Bank Accounts</h3>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
        >
          Add Bank Account
        </Button>
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <Card title={editingId ? 'Edit Bank Account' : 'Add New Bank Account'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                
                name="accountName"
                value={formData.accountName}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Bank Name"
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Account Number"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                required
              />
              <Input
                label="IFSC Code"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Branch"
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                required
              />
              <Select
                label="Account Type"
                name="accountType"
                value={formData.accountType}
                onChange={handleInputChange}
                required
              >
                <option value="Current">Current</option>
                <option value="Savings">Savings</option>
                <option value="Fixed Deposit">Fixed Deposit</option>
                <option value="Recurring Deposit">Recurring Deposit</option>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="rounded border-gray-300"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Active
              </label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="secondary"
                onClick={resetForm}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : editingId ? 'Update' : 'Add'} Bank Account
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Bank Accounts List */}
      <div className="space-y-4">
        {bankAccounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No bank accounts added yet.</p>
            <p className="text-sm">Click "Add Bank Account" to get started.</p>
          </div>
        ) : (
          bankAccounts.map((account) => (
            <Card key={account._id} className={`${!account.isActive ? 'opacity-60' : ''}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-gray-800">{account.accountName}</h4>
                    {currentBankAccount?._id === account._id && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Current
                      </span>
                    )}
                    {!account.isActive && (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <p><strong>Bank:</strong> {account.bankName}</p>
                    <p><strong>Account No:</strong> {account.accountNumber}</p>
                    <p><strong>IFSC:</strong> {account.ifscCode}</p>
                    <p><strong>Branch:</strong> {account.branch}</p>
                    <p><strong>Type:</strong> {account.accountType}</p>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  {currentBankAccount?._id !== account._id && account.isActive && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleSetCurrent(account._id!)}
                    >
                      Set as Current
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEdit(account)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleToggleStatus(account._id!)}
                  >
                    {account.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(account._id!)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
