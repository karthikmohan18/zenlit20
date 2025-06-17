import { supabase } from './supabase'

export interface AuthResponse {
  success: boolean
  error?: string
  data?: any
}

// Check if Supabase is available
const isSupabaseAvailable = () => {
  if (!supabase) {
    console.error('Supabase client not initialized. Check environment variables.')
    return false
  }
  return true
}

// SIGNUP FLOW: Create account with email and password
export const signUpWithPassword = async (
  email: string, 
  password: string, 
  firstName?: string, 
  lastName?: string
): Promise<AuthResponse> => {
  if (!isSupabaseAvailable()) {
    return { success: false, error: 'Service temporarily unavailable' }
  }

  try {
    console.log('Creating account with email/password for:', email)
    
    const { data, error } = await supabase!.auth.signUp({
      email: email.trim().toLowerCase(),
      password: password,
      options: {
        data: {
          first_name: firstName || '',
          last_name: lastName || '',
          full_name: firstName && lastName ? `${firstName} ${lastName}`.trim() : firstName || lastName || ''
        }
      }
    })

    if (error) {
      console.error('Signup error:', error.message)
      
      if (error.message.includes('User already registered')) {
        return { 
          success: false, 
          error: 'An account with this email already exists. Please sign in instead.' 
        }
      }
      
      if (error.message.includes('Password should be at least')) {
        return { 
          success: false, 
          error: 'Password must be at least 6 characters long.' 
        }
      }
      
      if (error.message.includes('invalid email')) {
        return { success: false, error: 'Please enter a valid email address.' }
      }
      
      return { success: false, error: error.message }
    }

    if (!data.user) {
      return { success: false, error: 'Account creation failed. Please try again.' }
    }

    console.log('Account created successfully for user:', data.user.id)
    
    // Check if email confirmation is required
    if (!data.session && data.user && !data.user.email_confirmed_at) {
      return { 
        success: false, 
        error: 'Please check your email and click the confirmation link to complete registration.' 
      }
    }

    // If we have a session, the user is immediately logged in
    if (data.session) {
      console.log('User signed up and logged in immediately')
      return { success: true, data }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Signup catch error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create account' 
    }
  }
}

// LOGIN FLOW: Password-based login for existing users
export const signInWithPassword = async (email: string, password: string): Promise<AuthResponse> => {
  if (!isSupabaseAvailable()) {
    return { success: false, error: 'Service temporarily unavailable' }
  }

  try {
    console.log('Attempting password login for:', email)
    
    const { data, error } = await supabase!.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password
    })

    if (error) {
      console.error('Password login error:', error.message)
      
      if (error.message.includes('Invalid login credentials')) {
        return { 
          success: false, 
          error: 'Invalid email or password. Please check your credentials and try again.' 
        }
      }
      
      if (error.message.includes('Email not confirmed')) {
        return { 
          success: false, 
          error: 'Please verify your email address first by clicking the link in your email.' 
        }
      }
      
      if (error.message.includes('Too many requests')) {
        return { 
          success: false, 
          error: 'Too many login attempts. Please wait and try again.' 
        }
      }
      
      return { success: false, error: error.message }
    }

    if (!data.user || !data.session) {
      return { success: false, error: 'Login failed. Please try again.' }
    }

    console.log('Password login successful for user:', data.user.id)
    return { success: true, data }
  } catch (error) {
    console.error('Password login catch error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to sign in' 
    }
  }
}

// FORGOT PASSWORD: Send reset email
export const sendPasswordReset = async (email: string): Promise<AuthResponse> => {
  if (!isSupabaseAvailable()) {
    return { success: false, error: 'Service temporarily unavailable' }
  }

  try {
    console.log('Sending password reset to:', email)
    
    const { error } = await supabase!.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: `${window.location.origin}/reset-password`
      }
    )

    if (error) {
      console.error('Password reset error:', error.message)
      return { success: false, error: error.message }
    }

    console.log('Password reset email sent successfully')
    return { success: true }
  } catch (error) {
    console.error('Password reset catch error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send reset email' 
    }
  }
}

// UTILITY: Sign out
export const signOut = async (): Promise<AuthResponse> => {
  if (!isSupabaseAvailable()) {
    return { success: false, error: 'Service temporarily unavailable' }
  }

  try {
    const { error } = await supabase!.auth.signOut()
    
    if (error) {
      console.error('Sign out error:', error.message)
      return { success: false, error: error.message }
    }

    console.log('User signed out successfully')
    return { success: true }
  } catch (error) {
    console.error('Sign out catch error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to sign out' 
    }
  }
}

// UTILITY: Check current session
export const checkSession = async (): Promise<AuthResponse> => {
  if (!isSupabaseAvailable()) {
    return { success: false, error: 'Service temporarily unavailable' }
  }

  try {
    const { data: { session }, error } = await supabase!.auth.getSession()
    
    if (error) {
      console.error('Session check error:', error.message)
      return { success: false, error: error.message }
    }

    if (!session) {
      return { success: false, error: 'No active session' }
    }

    if (session.expires_at && session.expires_at * 1000 < Date.now()) {
      return { success: false, error: 'Session expired' }
    }

    console.log('Valid session found for user:', session.user.id)
    return { success: true, data: session }
  } catch (error) {
    console.error('Session check catch error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to check session' 
    }
  }
}

// UTILITY: Get current user
export const getCurrentUser = async (): Promise<AuthResponse> => {
  if (!isSupabaseAvailable()) {
    return { success: false, error: 'Service temporarily unavailable' }
  }

  try {
    const { data: { user }, error } = await supabase!.auth.getUser()
    
    if (error) {
      console.error('Get user error:', error.message)
      return { success: false, error: error.message }
    }

    return { success: true, data: user }
  } catch (error) {
    console.error('Get user catch error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get user' 
    }
  }
}