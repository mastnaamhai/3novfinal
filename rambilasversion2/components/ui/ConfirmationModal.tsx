import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  requirePassword?: boolean;
  destructive?: boolean;
  children?: React.ReactNode;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  requirePassword = false,
  destructive = false,
  children
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (requirePassword && !password.trim()) {
      setError('Password is required');
      return;
    }

    try {
      await onConfirm(password);
      setPassword('');
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              destructive ? 'bg-red-100' : 'bg-yellow-100'
            }`}>
              <span className={`text-2xl ${destructive ? 'text-red-600' : 'text-yellow-600'}`}>
                {destructive ? '⚠️' : '⚠️'}
              </span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600 whitespace-pre-line">{message}</p>
          </div>

          <form onSubmit={handleSubmit}>
            {children && (
              <div className="mb-4">
                {children}
              </div>
            )}

            {requirePassword && (
              <div className="mb-4">
                <Input
                  label="Enter your password to confirm"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  autoComplete="current-password"
                />
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={isLoading}
              >
                {cancelText}
              </Button>
              <Button
                type="submit"
                variant={destructive ? 'danger' : 'primary'}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : confirmText}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
