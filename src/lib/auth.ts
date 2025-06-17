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
      try {
        await ensureProfileExists(data.user)
        console.log('Profile ensured after OTP verification for user:', data.user.id)
      } catch (profileError) {
        console.warn('Profile creation warning after OTP:', profileError)
        // Don't fail the OTP verification if profile creation has issues
      }
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
      try {
        await ensureProfileExists(data.user)
        console.log('Profile ensured after login for user:', data.user.id)
      } catch (profileError) {
        console.warn('Profile creation warning after login:', profileError)
        // Don't fail the login if profile creation has issues
      }
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
      try {
        await ensureProfileExists(data.user, firstName, lastName)
        console.log('Profile ensured after signup for user:', data.user.id)
      } catch (profileError) {
        console.warn('Profile creation warning after signup:', profileError)
        // Don't fail the signup if profile creation has issues
      }
    }

    return { success: true, data }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create account' 
    }
  }
}

// Helper function to ensure profile exists with better error handling and retry logic
export const ensureProfileExists = async (user: any, firstName?: string, lastName?: string) => {
  if (!isSupabaseAvailable()) {
    console.warn('Supabase not available, skipping profile creation')
    return
  }

  try {
    console.log('Ensuring profile exists for user:', user.id)
    
    // Add delay to allow Supabase client session to fully establish
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase!
      .from('profiles')
      .select('id, name, bio, profile_completed')
      .eq('id', user.id)
      .maybeSingle()

    // Only log errors that are not expected "no rows found" scenarios
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Profile check error:', checkError)
      throw new Error(`Failed to check existing profile: ${checkError.message}`)
    }

    // If profile doesn't exist, create it
    if (!existingProfile) {
      console.log('Creating new profile for user:', user.id)
      
      const fullName = firstName && lastName 
        ? `${firstName} ${lastName}`.trim()
        : user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'New User'

      const profileData = {
        id: user.id,
        name: fullName,
        email: user.email,
        bio: 'New to Zenlit! 👋',
        profile_completed: false,
        created_at: new Date().toISOString()
      }

      const { data: newProfile, error: createError } = await supabase!
        .from('profiles')
        .insert(profileData)
        .select()
        .maybeSingle()

      if (createError) {
        console.error('Profile creation error:', createError)
        
        // If it's a unique constraint violation, the profile might have been created by the trigger
        if (createError.code === '23505') {
          console.log('Profile already exists (created by trigger), continuing...')
          return
        }
        
        throw new Error(`Failed to create profile: ${createError.message}`)
      } else {
        console.log('Profile created successfully for user:', user.id, newProfile)
      }
    } else {
      console.log('Profile already exists for user:', user.id, existingProfile)
      
      // If profile exists but is incomplete, update it with better defaults
      if (!existingProfile.name || !existingProfile.bio) {
        console.log('Updating incomplete profile for user:', user.id)
        
        const fullName = firstName && lastName 
          ? `${firstName} ${lastName}`.trim()
          : user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || existingProfile.name || 'New User'

        const { error: updateError } = await supabase!
          .from('profiles')
          .update({
            name: fullName,
            bio: existingProfile.bio || 'New to Zenlit! 👋',
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (updateError) {
          console.warn('Profile update warning:', updateError)
        } else {
          console.log('Profile updated successfully for user:', user.id)
        }
      }
    }
  } catch (error) {
    console.error('Error ensuring profile exists:', error)
    // Don't throw the error to avoid breaking the auth flow
    // The profile setup screen will handle incomplete profiles
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
      try {
        await ensureProfileExists(user)
      } catch (profileError) {
        console.warn('Profile creation warning for current user:', profileError)
      }
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