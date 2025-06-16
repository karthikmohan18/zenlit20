import { createClient } from '@supabase/supabase-js'

// Ensure environment variables are available with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://udixrkvcyrxmmrbadhpj.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkaXhya3ZjeXJ4bW1yYmFkaHBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NjI3MjIsImV4cCI6MjA2NTUzODcyMn0.BXmEyUjCNsZmKUnQHNPE_fIEB6QDIpnxKD6wbgyOHEA'

// Validate environment variables
if (!supabaseUrl) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Create client - now guaranteed to be non-null
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export type { User } from '@supabase/supabase-js'