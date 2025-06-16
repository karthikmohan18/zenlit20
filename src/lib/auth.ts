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
    const { error } = await supabase!.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: undefined
      }
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
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
    const { data, error } = await supabase!.auth.verifyOtp({
      email: email,
      token: token,
      type: 'email'
    })

    if (error) {
      return { success: false, error: error.message }
    }

    // Check if the response contains a suppressed error (from our custom fetch)
    if (data && typeof data === 'object' && 'code' in data && 'message' in data) {
      // Type assertion to safely access the message property
      const errorData = data as { code: string; message: string }
      return { success: false, error: errorData.message }
    }

    // Ensure profile exists after successful OTP verification
    if (data.user) {
      await ensureProfileExists(data.user)
    }

    return { success: true, data }
  } catch (error) {
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
    const { data, error } = await supabase!.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      // If invalid credentials, suggest using OTP instead
      if (error.message.includes('Invalid login credentials')) {
        return { 
          success: false, 
          error: 'Invalid email or password. If you signed up recently, try using "Forgot password?" to set up your password.' 
        }
      }
      return { success: false, error: error.message }
    }

    // Ensure profile exists after successful login
    if (data.user) {
      await ensureProfileExists(data.user)
    }

    return { success: true, data }
  } catch (error) {
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
      // If user already exists, try to sign them in instead
      if (error.message.includes('User already registered')) {
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

    // Ensure profile is created after successful signup
    if (data.user) {
      await ensureProfileExists(data.user, firstName, lastName)
    }

    return { success: true, data }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create account' 
    }
  }
}

// Helper function to ensure profile exists with better error handling
export const ensureProfileExists = async (user: any, firstName?: string, lastName?: string) => {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not available, skipping profile creation')
    return
  }

  try {
    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase!
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    // Only log errors that are not expected "no rows found" scenarios
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Profile check error:', checkError)
      return
    }

    // If profile doesn't exist, create it
    if (!existingProfile) {
      const fullName = firstName && lastName 
        ? `${firstName} ${lastName}`.trim()
        : user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'New User'

      const { error: createError } = await supabase!
        .from('profiles')
        .insert({
          id: user.id,
          name: fullName,
          email: user.email,
          bio: 'New to Zenlit! 👋',
          profile_completed: false,
          created_at: new Date().toISOString()
        })

      if (createError) {
        console.error('Profile creation error:', createError)
        throw new Error(`Failed to create profile: ${createError.message}`)
      } else {
        console.log('Profile created successfully for user:', user.id)
      }
    } else {
      console.log('Profile already exists for user:', user.id)
    }
  } catch (error) {
    console.error('Error ensuring profile exists:', error)
    throw error
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

    // Ensure profile exists for the current user
    if (user) {
      await ensureProfileExists(user)
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