import { supabase } from './supabase'

export interface AuthResponse {
  success: boolean
  error?: string
  data?: any
}

export const sendOTP = async (email: string): Promise<AuthResponse> => {
  try {
    const { error } = await supabase.auth.signInWithOtp({
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
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: token,
      type: 'email'
    })

    if (error) {
      return { success: false, error: error.message }
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
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
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
  try {
    const { data, error } = await supabase.auth.signUp({
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

    return { success: true, data }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create account' 
    }
  }
}

export const resetPassword = async (email: string): Promise<AuthResponse> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
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
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
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
  try {
    const { error } = await supabase.auth.signOut()
    
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