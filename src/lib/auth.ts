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

export const sendOTP = async (email: string): Promise<AuthResponse> => {
  if (!isSupabaseAvailable()) {
    return { success: false, error: 'Service temporarily unavailable' }
  }

  try {
    console.log('Sending OTP to:', email)
    const { error } = await supabase!.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: undefined
      }
    })

    if (error) {
      console.error('OTP send error:', error.message)
      return { success: false, error: error.message }
    }

    console.log('OTP sent successfully')
    return { success: true }
  } catch (error) {
    console.error('OTP send catch error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send OTP' 
    }
  }
}

export const verifyOTP = async (email: string, token: string): Promise<AuthResponse> => {
  if (!isSupabaseAvailable()) {
    return { success: false, error: 'Service temporarily unavailable' }
  }

  try {
    console.log('Verifying OTP for:', email)
    const { data, error } = await supabase!.auth.verifyOtp({
      email: email,
      token: token,
      type: 'email'
    })

    if (error) {
      // Handle specific OTP errors more gracefully
      if (error.message.includes('Token has expired') || error.message.includes('otp_expired')) {
        return { success: false, error: 'Verification code has expired. Please request a new one.' }
      }
      if (error.message.includes('invalid_credentials') || error.message.includes('Invalid')) {
        return { success: false, error: 'Invalid verification code. Please check and try again.' }
      }
      console.error('OTP verification error:', error.message)
      return { success: false, error: error.message }
    }

    console.log('OTP verified successfully')
    return { success: true, data }
  } catch (error) {
    console.error('OTP verification catch error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to verify OTP' 
    }
  }
}

export const signInWithPassword = async (email: string, password: string): Promise<AuthResponse> => {
  if (!isSupabaseAvailable()) {
    return { success: false, error: 'Service temporarily unavailable' }
  }

  try {
    console.log('Attempting to sign in user:', email)
    
    // First, clear any existing session to avoid conflicts
    await supabase!.auth.signOut()
    
    // Wait a moment for the sign out to complete
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const { data, error } = await supabase!.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password
    })

    if (error) {
      console.error('Sign in error:', error.message)
      
      // Handle specific error cases with better messages
      if (error.message.includes('Invalid login credentials')) {
        return { 
          success: false, 
          error: 'Invalid email or password. Please check your credentials and try again.' 
        }
      }
      
      if (error.message.includes('Email not confirmed')) {
        return { 
          success: false, 
          error: 'Please check your email and click the confirmation link before signing in.' 
        }
      }
      
      if (error.message.includes('Too many requests')) {
        return { 
          success: false, 
          error: 'Too many login attempts. Please wait a moment and try again.' 
        }
      }
      
      return { success: false, error: error.message }
    }

    // Verify we have both user and session
    if (!data.user) {
      return { success: false, error: 'Authentication failed - no user data received' }
    }

    if (!data.session) {
      return { success: false, error: 'Authentication failed - no session created' }
    }

    console.log('Sign in successful for user:', data.user.id)
    console.log('Session created:', !!data.session)
    
    return { success: true, data }
  } catch (error) {
    console.error('Sign in catch error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to sign in' 
    }
  }
}

export const signUpWithPassword = async (
  email: string, 
  password: string, 
  firstName: string, 
  lastName: string
): Promise<AuthResponse> => {
  if (!isSupabaseAvailable()) {
    return { success: false, error: 'Service temporarily unavailable' }
  }

  try {
    console.log('Attempting to sign up user:', email)
    
    // Clear any existing session first
    await supabase!.auth.signOut()
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const { data, error } = await supabase!.auth.signUp({
      email: email.trim().toLowerCase(),
      password: password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`.trim()
        },
        emailRedirectTo: undefined // Disable email confirmation for now
      }
    })

    if (error) {
      console.error('Sign up error:', error.message)
      
      // If user already exists, try to sign them in instead
      if (error.message.includes('User already registered')) {
        console.log('User already exists, attempting sign in...')
        const signInResult = await signInWithPassword(email, password)
        if (signInResult.success) {
          return { success: true, data: signInResult.data }
        } else {
          return { 
            success: false, 
            error: 'Account already exists. Please sign in instead or use "Forgot password?" if you need to reset your password.' 
          }
        }
      }
      
      return { success: false, error: error.message }
    }

    console.log('Sign up successful for user:', data.user?.id)
    
    // Check if user needs email confirmation
    if (data.user && !data.session) {
      return { 
        success: false, 
        error: 'Account created successfully! Please check your email and click the confirmation link to complete registration.' 
      }
    }
    
    // If we have both user and session, signup was successful and user is logged in
    if (data.user && data.session) {
      console.log('User signed up and logged in successfully')
      return { success: true, data }
    }
    
    // Profile is automatically created by the database trigger
    return { success: true, data }
  } catch (error) {
    console.error('Sign up catch error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create account' 
    }
  }
}

// Alternative sign-in method using OTP (for users who can't remember password)
export const signInWithOTP = async (email: string): Promise<AuthResponse> => {
  if (!isSupabaseAvailable()) {
    return { success: false, error: 'Service temporarily unavailable' }
  }

  try {
    console.log('Attempting OTP sign-in for:', email)
    
    // Clear any existing session first
    await supabase!.auth.signOut()
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const { error } = await supabase!.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: false, // Don't create new user, only sign in existing
        emailRedirectTo: undefined
      }
    })

    if (error) {
      console.error('OTP sign-in error:', error.message)
      return { success: false, error: error.message }
    }

    console.log('OTP sent for sign-in')
    return { success: true }
  } catch (error) {
    console.error('OTP sign-in catch error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send sign-in code' 
    }
  }
}

export const resetPassword = async (email: string): Promise<AuthResponse> => {
  if (!isSupabaseAvailable()) {
    return { success: false, error: 'Service temporarily unavailable' }
  }

  try {
    const { error } = await supabase!.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send reset email' 
    }
  }
}

export const getCurrentUser = async () => {
  if (!isSupabaseAvailable()) {
    return { success: false, error: 'Service temporarily unavailable' }
  }

  try {
    const { data: { user }, error } = await supabase!.auth.getUser()
    
    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: user }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get user' 
    }
  }
}

export const signOut = async (): Promise<AuthResponse> => {
  if (!isSupabaseAvailable()) {
    return { success: false, error: 'Service temporarily unavailable' }
  }

  try {
    const { error } = await supabase!.auth.signOut()
    
    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to sign out' 
    }
  }
}

// Helper function to check if user session is valid
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

    // Verify the session is not expired
    if (session.expires_at && session.expires_at * 1000 < Date.now()) {
      return { success: false, error: 'Session expired' }
    }

    return { success: true, data: session }
  } catch (error) {
    console.error('Session check catch error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to check session' 
    }
  }
}