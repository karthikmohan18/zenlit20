import { supabase } from '../lib/supabase';

export class StorageService {
  // Upload file to Supabase storage
  static async uploadFile(
    bucket: string,
    path: string,
    file: File,
    options?: { cacheControl?: string; upsert?: boolean }
  ): Promise<{ url: string | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: options?.cacheControl || '3600',
          upsert: options?.upsert || false
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return { url: urlData.publicUrl, error: null };
    } catch (error) {
      console.error('Upload file error:', error);
      return { url: null, error: error as Error };
    }
  }

  // Upload avatar image
  static async uploadAvatar(userId: string, file: File): Promise<{ url: string | null; error: Error | null }> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;
    
    return this.uploadFile('avatars', fileName, file, { upsert: true });
  }

  // Upload cover image
  static async uploadCover(userId: string, file: File): Promise<{ url: string | null; error: Error | null }> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/cover.${fileExt}`;
    
    return this.uploadFile('covers', fileName, file, { upsert: true });
  }

  // Upload post media
  static async uploadPostMedia(userId: string, file: File): Promise<{ url: string | null; error: Error | null }> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    return this.uploadFile('posts', fileName, file);
  }

  // Delete file from storage
  static async deleteFile(bucket: string, path: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Delete file error:', error);
      return { error: error as Error };
    }
  }

  // Get file URL
  static getFileUrl(bucket: string, path: string): string {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }
}