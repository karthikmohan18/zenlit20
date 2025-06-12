import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Post = Database['public']['Tables']['posts']['Row'];
type PostInsert = Database['public']['Tables']['posts']['Insert'];
type PostUpdate = Database['public']['Tables']['posts']['Update'];

export interface PostWithProfile extends Post {
  profiles: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export class PostsService {
  // Create a new post
  static async createPost(post: PostInsert): Promise<{ post: Post | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert(post)
        .select()
        .single();

      if (error) throw error;

      return { post: data, error: null };
    } catch (error) {
      console.error('Create post error:', error);
      return { post: null, error: error as Error };
    }
  }

  // Get posts feed with user profiles
  static async getFeed(limit = 20, offset = 0): Promise<{ posts: PostWithProfile[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            id,
            display_name,
            avatar_url
          )
        `)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { posts: data as PostWithProfile[], error: null };
    } catch (error) {
      console.error('Get feed error:', error);
      return { posts: [], error: error as Error };
    }
  }

  // Get posts by user ID
  static async getUserPosts(userId: string, limit = 20, offset = 0): Promise<{ posts: PostWithProfile[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('user_id', userId)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { posts: data as PostWithProfile[], error: null };
    } catch (error) {
      console.error('Get user posts error:', error);
      return { posts: [], error: error as Error };
    }
  }

  // Update a post
  static async updatePost(postId: string, updates: PostUpdate): Promise<{ post: Post | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', postId)
        .select()
        .single();

      if (error) throw error;

      return { post: data, error: null };
    } catch (error) {
      console.error('Update post error:', error);
      return { post: null, error: error as Error };
    }
  }

  // Delete a post
  static async deletePost(postId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Delete post error:', error);
      return { error: error as Error };
    }
  }

  // Get single post by ID
  static async getPost(postId: string): Promise<{ post: PostWithProfile | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            id,
            display_name,
            avatar_url
          )
        `)
        .eq('id', postId)
        .single();

      if (error) throw error;

      return { post: data as PostWithProfile, error: null };
    } catch (error) {
      console.error('Get post error:', error);
      return { post: null, error: error as Error };
    }
  }
}