import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
type SocialAccount = Database['public']['Tables']['social_accounts']['Row'];
type SocialAccountInsert = Database['public']['Tables']['social_accounts']['Insert'];
type UserInterest = Database['public']['Tables']['user_interests']['Row'];

export interface ProfileWithSocial extends Profile {
  social_accounts: SocialAccount[];
  user_interests: UserInterest[];
}

export class ProfileService {
  // Get profile by ID with social accounts and interests
  static async getProfile(userId: string): Promise<{ profile: ProfileWithSocial | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          social_accounts (*),
          user_interests (*)
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;

      return { profile: data as ProfileWithSocial, error: null };
    } catch (error) {
      console.error('Get profile error:', error);
      return { profile: null, error: error as Error };
    }
  }

  // Get all profiles for discovery
  static async getProfiles(limit = 20, offset = 0): Promise<{ profiles: ProfileWithSocial[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          social_accounts (*),
          user_interests (*)
        `)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { profiles: data as ProfileWithSocial[], error: null };
    } catch (error) {
      console.error('Get profiles error:', error);
      return { profiles: [], error: error as Error };
    }
  }

  // Update profile
  static async updateProfile(userId: string, updates: ProfileUpdate): Promise<{ profile: Profile | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return { profile: data, error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { profile: null, error: error as Error };
    }
  }

  // Add or update social account
  static async upsertSocialAccount(socialAccount: SocialAccountInsert): Promise<{ account: SocialAccount | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('social_accounts')
        .upsert(socialAccount, {
          onConflict: 'user_id,provider'
        })
        .select()
        .single();

      if (error) throw error;

      return { account: data, error: null };
    } catch (error) {
      console.error('Upsert social account error:', error);
      return { account: null, error: error as Error };
    }
  }

  // Remove social account
  static async removeSocialAccount(userId: string, provider: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('user_id', userId)
        .eq('provider', provider);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Remove social account error:', error);
      return { error: error as Error };
    }
  }

  // Add user interest
  static async addInterest(userId: string, interest: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('user_interests')
        .insert({
          user_id: userId,
          interest: interest
        });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Add interest error:', error);
      return { error: error as Error };
    }
  }

  // Remove user interest
  static async removeInterest(userId: string, interest: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('user_interests')
        .delete()
        .eq('user_id', userId)
        .eq('interest', interest);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Remove interest error:', error);
      return { error: error as Error };
    }
  }

  // Search profiles by name or interests
  static async searchProfiles(query: string, limit = 20): Promise<{ profiles: ProfileWithSocial[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          social_accounts (*),
          user_interests (*)
        `)
        .or(`display_name.ilike.%${query}%,bio.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      return { profiles: data as ProfileWithSocial[], error: null };
    } catch (error) {
      console.error('Search profiles error:', error);
      return { profiles: [], error: error as Error };
    }
  }
}