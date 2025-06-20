import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { User } from '../src/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Transform Supabase profile data to User type
export function transformProfileToUser(profile: any): User {
  return {
    id: profile.id,
    name: profile.name,
    username: profile.username, // Include username
    dpUrl: profile.profile_photo_url || '',
    bio: profile.bio,
    gender: profile.gender,
    age: profile.date_of_birth ? 
      new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() : 25,
    distance: Math.floor(Math.random() * 50) + 1,
    links: {
      Twitter: profile.twitter_url || '#',
      Instagram: profile.instagram_url || '#',
      LinkedIn: profile.linked_in_url || '#',
    },
    latitude: profile.latitude,
    longitude: profile.longitude,
    coverPhotoUrl: profile.cover_photo_url || '',
    instagramUrl: profile.instagram_url,
    linkedInUrl: profile.linked_in_url,
    twitterUrl: profile.twitter_url,
  }
}

// Check if a profile URL is reachable
export async function validateProfileUrl(url: string): Promise<boolean> {
  let reachable = false

  try {
    const res = await fetch(url, { method: 'HEAD' })
    reachable = res.ok
  } catch {
    // ignore network/CORS errors
  }

  if (!reachable) {
    try {
      const res = await fetch(url, { method: 'GET' })
      reachable = res.ok
    } catch {
      // ignore network/CORS errors
    }
  }

  if (reachable) return true

  const linkedin = /^https?:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9\-_]+\/?$/
  const instagram = /^https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9\._]+\/?$/
  const twitter = /^https?:\/\/(www\.)?twitter\.com\/[A-Za-z0-9_]+\/?$/

  return linkedin.test(url) || instagram.test(url) || twitter.test(url)
}

// Upload profile image function for backward compatibility
export async function uploadProfileImage(userId: string, imageDataURL: string): Promise<string | null> {
  try {
    // Import the upload function from storage
    const { uploadImage } = await import('../src/lib/storage');
    const result = await uploadImage('avatars', `${userId}/profile.jpg`, imageDataURL);
    return result.publicUrl;
  } catch (error) {
    console.error('Profile image upload error:', error);
    return null;
  }
}