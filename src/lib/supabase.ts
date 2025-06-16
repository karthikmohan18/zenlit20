import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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
      
      // Suppress console logs for expected auth errors
      if (errorData.code === 'otp_expired' || errorData.code === 'invalid_credentials') {
        // Return the response without letting Supabase log it
        return response
      }
    } catch (e) {
      // If we can't parse the body, let the default behavior handle it
    }
  }
  
  return response
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    fetch: customFetch
  }
})

export type { User } from '@supabase/supabase-js'