import { API_BASE_URL } from '../constants';
import { getAuthHeader } from './authService';

export interface ApiKey {
  _id?: string;
  keyType: 'gstin' | 'other';
  keyValue?: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiKeyValue {
  keyType: string;
  keyValue: string;
  description?: string;
}

/**
 * Get all API keys (without values for security)
 */
export const getApiKeys = async (): Promise<ApiKey[]> => {
  const response = await fetch(`${API_BASE_URL}/api-keys`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch API keys');
  }

  return response.json();
};

/**
 * Get specific API key value (requires password)
 */
export const getApiKeyValue = async (keyType: string, password: string): Promise<ApiKeyValue> => {
  const response = await fetch(`${API_BASE_URL}/api-keys/${keyType}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch API key value');
  }

  return response.json();
};

/**
 * Create or update API key
 */
export const createOrUpdateApiKey = async (
  keyType: 'gstin' | 'other',
  keyValue: string,
  description: string,
  password: string
): Promise<{ message: string; keyType: string; description: string }> => {
  const response = await fetch(`${API_BASE_URL}/api-keys`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ keyType, keyValue, description, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to save API key');
  }

  return response.json();
};

/**
 * Delete API key
 */
export const deleteApiKey = async (keyType: string, password: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/api-keys/${keyType}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete API key');
  }

  return response.json();
};
