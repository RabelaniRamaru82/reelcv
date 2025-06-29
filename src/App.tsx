import React, { useEffect, useState } from 'react';
import { useAuthStore, initializeSupabase } from './hooks/useAuth';
import { AppWrapper } from './components/ui/AppWrapper';
import CandidateDashboard from './CandidateDashboard';
import PublicCV from './PublicCV';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

const PrivateApp: React.FC = () => {
  const {
    initialize,
    isLoading,
    isAuthenticated,
    user,
    login,
    signup,
    sendPasswordResetEmail,
    error,
  } = useAuthStore();
  const [localInitializing, setLocalInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseAnonKey) throw new Error('Missing Supabase env');
        initializeSupabase(supabaseUrl, supabaseAnonKey);
        await initialize();
      } catch (err) {
        setInitError(err instanceof Error ? err.message : 'Init error');
      } finally {
        setLocalInitializing(false);
      }
    };
    init();
  }, []); // Empty dependency array to run only once

  if (localInitializing || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (initError) {
    return <div className="min-h-screen flex items-center justify-center">{initError}</div>;
  }

  return (
    <AppWrapper
      isAuthenticated={isAuthenticated}
      isInitializing={false}
      user={user}
      error={error}
      onLogin={login}
      onSignup={signup}
      onPasswordReset={sendPasswordResetEmail}
      isLoading={isLoading}
    >
      <CandidateDashboard />
    </AppWrapper>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/public/:slug" element={<PublicCV />} />
        <Route path="/*" element={<PrivateApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;