import { useState, useCallback, useEffect } from 'react';
import { Customer } from '../types';
import {
  getCustomers as getCustomersService,
  createCustomer as createCustomerService,
  updateCustomer as updateCustomerService,
  deleteCustomer as deleteCustomerService,
} from '../services/customerService';

export const useCustomers = (initialCustomers: Customer[] = []) => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);

  const fetchCustomers = useCallback(async () => {
    try {
      const fetchedCustomers = await getCustomersService();
      setCustomers(fetchedCustomers);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      // Handle error appropriately, e.g., show a toast message
    }
  }, []);

  // Fetch customers on mount
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const createCustomer = useCallback(async (customerData: Omit<Customer, 'id'>) => {
    try {
      const newCustomer = await createCustomerService(customerData);
      setCustomers(prev => [...prev, newCustomer]);
      return newCustomer;
    } catch (error) {
      console.error('Failed to create customer:', error);
      throw error;
    }
  }, []);

  const updateCustomer = useCallback(async (id: string, customerData: Partial<Customer>) => {
    try {
      const updatedCustomer = await updateCustomerService(id, customerData);
      setCustomers(prev => prev.map(c => (c._id === id ? updatedCustomer : c)));
      return updatedCustomer;
    } catch (error) {
      console.error('Failed to update customer:', error);
      throw error;
    }
  }, []);

  const deleteCustomer = useCallback(async (id: string) => {
    try {
      await deleteCustomerService(id);
      setCustomers(prev => prev.filter(c => c._id !== id));
    } catch (error) {
      console.error('Failed to delete customer:', error);
      throw error;
    }
  }, []);

  return {
    customers,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    setCustomers,
  };
};
