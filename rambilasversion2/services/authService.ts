// A simple helper function to convert ArrayBuffer to hex string
const bufferToHex = (buffer: ArrayBuffer): string => {
  return [...new Uint8Array(buffer)]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Hashes a password using the Web Crypto API (SHA-256).
 * @param password The plain text password to hash.
 * @returns A promise that resolves to the hex-encoded hash string.
 */
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hashBuffer);
};

/**
 * Login with password and get JWT token
 */
export const login = async (password: string): Promise<{ success: boolean; token?: string; message: string }> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, token: data.token, message: data.message };
    } else {
      return { success: false, message: data.message || 'Login failed' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Network error during login' };
  }
};

/**
 * Get stored token from localStorage
 */
export const getStoredToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * Store token in localStorage
 */
export const storeToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

/**
 * Remove token from localStorage
 */
export const removeToken = (): void => {
  localStorage.removeItem('auth_token');
};

/**
 * Get authorization header for API requests
 */
export const getAuthHeader = (): { Authorization: string } | {} => {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};