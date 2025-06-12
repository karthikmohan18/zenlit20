import { Database } from './lib/database.types';

// Use Supabase types as base
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type Post = Database['public']['Tables']['posts']['Row'];
export type PostInsert = Database['public']['Tables']['posts']['Insert'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type MessageInsert = Database['public']['Tables']['messages']['Insert'];
export type SocialAccount = Database['public']['Tables']['social_accounts']['Row'];
export type UserInterest = Database['public']['Tables']['user_interests']['Row'];

// Extended types with relations
export interface ProfileWithSocial extends Profile {
  social_accounts: SocialAccount[];
  user_interests: UserInterest[];
}

export interface PostWithProfile extends Post {
  profiles: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface MessageWithProfiles extends Message {
  sender: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  receiver: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface Conversation {
  user: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  last_message: Message | null;
  unread_count: number;
}

// Legacy types for components that still need them (will be gradually removed)
export interface User {
  id: string;
  name: string;
  dpUrl: string;
  bio: string;
  gender: 'male' | 'female';
  age: number;
  distance: number;
  interests: string[];
  links: {
    Twitter: string;
    Instagram: string;
    LinkedIn: string;
  };
  // Social media verification fields
  instagramUrl?: string;
  instagramVerified?: boolean;
  facebookUrl?: string;
  facebookVerified?: boolean;
  linkedInUrl?: string;
  linkedInVerified?: boolean;
  twitterUrl?: string;
  twitterVerified?: boolean;
  googleUrl?: string;
  googleVerified?: boolean;
  stories?: Story[];
}

export interface Story {
  id: string;
  mediaUrl: string;
  caption: string;
  timestamp: string;
}

export interface Media {
  id: string;
  mediaUrl: string;
  caption?: string;
  timestamp: string;
}

export interface SocialProvider {
  id: 'instagram' | 'facebook' | 'linkedin' | 'twitter' | 'google';
  name: string;
  color: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export interface OAuthState {
  isConnecting: boolean;
  error: string | null;
  provider: string | null;
}

// Utility functions to convert between types
export function profileToUser(profile: ProfileWithSocial): User {
  const socialAccounts = profile.social_accounts || [];
  const interests = profile.user_interests?.map(i => i.interest) || [];
  
  // Calculate age from date_of_birth
  const age = profile.date_of_birth 
    ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear()
    : 25;

  // Get social account URLs
  const getAccountUrl = (provider: string) => 
    socialAccounts.find(acc => acc.provider === provider)?.provider_url || `https://${provider}.com/user`;
  
  const getAccountVerified = (provider: string) =>
    socialAccounts.find(acc => acc.provider === provider)?.is_verified || false;

  return {
    id: profile.id,
    name: profile.display_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User',
    dpUrl: profile.avatar_url || `https://i.pravatar.cc/300?u=${profile.id}`,
    bio: profile.bio || '',
    gender: (profile.gender as 'male' | 'female') || 'male',
    age,
    distance: Math.floor(Math.random() * 250), // Mock distance for now
    interests,
    links: {
      Twitter: getAccountUrl('twitter'),
      Instagram: getAccountUrl('instagram'),
      LinkedIn: getAccountUrl('linkedin'),
    },
    instagramUrl: getAccountUrl('instagram'),
    instagramVerified: getAccountVerified('instagram'),
    facebookUrl: getAccountUrl('facebook'),
    facebookVerified: getAccountVerified('facebook'),
    linkedInUrl: getAccountUrl('linkedin'),
    linkedInVerified: getAccountVerified('linkedin'),
    twitterUrl: getAccountUrl('twitter'),
    twitterVerified: getAccountVerified('twitter'),
    googleUrl: getAccountUrl('google'),
    googleVerified: getAccountVerified('google'),
    stories: [] // Mock stories for now
  };
}

export function postWithProfileToLegacyPost(post: PostWithProfile): {
  id: string;
  userId: string;
  userName: string;
  userDpUrl: string;
  title: string;
  mediaUrl: string;
  caption: string;
  timestamp: string;
} {
  return {
    id: post.id,
    userId: post.user_id,
    userName: post.profiles?.display_name || 'User',
    userDpUrl: post.profiles?.avatar_url || `https://i.pravatar.cc/300?u=${post.user_id}`,
    title: post.title || '',
    mediaUrl: post.media_url,
    caption: post.caption,
    timestamp: post.created_at
  };
}