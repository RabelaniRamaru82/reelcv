import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { AuthModal } from './AuthModal';

interface AppWrapperProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  isInitializing: boolean;
  user: User | null;
  error: string | null;
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (email: string, password: string, firstName: string, lastName: string, role?: string) => Promise<void>;
  onPasswordReset: (email: string) => Promise<void>;
  isLoading: boolean;
}

export const AppWrapper: React.FC<AppWrapperProps> = ({
  children,
  isAuthenticated,
  isInitializing,
  user,
  error,
  onLogin,
  onSignup,
  onPasswordReset,
  isLoading
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading ReelCV...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Welcome to ReelCV</h1>
            <p className="text-slate-300 mb-8">Showcase your skills through video</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLogin={onLogin}
          onSignup={onSignup}
          onPasswordReset={onPasswordReset}
          isLoading={isLoading}
          error={error}
        />
      </>
    );
  }

  return <>{children}</>;
};