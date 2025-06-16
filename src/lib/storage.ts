import { supabase } from './supabase';

// Convert data URL (base64) to Blob for Supabase Storage upload
export function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}

// Check if bucket exists
async function checkBucketExists(bucketName: string): Promise<boolean> {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error listing buckets:', error);
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    return bucketExists || false;
  } catch (error) {
    console.error('Error checking bucket existence:', error);
    return false;
  }
}

// Upload image to Supabase Storage and return public URL
export async function uploadImage(
  bucket: string,
  filePath: string,
  imageDataURL: string
): Promise<string | null> {
  try {
    // Check if bucket exists first
    const bucketExists = await checkBucketExists(bucket);
    if (!bucketExists) {
      console.warn(`Storage bucket '${bucket}' does not exist. Please create it in your Supabase dashboard.`);
      return null;
    }

    // Convert data URL to blob
    const blob = dataURLtoBlob(imageDataURL);
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, blob, {
        upsert: true, // Overwrite existing file
        contentType: 'image/jpeg'
      });
    
    if (uploadError) {
      console.error(`Upload error to bucket '${bucket}':`, uploadError);
      return null;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

// Upload profile image with fallback
export async function uploadProfileImage(
  userId: string,
  imageDataURL: string
): Promise<string | null> {
  try {
    const filePath = `${userId}/profile.jpg`;
    const result = await uploadImage('avatars', filePath, imageDataURL);
    
    if (!result) {
      console.warn('Profile image upload failed, using fallback');
    }
    
    return result;
  } catch (error) {
    console.error('Profile image upload error:', error);
    return null;
  }
}

// Upload post image with fallback
export async function uploadPostImage(
  userId: string,
  imageDataURL: string
): Promise<string | null> {
  try {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const filePath = `${userId}/post_${randomId}_${timestamp}.jpg`;
    
    const result = await uploadImage('posts', filePath, imageDataURL);
    
    if (!result) {
      console.warn('Post image upload failed, will use placeholder');
    }
    
    return result;
  } catch (error) {
    console.error('Post image upload error:', error);
    return null;
  }
}

// Fallback function to generate a placeholder image URL
export function generatePlaceholderImage(): string {
  const randomId = Math.random().toString(36).substring(2, 15);
  return `https://picsum.photos/800/600?random=${randomId}`;
}

// Check storage availability
export async function checkStorageAvailability(): Promise<{
  avatarsAvailable: boolean;
  postsAvailable: boolean;
  message: string;
}> {
  try {
    const avatarsExists = await checkBucketExists('avatars');
    const postsExists = await checkBucketExists('posts');
    
    let message = '';
    if (!avatarsExists && !postsExists) {
      message = 'Storage buckets are not configured. Image uploads are disabled.';
    } else if (!avatarsExists) {
      message = 'Profile photo uploads are disabled. Post images may work.';
    } else if (!postsExists) {
      message = 'Post image uploads are disabled. Profile photos may work.';
    } else {
      message = 'Storage is fully available.';
    }
    
    return {
      avatarsAvailable: avatarsExists,
      postsAvailable: postsExists,
      message
    };
  } catch (error) {
    console.error('Error checking storage availability:', error);
    return {
      avatarsAvailable: false,
      postsAvailable: false,
      message: 'Unable to check storage availability.'
    };
  }
}