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

// Check if bucket exists and create if needed
async function ensureBucketExists(bucketName: string): Promise<boolean> {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error listing buckets:', error);
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.warn(`Bucket '${bucketName}' does not exist. Please create it in your Supabase dashboard.`);
      return false;
    }
    
    return true;
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
    const bucketExists = await ensureBucketExists(bucket);
    if (!bucketExists) {
      console.error(`Cannot upload to bucket '${bucket}' - bucket does not exist`);
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
      console.error('Upload error:', uploadError);
      
      // Provide more specific error messages
      if (uploadError.message.includes('Bucket not found')) {
        console.error(`Bucket '${bucket}' not found. Please create the bucket in your Supabase dashboard.`);
      } else if (uploadError.message.includes('not allowed')) {
        console.error(`Upload not allowed. Please check your storage policies for bucket '${bucket}'.`);
      }
      
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

// Upload profile image
export async function uploadProfileImage(
  userId: string,
  imageDataURL: string
): Promise<string | null> {
  const filePath = `${userId}/profile.jpg`;
  return uploadImage('avatars', filePath, imageDataURL);
}

// Upload post image
export async function uploadPostImage(
  userId: string,
  imageDataURL: string
): Promise<string | null> {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const filePath = `${userId}/post_${randomId}_${timestamp}.jpg`;
  return uploadImage('posts', filePath, imageDataURL);
}

// Fallback function to generate a placeholder image URL
export function generatePlaceholderImage(): string {
  const randomId = Math.random().toString(36).substring(2, 15);
  return `https://picsum.photos/800/600?random=${randomId}`;
}