import { useState, useEffect, useCallback } from 'react';
import { getLorryReceipts, createLorryReceipt, updateLorryReceipt, deleteLorryReceipt } from '../services/lorryReceiptService';
import { getInvoices, createInvoice, updateInvoice, deleteInvoice as deleteInvoiceService } from '../services/invoiceService';
import { getPayments, createPayment } from '../services/paymentService';
import { getTruckHiringNotes, createTruckHiringNote, updateTruckHiringNote, deleteTruckHiringNote } from '../services/truckHiringNoteService';
import { resetApplicationData, resetBusinessData, resetAllData, backupData, restoreData } from '../services/dataService';
import { LorryReceiptStatus } from '../types';
import type { LorryReceipt, Invoice, Payment, TruckHiringNote } from '../types';

export const useAppData = () => {
  const [lorryReceipts, setLorryReceipts] = useState<LorryReceipt[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [truckHiringNotes, setTruckHiringNotes] = useState<TruckHiringNote[]>([]);

  const fetchAllData = useCallback(async () => {
    try {
      console.log('=== FETCHING ALL DATA ===');
      const [
        fetchedLorryReceipts,
        fetchedInvoices,
        fetchedPayments,
        fetchedTruckHiringNotes,
      ] = await Promise.all([
        getLorryReceipts(),
        getInvoices(),
        getPayments(),
        getTruckHiringNotes(),
      ]);
      
      console.log('Fetched Lorry Receipts count:', fetchedLorryReceipts?.length || 0);
      console.log('Fetched Invoices count:', fetchedInvoices?.length || 0);
      console.log('Fetched Payments count:', fetchedPayments?.length || 0);
      console.log('Fetched Truck Hiring Notes count:', fetchedTruckHiringNotes?.length || 0);
      console.log('Latest LR numbers:', fetchedLorryReceipts?.slice(0, 3).map(lr => lr.lrNumber) || []);
      console.log('Latest Invoice numbers:', fetchedInvoices?.slice(0, 3).map(inv => inv.invoiceNumber) || []);
      
      // Ensure arrays are never undefined or null
      setLorryReceipts(Array.isArray(fetchedLorryReceipts) ? fetchedLorryReceipts : []);
      setInvoices(Array.isArray(fetchedInvoices) ? fetchedInvoices : []);
      setPayments(Array.isArray(fetchedPayments) ? fetchedPayments : []);
      setTruckHiringNotes(Array.isArray(fetchedTruckHiringNotes) ? fetchedTruckHiringNotes : []);
      
      console.log('Data set in state successfully');
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      // Set empty arrays on error to prevent undefined issues
      setLorryReceipts([]);
      setInvoices([]);
      setPayments([]);
      setTruckHiringNotes([]);
      throw error;
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const saveLorryReceipt = async (lr: Partial<LorryReceipt>) => {
    try {
      console.log('=== SAVING LORRY RECEIPT ===');
      console.log('LR data to save:', lr);
      
      let savedLr;
      if (lr._id) {
        console.log('Updating existing LR:', lr._id);
        savedLr = await updateLorryReceipt(lr._id, lr);
      } else {
        console.log('Creating new LR');
        savedLr = await createLorryReceipt(lr as Omit<LorryReceipt, '_id' | 'id'>);
      }
      
      console.log('LR saved successfully:', savedLr);
      console.log('Refreshing all data...');
      await fetchAllData();
      console.log('Data refresh completed');
    } catch (error) {
      console.error('Failed to save LR:', error);
      throw error;
    }
  };

  const saveInvoice = async (invoice: Partial<Invoice>) => {
    try {
      let savedInvoice;
      if (invoice._id) {
        savedInvoice = await updateInvoice(invoice._id, invoice);
      } else {
        savedInvoice = await createInvoice(invoice as Omit<Invoice, '_id' | 'id'>);
      }

      // Handle both populated LR objects and direct ID strings
      const invoicedLrIds = new Set<string>(
        savedInvoice.lorryReceipts.map(lr => {
          if (typeof lr === 'string') {
            return lr;
          }
          return lr._id;
        }).filter(id => id)
      );
      
      for (const lrId of invoicedLrIds) {
        await updateLorryReceipt(lrId, { status: LorryReceiptStatus.INVOICED });
      }

      await fetchAllData();
    } catch (error) {
      throw error;
    }
  };

  const saveTruckHiringNote = async (note: Partial<Omit<TruckHiringNote, '_id' | 'thnNumber' | 'balanceAmount' | 'paidAmount' | 'payments' | 'status'>>) => {
    try {
      await createTruckHiringNote(note as any);
      await fetchAllData();
    } catch (error) {
      throw error;
    }
  };

  const updateTruckHiringNoteHandler = async (id: string, note: Partial<Omit<TruckHiringNote, '_id' | 'thnNumber' | 'balanceAmount' | 'paidAmount' | 'payments' | 'status'>>) => {
    try {
      await updateTruckHiringNote(id, note);
      await fetchAllData();
    } catch (error) {
      throw error;
    }
  };

  const deleteTruckHiringNoteHandler = async (id: string) => {
    try {
      await deleteTruckHiringNote(id);
      await fetchAllData();
    } catch (error) {
      throw error;
    }
  };

  const savePayment = async (payment: Omit<Payment, '_id' | 'customer' | 'invoice' | 'truckHiringNote'>) => {
    try {
      await createPayment(payment);
      await fetchAllData(); // Refetch all data to update invoices, THNs, and payments
    } catch (error) {
      throw error; // Re-throw to allow components to handle the error
    }
  };

  const updateLrStatus = async (id: string, status: LorryReceiptStatus) => {
    try {
      await updateLorryReceipt(id, { status });
      await fetchAllData();
    } catch (error) {
      throw error;
    }
  };

  const deleteLr = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this Lorry Receipt?')) {
      try {
        await deleteLorryReceipt(id);
        await fetchAllData();
      } catch (error: any) {
        throw error;
      }
    }
  };

  const deleteInvoice = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this Invoice?')) {
      try {
        await deleteInvoiceService(id);
        await fetchAllData();
      } catch (error: any) {
        throw error;
      }
    }
  };

  const handleResetBusinessData = async (password: string) => {
    try {
      await resetBusinessData(password);
      await fetchAllData();
    } catch (error: any) {
      throw error;
    }
  };

  const handleResetAllData = async (password: string) => {
    try {
      await resetAllData(password);
      await fetchAllData();
    } catch (error: any) {
      throw error;
    }
  };

  // Legacy function for backward compatibility
  const handleResetData = handleResetAllData;

  const handleBackup = async () => {
    try {
      const data = await backupData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      throw error;
    }
  };

  const handleRestore = async (data: any) => {
    try {
      await restoreData(data);
      await fetchAllData();
    } catch (error: any) {
      console.error('Restore error:', error);
      throw new Error(`Failed to restore data: ${error.message}`);
    }
  };

  return {
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
  };
};



