// src/lib/storage.ts
import { supabase } from './supabase';
import { resizeImage, dataURLtoBlob, validateImageFile } from '../utils/imageUtils';

// Convert data URL (base64) to Blob for Supabase Storage upload
export function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1].replace(/\s/g, ''));
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}

// Check if bucket exists with improved error handling
async function checkBucketExists(bucketName: string): Promise<boolean> {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.warn(`Could not list buckets: ${error.message}`);
      return true; // assume existence to avoid blocking
    }
    if (buckets.some(b => b.name === bucketName)) return true;
    // fallback direct access check
    const { error: testError } = await supabase.storage.from(bucketName).list('', { limit: 1 });
    return !testError;
  } catch {
    return true;
  }
}

// Generic upload helper
export async function uploadImage(
  bucket: string,
  filePath: string,
  imageDataURL: string
): Promise<string | null> {
  if (!(await checkBucketExists(bucket))) {
    console.warn(`Bucket "${bucket}" does not exist.`);
    return null;
  }
  const blob = dataURLtoBlob(imageDataURL);
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, blob, { upsert: true, contentType: blob.type });
  if (uploadError) {
    console.error(`Upload to "${bucket}" failed: ${uploadError.message}`);
    return null;
  }
  return supabase.storage.from(bucket).getPublicUrl(filePath).data.publicUrl;
}

// Upload profile image with resizing
export async function uploadProfileImage(file: File): Promise<string | null>;
export async function uploadProfileImage(userId: string, imageDataURL: string): Promise<string | null>;
export async function uploadProfileImage(arg1: File | string, arg2?: string): Promise<string | null> {
  try {
    if (arg1 instanceof File) {
      const file = arg1;
      
      // Validate file
      const validation = validateImageFile(file, 5); // 5MB limit for profile images
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Resize image for profile picture (400x400 max)
      const resizedDataURL = await resizeImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.8
      });

      const blob = dataURLtoBlob(resizedDataURL);
      const path = `${Date.now()}_${file.name}`;
      
      const { error } = await supabase.storage.from('avatars').upload(path, blob, { upsert: true });
      if (error) throw error;
      
      return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
    } else {
      // fallback using data URL
      return await uploadImage('avatars', `${arg1}/profile.jpg`, arg2!);
    }
  } catch (error) {
    console.error('Profile image upload error:', error);
    return null;
  }
}

// Upload banner image with resizing
export async function uploadBannerImage(file: File): Promise<string | null> {
  try {
    // Validate file
    const validation = validateImageFile(file, 10); // 10MB limit for banner images
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Resize image for banner (1200x400 max, maintaining aspect ratio)
    const resizedDataURL = await resizeImage(file, {
      maxWidth: 1200,
      maxHeight: 400,
      quality: 0.8
    });

    const blob = dataURLtoBlob(resizedDataURL);
    const path = `${Date.now()}_${file.name}`;
    
    const { error } = await supabase.storage.from('banner').upload(path, blob, { upsert: true });
    if (error) throw error;
    
    return supabase.storage.from('banner').getPublicUrl(path).data.publicUrl;
  } catch (error) {
    console.error('Banner image upload error:', error);
    return null;
  }
}

// Upload post image (unchanged)
export async function uploadPostImage(
  userId: string,
  imageDataURL: string
): Promise<string | null> {
  try {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const filePath = `${userId}/post_${randomId}_${timestamp}.jpg`;
    const result = await uploadImage('posts', filePath, imageDataURL);
    if (!result) console.warn('Post image upload failed; using placeholder.');
    return result;
  } catch (error) {
    console.error('Post image upload error:', error);
    return null;
  }
}

// Delete image from storage
export async function deleteImage(bucket: string, filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) {
      console.error(`Failed to delete image from ${bucket}:`, error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Delete image error:', error);
    return false;
  }
}

// Extract file path from Supabase storage URL
export function extractFilePathFromUrl(url: string, bucket: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === bucket);
    
    if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
      return pathParts.slice(bucketIndex + 1).join('/');
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting file path from URL:', error);
    return null;
  }
}

// Fallback placeholder
export function generatePlaceholderImage(): string {
  return '/images/default-post.jpg';
}

// Check storage availability (unchanged)
export async function checkStorageAvailability(): Promise<{
  avatarsAvailable: boolean;
  postsAvailable: boolean;
  bannerAvailable: boolean;
  message: string;
}> {
  try {
    const [avatarsExists, postsExists, bannerExists] = await Promise.all([
      checkBucketExists('avatars'),
      checkBucketExists('posts'),
      checkBucketExists('banner'),
    ]);
    
    let message = '';
    if (!avatarsExists && !postsExists && !bannerExists) {
      message = 'No storage buckets found; using placeholders.';
    } else if (!avatarsExists) {
      message = 'Profile uploads unavailable; posts and banners ok.';
    } else if (!postsExists) {
      message = 'Post uploads unavailable; profiles and banners ok.';
    } else if (!bannerExists) {
      message = 'Banner uploads unavailable; profiles and posts ok.';
    } else {
      message = 'All storage buckets available.';
    }
    
    return { 
      avatarsAvailable: avatarsExists, 
      postsAvailable: postsExists,
      bannerAvailable: bannerExists,
      message 
    };
  } catch (error) {
    console.warn('Storage availability check error:', error);
    return { 
      avatarsAvailable: true, 
      postsAvailable: true, 
      bannerAvailable: true,
      message: 'Assuming storage available.' 
    };
  }
}