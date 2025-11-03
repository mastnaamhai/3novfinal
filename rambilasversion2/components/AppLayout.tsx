import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Navigation } from './Navigation';
import { ErrorBoundary } from './ErrorBoundary';
import { ToastContainer, type Toast } from './ui/Toast';
import { PerformanceMonitor } from './ui/PerformanceMonitor';
import { ModalManager } from './ui/ModalManager';
import { GlobalStyles } from './ui/GlobalStyles';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useCustomers } from '../hooks/useCustomers';
import { useAppData } from '../hooks/useAppData';
import { useAuth } from '../hooks/useAuth';
import { useCompanyInfo } from '../hooks/useCompanyInfo';
import { initialCompanyInfo } from '../constants';
import type { CompanyInfo } from '../types';

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, handleLogout, isLoading } = useAuth();
  
  const { customers, fetchCustomers, createCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const { 
    lorryReceipts, 
    invoices, 
    payments, 
    truckHiringNotes, 
    fetchAllData,
    saveLorryReceipt,
    saveInvoice,
    saveTruckHiringNote,
    updateTruckHiringNoteHandler,
    deleteTruckHiringNoteHandler,
    savePayment,
    updateLrStatus,
    deleteLr,
    deleteInvoice,
    handleResetData,
    handleResetBusinessData,
    handleResetAllData,
    handleBackup,
    handleRestore
  } = useAppData();
  
  const { companyInfo, saveCompanyInfo } = useCompanyInfo();

  // Toast state and helpers
  const [toasts, setToasts] = useState<Toast[]>([]);
  const pushToast = (kind: Toast['kind'], message: string) => {
    const id = Date.now() + Math.floor(Math.random()*1000);
    setToasts(prev => [...prev, { id, kind, message }]);
    // auto-dismiss after 5s
    setTimeout(() => dismissToast(id), 5000);
  };
  const dismissToast = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  const handleAndToastApiError = (err: any, fallback: string) => {
    // Try to surface server message or field errors when available
    if (err && typeof err === 'object') {
      // If service returned structured error
      const msg = (err.message && typeof err.message === 'string') ? err.message : '';
      pushToast('error', msg || fallback || 'Something went wrong. Please try again or contact support.');
    } else {
      pushToast('error', fallback || 'Something went wrong. Please try again or contact support.');
    }
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string): Promise<{success: boolean, message: string}> => {
    try {
      const { changePassword } = await import('../services/userService');
      const result = await changePassword(currentPassword, newPassword);
      return result;
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, message: "Failed to change password. Please try again." };
    }
  };

  const saveCustomer = async (customerData: any): Promise<any> => {
    try {
      let savedCustomer;
      if (customerData._id) {
        savedCustomer = await updateCustomer(customerData._id, customerData);
      } else {
        savedCustomer = await createCustomer(customerData);
      }
      return savedCustomer;
    } catch (error) {
      handleAndToastApiError(error, 'Failed to save customer');
      throw error as any;
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      try {
        await deleteCustomer(id);
      } catch (error: any) {
        console.error('Failed to delete customer:', error);
        alert(`Failed to delete client: ${error.message}`);
      }
    }
  };

  // Create context value for child components
  const appContextValue = {
    // Data
    lorryReceipts,
    invoices,
    payments,
    customers,
    truckHiringNotes,
    companyInfo,
    
    // Actions
    saveLorryReceipt,
    saveInvoice,
    saveTruckHiringNote,
    updateTruckHiringNoteHandler,
    deleteTruckHiringNoteHandler,
    savePayment,
    updateLrStatus,
    deleteLr,
    deleteInvoice,
    saveCustomer,
    handleDeleteCustomer,
    handleResetData,
    handleResetBusinessData,
    handleResetAllData,
    handleBackup,
    handleRestore,
    handleChangePassword,
    saveCompanyInfo,
    fetchAllData,
    fetchCustomers,
    
    // Navigation
    navigate,
    location,
    
    // Toast
    pushToast,
    handleAndToastApiError
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated - let ProtectedRoute handle the redirect
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Navigation 
        onLogout={handleLogout}
        isAuthenticated={isAuthenticated}
        companyInfo={{ logo: companyInfo?.logo, name: companyInfo?.name }}
      />
      
      {/* Main content area with responsive layout - Optimized for expanded space */}
      <div className="lg:pl-16">
        {/* Mobile header spacer */}
        <div className="h-16 lg:h-0 safe-area-inset-top" />
        
        <main className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          <div className="mx-auto w-full max-w-none">
            <ErrorBoundary>
              <Outlet context={appContextValue} />
            </ErrorBoundary>
          </div>
        </main>
        
        {/* Mobile bottom nav spacer */}
        <div className="h-20 lg:h-0 safe-area-inset-bottom" />
      </div>
      
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <PerformanceMonitor />
      <ModalManager />
      <GlobalStyles />
    </div>
  );
};
