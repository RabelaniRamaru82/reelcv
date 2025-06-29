import { useState, useEffect, useCallback } from 'react';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  initialize: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

let supabaseClient: SupabaseClient | null = null;

export const initializeSupabase = (url: string, anonKey: string) => {
  if (!supabaseClient) {
    supabaseClient = createClient(url, anonKey);
  }
  return supabaseClient;
};

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized');
  }
  return supabaseClient;
};

export const useAuthStore = (): AuthState & AuthActions => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: false,
    isAuthenticated: false,
    error: null
  });

  const refreshProfile = useCallback(async () => {
    if (!supabaseClient || !state.user) return;
    
    try {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', state.user.id)
        .maybeSingle();
      
      if (!error) {
        setState(prev => ({ ...prev, profile: data }));
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  }, [state.user]);

  const initialize = useCallback(async () => {
    if (!supabaseClient) return;
    
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session?.user) {
        setState(prev => ({
          ...prev,
          user: session.user,
          isAuthenticated: true,
          isLoading: false
        }));
        // Don't call refreshProfile here to avoid circular dependency
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Authentication error',
        isLoading: false
      }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    if (!supabaseClient) throw new Error('Supabase not initialized');
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      setState(prev => ({
        ...prev,
        user: data.user,
        isAuthenticated: true,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false
      }));
      throw error;
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string, role = 'candidate') => {
    if (!supabaseClient) throw new Error('Supabase not initialized');
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        setState(prev => ({
          ...prev,
          user: data.user,
          isAuthenticated: true,
          isLoading: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Signup failed',
        isLoading: false
      }));
      throw error;
    }
  };

  const logout = async () => {
    if (!supabaseClient) return;
    
    await supabaseClient.auth.signOut();
    setState({
      user: null,
      profile: null,
      isLoading: false,
      isAuthenticated: false,
      error: null
    });
  };

  const sendPasswordResetEmail = async (email: string) => {
    if (!supabaseClient) throw new Error('Supabase not initialized');
    
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  useEffect(() => {
    if (!supabaseClient) return;

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setState(prev => ({
            ...prev,
            user: session.user,
            isAuthenticated: true
          }));
        } else {
          setState({
            user: null,
            profile: null,
            isLoading: false,
            isAuthenticated: false,
            error: null
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Separate effect for refreshing profile when user changes
  useEffect(() => {
    if (state.user && !state.profile) {
      refreshProfile();
    }
  }, [state.user, state.profile, refreshProfile]);

  return {
    ...state,
    login,
    signup,
    logout,
    sendPasswordResetEmail,
    initialize,
    refreshProfile
  };
};