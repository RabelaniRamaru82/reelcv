import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { AuthModal } from './AuthModal';
import styles from './AppWrapper.module.css';

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
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading ReelCV...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className={styles.welcomeContainer}>
          <div className={styles.welcomeContent}>
            <h1 className={styles.welcomeTitle}>
              Welcome to ReelCV
            </h1>
            <p className={styles.welcomeSubtitle}>Showcase your skills through video</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className={styles.getStartedButton}
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