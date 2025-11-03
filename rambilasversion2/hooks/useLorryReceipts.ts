import { useState, useCallback, useEffect } from 'react';
import { LorryReceipt, LorryReceiptStatus } from '../types';
import {
  getLorryReceipts as getLorryReceiptsService,
  createLorryReceipt as createLorryReceiptService,
  updateLorryReceipt as updateLorryReceiptService,
  deleteLorryReceipt as deleteLorryReceiptService,
} from '../services/lorryReceiptService';

export const useLorryReceipts = (initialLorryReceipts: LorryReceipt[] = []) => {
  const [lorryReceipts, setLorryReceipts] = useState<LorryReceipt[]>(initialLorryReceipts);

  const fetchLorryReceipts = useCallback(async () => {
    try {
      const fetchedLorryReceipts = await getLorryReceiptsService();
      setLorryReceipts(fetchedLorryReceipts);
    } catch (error) {
      console.error('Failed to fetch lorry receipts:', error);
      // Handle error appropriately
    }
  }, []);

  // Fetch lorry receipts on mount
  useEffect(() => {
    fetchLorryReceipts();
  }, [fetchLorryReceipts]);

  const createLorryReceipt = useCallback(async (lrData: Omit<LorryReceipt, 'id' | '_id'>) => {
    try {
      const newLorryReceipt = await createLorryReceiptService(lrData);
      setLorryReceipts(prev => [...prev, newLorryReceipt]);
      return newLorryReceipt;
    } catch (error) {
      console.error('Failed to create lorry receipt:', error);
      throw error;
    }
  }, []);

  const updateLorryReceipt = useCallback(async (id: string, lrData: Partial<LorryReceipt>) => {
    try {
      const updatedLorryReceipt = await updateLorryReceiptService(id, lrData);
      setLorryReceipts(prev => prev.map(lr => (lr._id === id ? updatedLorryReceipt : lr)));
      return updatedLorryReceipt;
    } catch (error) {
      console.error('Failed to update lorry receipt:', error);
      throw error;
    }
  }, []);

  const deleteLorryReceipt = useCallback(async (id: string) => {
    try {
      await deleteLorryReceiptService(id);
      setLorryReceipts(prev => prev.filter(lr => lr._id !== id));
    } catch (error) {
      console.error('Failed to delete lorry receipt:', error);
      throw error;
    }
  }, []);

  const updateLrStatus = useCallback(async (id: string, status: LorryReceiptStatus) => {
    try {
      const updatedLorryReceipt = await updateLorryReceiptService(id, { status });
      setLorryReceipts(prev => prev.map(lr => (lr._id === id ? updatedLorryReceipt : lr)));
    } catch (error) {
      console.error('Failed to update LR status:', error);
      throw error;
    }
  }, []);

  return {
    lorryReceipts,
    fetchLorryReceipts,
    createLorryReceipt,
    updateLorryReceipt,
    deleteLorryReceipt,
    updateLrStatus,
    setLorryReceipts,
  };
};
