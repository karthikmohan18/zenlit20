import { createClient } from '@supabase/supabase-js'

// Ensure environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables and provide helpful error messages
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable. Please check your .env.local file.')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. Please check your .env.local file.')
}

// Custom fetch function to suppress expected auth error logs
const customFetch = async (url: RequestInfo | URL, options?: RequestInit) => {
  const response = await fetch(url, options)
  
  // Check if this is an auth endpoint request
  const urlString = url.toString()
  const isAuthEndpoint = urlString.includes('/auth/v1/')
  
  if (isAuthEndpoint && (response.status === 400 || response.status === 403)) {
    // Clone the response to read the body without consuming it
    const clonedResponse = response.clone()
    try {
      const body = await clonedResponse.text()
      const errorData = JSON.parse(body)
      
      // Suppress console logs for expected auth errors by returning 200 status
      if (errorData.code === 'otp_expired' || errorData.code === 'invalid_credentials') {
        // Return a 200 response with the error data in the body to prevent Supabase from logging
        return new Response(body, {
          status: 200,
          statusText: 'OK',
          headers: response.headers
        })
      }
    } catch (e) {
      // If we can't parse the body, let the default behavior handle it
    }
  }
  
  return response
}

// Create client - now guaranteed to be non-null
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: customFetch
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export type { User } from '@supabase/supabase-js'