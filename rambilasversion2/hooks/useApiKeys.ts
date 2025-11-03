import { useState, useEffect } from 'react';
import { getApiKeys, getApiKeyValue, createOrUpdateApiKey, deleteApiKey, type ApiKey, type ApiKeyValue } from '../services/apiKeyService';

export const useApiKeys = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApiKeys = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const keys = await getApiKeys();
      setApiKeys(keys);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch API keys');
    } finally {
      setIsLoading(false);
    }
  };

  const getKeyValue = async (keyType: string, password: string): Promise<ApiKeyValue> => {
    try {
      const keyValue = await getApiKeyValue(keyType, password);
      return keyValue;
    } catch (error) {
      console.error('Error fetching API key value:', error);
      throw error;
    }
  };

  const saveApiKey = async (
    keyType: 'gstin' | 'other',
    keyValue: string,
    description: string,
    password: string
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await createOrUpdateApiKey(keyType, keyValue, description, password);
      await fetchApiKeys(); // Refresh the list
    } catch (error) {
      console.error('Error saving API key:', error);
      setError(error instanceof Error ? error.message : 'Failed to save API key');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeApiKey = async (keyType: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteApiKey(keyType, password);
      await fetchApiKeys(); // Refresh the list
    } catch (error) {
      console.error('Error deleting API key:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete API key');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  return {
    apiKeys,
    isLoading,
    error,
    fetchApiKeys,
    getKeyValue,
    saveApiKey,
    removeApiKey,
  };
};
