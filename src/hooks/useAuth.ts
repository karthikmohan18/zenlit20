import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { AuthService } from '../services/auth.service';
import { ProfileService, ProfileWithSocial } from '../services/profile.service';

export interface AuthState {
  user: User | null;
  profile: ProfileWithSocial | null;
  loading: boolean;
  error: Error | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Get initial user
    const getInitialUser = async () => {
      try {
        const { user, error: userError } = await AuthService.getCurrentUser();
        
        if (userError) {
          // If the error is "Auth session missing!", treat it as a normal logged-out state
          if (userError.message === 'Auth session missing!') {
            setState(prev => ({ ...prev, user: null, profile: null, loading: false, error: null }));
            return;
          }
          
          // For any other error, set the error state
          setState(prev => ({ ...prev, loading: false, error: userError }));
          return;
        }

        if (user) {
          // Get user profile
          const { profile, error: profileError } = await ProfileService.getProfile(user.id);
          
          if (profileError) {
            setState(prev => ({ ...prev, user, loading: false, error: profileError }));
            return;
          }

          setState(prev => ({ ...prev, user, profile, loading: false, error: null }));
        } else {
          setState(prev => ({ ...prev, loading: false, error: null }));
        }
      } catch (error) {
        setState(prev => ({ ...prev, loading: false, error: error as Error }));
      }
    };

    getInitialUser();

    // Listen to auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange(async (user) => {
      if (user) {
        // Get user profile
        const { profile, error: profileError } = await ProfileService.getProfile(user.id);
        
        setState(prev => ({ 
          ...prev, 
          user, 
          profile: profileError ? null : profile, 
          loading: false,
          error: profileError 
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          user: null, 
          profile: null, 
          loading: false,
          error: null 
        }));
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    const { user, error } = await AuthService.signIn({ email, password });
    
    if (error) {
      setState(prev => ({ ...prev, loading: false, error }));
      return { success: false, error };
    }

    return { success: true, error: null };
  };

  const signUp = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
  }) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    const { user, error } = await AuthService.signUp(data);
    
    if (error) {
      setState(prev => ({ ...prev, loading: false, error }));
      return { success: false, error };
    }

    return { success: true, error: null };
  };

  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    const { error } = await AuthService.signOut();
    
    if (error) {
      setState(prev => ({ ...prev, loading: false, error }));
      return { success: false, error };
    }

    return { success: true, error: null };
  };

  const updateProfile = async (updates: any) => {
    if (!state.user) return { success: false, error: new Error('Not authenticated') };

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    const { profile, error } = await ProfileService.updateProfile(state.user.id, updates);
    
    if (error) {
      setState(prev => ({ ...prev, loading: false, error }));
      return { success: false, error };
    }

    // Refresh profile data
    const { profile: updatedProfile } = await ProfileService.getProfile(state.user.id);
    setState(prev => ({ ...prev, profile: updatedProfile, loading: false, error: null }));

    return { success: true, error: null };
  };

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    updateProfile,
    isAuthenticated: !!state.user,
  };
};