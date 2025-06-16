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

// Upload image to Supabase Storage and return public URL
export async function uploadImage(
  bucket: string,
  filePath: string,
  imageDataURL: string
): Promise<string | null> {
  try {
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
  const filePath = `${userId}/post_${timestamp}.jpg`;
  return uploadImage('posts', filePath, imageDataURL);
}