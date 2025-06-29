import React from 'react';
import { AuthModal as BaseAuthModal } from '@reelapps/ui';
import { useAuthStore } from '@reelapps/auth';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { login, signup, sendPasswordResetEmail, isLoading, error } = useAuthStore();

  return (
    <BaseAuthModal
      isOpen={isOpen}
      onClose={onClose}
      onLogin={login}
      onSignup={signup}
      onPasswordReset={sendPasswordResetEmail}
      isLoading={isLoading}
      error={error}
      title="Access ReelCV"
      subtitle="Showcase your skills through video"
      primaryColor="#10b981"
    />
  );
}; 