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

// SIGNUP FLOW: Send OTP for new user registration
export const sendSignupOTP = async (email: string): Promise<AuthResponse> => {
  if (!isSupabaseAvailable()) {
    return { success: false, error: 'Service temporarily unavailable' }
  }

  try {
    console.log('Sending signup OTP to:', email)
    
    const { data, error } = await supabase!.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: true, // Always create user for signup
        emailRedirectTo: undefined
      }
    })

    if (error) {
      console.error('Signup OTP error:', error.message)
      
      if (error.message.includes('rate limit')) {
        return { success: false, error: 'Too many requests. Please wait before requesting another code.' }
      }
      
      if (error.message.includes('invalid email')) {
        return { success: false, error: 'Please enter a valid email address.' }
      }
      
      return { success: false, error: error.message }
    }

    console.log('Signup OTP sent successfully')
    return { success: true, data }
  } catch (error) {
    console.error('Signup OTP catch error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send verification code' 
    }
  }
}

// SIGNUP FLOW: Verify OTP and complete registration
export const verifySignupOTP = async (email: string, token: string): Promise<AuthResponse> => {
  if (!isSupabaseAvailable()) {
    return { success: false, error: 'Service temporarily unavailable' }
  }

  try {
    console.log('Verifying signup OTP for:', email)
    
    const { data, error } = await supabase!.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type: 'email'
    })

    if (error) {
      console.error('Signup OTP verification error:', error.message)
      
      if (error.message.includes('Token has expired') || error.message.includes('otp_expired')) {
        return { success: false, error: 'Verification code has expired. Please request a new one.' }
      }
      
      if (error.message.includes('invalid_credentials') || error.message.includes('Invalid')) {
        return { success: false, error: 'Invalid verification code. Please check and try again.' }
      }
      
      return { success: false, error: error.message }
    }

    if (!data.user || !data.session) {
      return { success: false, error: 'Registration failed. Please try again.' }
    }

    console.log('Signup OTP verified successfully, user registered and logged in')
    return { success: true, data }
  } catch (error) {
    console.error('Signup OTP verification catch error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to verify code' 
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
          error: 'Please verify your email address first.' 
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