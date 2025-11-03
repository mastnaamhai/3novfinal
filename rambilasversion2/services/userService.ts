import { getAuthHeader } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Change user password
 */
export const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, message: data.message };
    } else {
      return { success: false, message: data.message || 'Failed to change password' };
    }
  } catch (error) {
    console.error('Change password error:', error);
    return { success: false, message: 'Network error during password change' };
  }
};

/**
 * Get user profile
 */
export const getUserProfile = async (): Promise<{ success: boolean; user?: any; message?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, user: data.user };
    } else {
      return { success: false, message: data.message || 'Failed to get user profile' };
    }
  } catch (error) {
    console.error('Get user profile error:', error);
    return { success: false, message: 'Network error while fetching profile' };
  }
};
