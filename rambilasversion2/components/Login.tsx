import React, { useState } from 'react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Logo } from './ui/Logo';
import { useAuth } from '../hooks/useAuth';

export const Login: React.FC = () => {
  const { handleLogin, loginError, isLoading } = useAuth();
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Mobile Header */}
        <div className="text-center mb-8 lg:hidden">
          <div className="flex items-center justify-center mb-4">
            <Logo size="md" showText={false} />
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-800">TranspoTruck</h1>
              <p className="text-sm text-gray-600">Transport Management System</p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl border border-white/20">
          {/* Desktop Header */}
          <div className="text-center mb-8 hidden lg:block">
            <div className="flex items-center justify-center mb-4">
              <Logo size="lg" showText={true} className="justify-center" />
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-800">TranspoTruck</h1>
                <p className="text-gray-600">Transport Management</p>
              </div>
            </div>
            <h2 className="text-xl text-gray-600 mt-4">System Login</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                error={loginError}
                placeholder="Enter your password"
                className="text-base"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full py-3 text-base font-semibold" 
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Logging in...
                </div>
              ) : (
                'Login'
              )}
            </Button>
          </form>

          {/* Security Note */}
          <div className="mt-6 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700 text-center">
              🔒 Your data is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};