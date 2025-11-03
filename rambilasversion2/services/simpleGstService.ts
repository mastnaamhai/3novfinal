import { Customer } from '../types';
import { getApiKeyValue } from './apiKeyService';

/**
 * Simple GST verification service
 * Direct API call with basic error handling - no caching or database storage
 */

export interface GstVerificationResult {
  success: boolean;
  data?: Omit<Customer, '_id'>;
  error?: string;
}

/**
 * Get GST API key from database or fallback to environment
 */
const getGstApiKey = async (): Promise<string> => {
  try {
    // Try to get API key from database first
    const apiKeyData = await getApiKeyValue('gstin', '');
    return apiKeyData.keyValue;
  } catch (error) {
    console.log('Could not fetch API key from database, using environment fallback');
    // Fallback to environment variable
    const envKey = import.meta.env.VITE_GSTIN_API_KEY;
    if (!envKey || envKey.length < 32 || envKey.includes('$VITE_GSTIN_API_KEY')) {
      return 'c1cc01d4e40144bf607b6a4fe5be83c6'; // Fallback key
    }
    return envKey;
  }
};

/**
 * Fetch GST details from external API
 * @param gstin - 15-digit GSTIN number
 * @returns Promise with verification result
 */
export const fetchGstDetails = async (gstin: string): Promise<GstVerificationResult> => {
  // Validate GSTIN format
  if (!gstin || gstin.length !== 15 || !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin)) {
    return {
      success: false,
      error: 'Please enter a valid 15-digit GSTIN.'
    };
  }

  // Get API key from database or environment
  const GSTIN_API_KEY = await getGstApiKey();

  if (!GSTIN_API_KEY || GSTIN_API_KEY.trim() === '') {
    return {
      success: false,
      error: 'GSTIN API Key is not configured. Please configure your GST API key in Settings > API Keys.'
    };
  }

  const baseUrl = 'https://sheet.gstincheck.co.in';
  const apiUrl = `${baseUrl}/check/${GSTIN_API_KEY}/${gstin}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          error: 'GST API authentication failed. Please check API key configuration.'
        };
      } else if (response.status === 429) {
        return {
          success: false,
          error: 'GST API rate limit exceeded. Please try again later.'
        };
      } else if (response.status >= 500) {
        return {
          success: false,
          error: 'GST API server error. Please try again later.'
        };
      } else {
        return {
          success: false,
          error: `API call failed with status ${response.status}. Please try again.`
        };
      }
    }

    const data = await response.json();

    if (!data.flag) {
      // Handle specific error cases
      if (data.message === 'Credit Not Available.' || data.errorCode === 'CREDIT_NOT_AVAILABLE') {
        return {
          success: false,
          error: 'GST API credits exhausted. Please enter customer details manually using the "Add Manually" option.'
        };
      }
      
      return {
        success: false,
        error: data.message || 'GSTIN not found or invalid. Please verify the GSTIN number.'
      };
    }

    const apiData = data.data;
    if (!apiData) {
      return {
        success: false,
        error: 'GSTIN data not found in response. Please try again.'
      };
    }

    // Map API response to Customer type
    const customerDetails: Omit<Customer, '_id'> = {
      name: apiData.lgnm || apiData.tradeName || 'N/A',
      tradeName: apiData.tradeName || apiData.lgnm || '',
      address: apiData.stj || apiData.addr || 'N/A',
      state: apiData.stjCd || apiData.state || 'N/A',
      gstin: gstin,
      contactPerson: '',
      contactPhone: '',
      contactEmail: '',
    };

    return {
      success: true,
      data: customerDetails
    };

  } catch (error: any) {
    console.error("Error fetching GSTIN details:", error);
    
    // Handle different types of errors
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timeout. GST API is taking too long to respond. Please try again.'
      };
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Network error. Please check your internet connection and try again.'
      };
    } else if (error.message.includes('GSTIN not found') || error.message.includes('GST Number not found')) {
      return {
        success: false,
        error: 'GSTIN not found. Please verify the GSTIN number or enter customer details manually.'
      };
    } else if (error.message.includes('Credit Not Available') || error.message.includes('credit') || error.message.includes('quota')) {
      return {
        success: false,
        error: 'GST API credits exhausted. Please enter customer details manually or contact administrator to refill API credits.'
      };
    } else {
      return {
        success: false,
        error: `Failed to fetch GSTIN details: ${error.message}`
      };
    }
  }
};
