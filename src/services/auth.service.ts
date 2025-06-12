import { supabase, auth } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export class AuthService {
  // Sign up with email and password
  static async signUp(data: SignUpData) {
    try {
      const { data: authData, error: authError } = await auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            display_name: `${data.firstName} ${data.lastName}`,
            date_of_birth: data.dateOfBirth,
          }
        }
      });

      if (authError) throw authError;

      return { user: authData.user, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { user: null, error: error as Error };
    }
  }

  // Sign in with email and password
  static async signIn(data: SignInData) {
    try {
      const { data: authData, error: authError } = await auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      return { user: authData.user, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { user: null, error: error as Error };
    }
  }

  // Sign out
  static async signOut() {
    try {
      const { error } = await auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: error as Error };
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      console.error('Get current user error:', error);
      return { user: null, error: error as Error };
    }
  }

  // Get current user profile
  static async getCurrentProfile(): Promise<{ profile: Profile | null; error: Error | null }> {
    try {
      const { user, error: userError } = await this.getCurrentUser();
      if (userError || !user) {
        return { profile: null, error: userError };
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      return { profile, error: null };
    } catch (error) {
      console.error('Get current profile error:', error);
      return { profile: null, error: error as Error };
    }
  }

  // Update user profile
  static async updateProfile(updates: ProfileUpdate) {
    try {
      const { user, error: userError } = await this.getCurrentUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      return { profile: data, error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { profile: null, error: error as Error };
    }
  }

  // Reset password
  static async resetPassword(email: string) {
    try {
      const { error } = await auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: error as Error };
    }
  }

  // Update password
  static async updatePassword(newPassword: string) {
    try {
      const { error } = await auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Update password error:', error);
      return { error: error as Error };
    }
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (user: any) => void) {
    return auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  }
}