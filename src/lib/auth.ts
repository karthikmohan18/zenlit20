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
      console.error('OTP verification error:', error.message)
      return { success: false, error: error.message }
    }

    // Check if the response contains a suppressed error (from our custom fetch)
    if (data && typeof data === 'object' && 'code' in data && 'message' in data) {
      const errorData = data as { code: string; message: string }
      return { success: false, error: errorData.message }
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
    
    const { data, error } = await supabase!.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('Sign in error:', error.message)
      // If invalid credentials, suggest using OTP instead
      if (error.message.includes('Invalid login credentials')) {
        return { 
          success: false, 
          error: 'Invalid email or password. If you signed up recently, try using "Forgot password?" to set up your password.' 
        }
      }
      return { success: false, error: error.message }
    }

    console.log('Sign in successful for user:', data.user?.id)
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
    
    const { data, error } = await supabase!.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`.trim()
        }
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