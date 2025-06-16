import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { User } from '../src/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert data URL (base64) to Blob for Supabase Storage upload
export function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  
  return new Blob([u8arr], { type: mime })
}

// Transform Supabase profile data to User type
export function transformProfileToUser(profile: any): User {
  return {
    id: profile.id,
    name: profile.name,
    dpUrl: profile.profile_photo_url || `https://i.pravatar.cc/300?img=${profile.id}`,
    bio: profile.bio,
    gender: profile.gender,
    age: profile.date_of_birth ? 
      new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() : 25,
    distance: Math.floor(Math.random() * 50) + 1,
    interests: profile.interests || [],
    links: {
      Twitter: profile.twitter_url || '#',
      Instagram: profile.instagram_url || '#',
      LinkedIn: profile.linked_in_url || '#',
    },
    instagramUrl: profile.instagram_url,
    instagramVerified: profile.instagram_verified,
    facebookUrl: profile.facebook_url,
    facebookVerified: profile.facebook_verified,
    linkedInUrl: profile.linked_in_url,
    linkedInVerified: profile.linked_in_verified,
    twitterUrl: profile.twitter_url,
    twitterVerified: profile.twitter_verified,
    googleUrl: profile.google_url,
    googleVerified: profile.google_verified,
  }
}

// Upload image to Supabase Storage and return public URL
export async function uploadProfileImage(
  supabase: any,
  userId: string,
  imageDataURL: string
): Promise<string | null> {
  try {
    // Convert data URL to blob
    const blob = dataURLtoBlob(imageDataURL)
    
    // Generate file path
    const filePath = `avatars/${userId}/profile.jpg`
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, blob, {
        upsert: true, // Overwrite existing file
        contentType: 'image/jpeg'
      })
    
    if (uploadError) {
      console.error('Upload error:', uploadError)
      return null
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)
    
    return urlData.publicUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    return null
  }
}