export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          display_name: string | null
          bio: string
          avatar_url: string | null
          cover_url: string | null
          date_of_birth: string | null
          gender: 'male' | 'female' | 'other' | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          display_name?: string | null
          bio?: string
          avatar_url?: string | null
          cover_url?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          display_name?: string | null
          bio?: string
          avatar_url?: string | null
          cover_url?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      social_accounts: {
        Row: {
          id: string
          user_id: string
          provider: 'instagram' | 'facebook' | 'linkedin' | 'twitter' | 'google'
          provider_url: string
          is_verified: boolean
          verified_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: 'instagram' | 'facebook' | 'linkedin' | 'twitter' | 'google'
          provider_url: string
          is_verified?: boolean
          verified_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: 'instagram' | 'facebook' | 'linkedin' | 'twitter' | 'google'
          provider_url?: string
          is_verified?: boolean
          verified_at?: string | null
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          title: string | null
          caption: string
          media_url: string
          media_type: 'image' | 'video'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          caption: string
          media_url: string
          media_type?: 'image' | 'video'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          caption?: string
          media_url?: string
          media_type?: 'image' | 'video'
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
      }
      user_interests: {
        Row: {
          id: string
          user_id: string
          interest: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          interest: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          interest?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}