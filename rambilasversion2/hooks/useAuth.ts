import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, getStoredToken, storeToken, removeToken } from '../services/authService';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user has a valid token on app load
    const token = getStoredToken();
    setIsAuthenticated(!!token); // Convert to boolean
    setIsLoading(false); // Set loading to false after check
  }, []);

  // Also check token on every render to stay in sync with ProtectedRoute
  useEffect(() => {
    const token = getStoredToken();
    if (!token && isAuthenticated) {
      setIsAuthenticated(false);
    }
  });

  const handleLogin = async (password: string) => {
    setIsLoading(true);
    setLoginError('');
    
    try {
      // Use only backend JWT authentication
      const loginResult = await login(password);
      
      if (loginResult.success && loginResult.token) {
        storeToken(loginResult.token);
        setIsAuthenticated(true);
        setLoginError('');
        
        // Redirect to the page they were trying to access, or dashboard
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        setLoginError('Invalid password. Please use the correct application password.');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Login failed. Please check your connection and try again.');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    setIsAuthenticated(false);
    navigate('/login', { replace: true });
  };

  return {
    isAuthenticated,
    loginError,
    isLoading,
    handleLogin,
    handleLogout
  };
};



