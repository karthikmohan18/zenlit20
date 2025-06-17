'use client'
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { PasswordResetScreen } from './PasswordResetScreen';
import { sendOTP, verifyOTP, signInWithPassword, signUpWithPassword, signInWithOTP } from '../lib/auth';

interface Props {
  onLogin: () => void;
}

export const LoginScreen: React.FC<Props> = ({ onLogin }) => {
  const [currentView, setCurrentView] = useState<'login' | 'passwordReset'>('login');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [useOTPLogin, setUseOTPLogin] = useState(false); // New state for OTP login
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    otp: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailVerification, setEmailVerification] = useState({
    otpSent: false,
    otpVerified: false,
    isVerifying: false,
    isSendingOtp: false,
    countdown: 0,
    error: null as string | null
  });

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (emailVerification.countdown > 0) {
      timer = setTimeout(() => {
        setEmailVerification(prev => ({
          ...prev,
          countdown: prev.countdown - 1
        }));
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [emailVerification.countdown]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    if (error) setError(null);
    if (field === 'otp' && emailVerification.error) {
      setEmailVerification(prev => ({ ...prev, error: null }));
    }
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      setError('Please enter your email address first');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setEmailVerification(prev => ({ 
      ...prev, 
      isSendingOtp: true, 
      error: null 
    }));
    setError(null);
    
    try {
      // Use different OTP methods based on context
      const result = useOTPLogin 
        ? await signInWithOTP(formData.email) // For existing users who forgot password
        : await sendOTP(formData.email); // For new user signup
      
      if (result.success) {
        setEmailVerification(prev => ({ 
          ...prev, 
          otpSent: true, 
          isSendingOtp: false,
          countdown: 60,
          error: null
        }));
        
        console.log('OTP sent successfully, user will be signed in when they verify it');
      } else {
        setEmailVerification(prev => ({ 
          ...prev, 
          isSendingOtp: false,
          error: result.error || 'Failed to send verification code'
        }));
      }
    } catch (error) {
      console.error('OTP send error:', error);
      setEmailVerification(prev => ({ 
        ...prev, 
        isSendingOtp: false,
        error: 'Network error. Please try again.'
      }));
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      setEmailVerification(prev => ({ 
        ...prev, 
        error: 'Please enter a valid 6-digit verification code' 
      }));
      return;
    }

    setEmailVerification(prev => ({ ...prev, isVerifying: true, error: null }));
    
    try {
      const result = await verifyOTP(formData.email, formData.otp);
      
      if (result.success) {
        console.log('OTP verified successfully');
        setEmailVerification(prev => ({ 
          ...prev, 
          otpVerified: true, 
          isVerifying: false,
          error: null
        }));
        
        // If this is OTP login (existing user), complete the login immediately
        if (useOTPLogin) {
          console.log('OTP login successful, user is now signed in');
          // Wait a moment for the session to be established
          await new Promise(resolve => setTimeout(resolve, 1000));
          onLogin();
        }
      } else {
        setEmailVerification(prev => ({ 
          ...prev, 
          isVerifying: false,
          error: result.error || 'Invalid verification code. Please try again.'
        }));
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setEmailVerification(prev => ({ 
        ...prev, 
        isVerifying: false,
        error: 'Network error. Please try again.'
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }

    // For OTP login, we don't need password
    if (useOTPLogin) {
      if (!emailVerification.otpVerified) {
        setError('Please verify your email with the verification code first');
        return;
      }
      // OTP login is handled in handleVerifyOtp
      return;
    }

    // For password-based auth
    if (!formData.password) {
      setError('Please enter your password');
      return;
    }

    // For signup, require email verification
    if (!isLogin && !emailVerification.otpVerified) {
      setError('Please verify your email address first');
      return;
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!isLogin && formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // Existing user login with password
        console.log('Attempting login for:', formData.email);
        const result = await signInWithPassword(formData.email, formData.password);
        
        if (result.success) {
          console.log('Login successful for user:', result.data?.user?.id);
          // Wait a moment for profile operations to complete
          await new Promise(resolve => setTimeout(resolve, 500));
          onLogin();
        } else {
          console.error('Login failed:', result.error);
          setError(result.error || 'Login failed');
        }
      } else {
        // New user signup (OTP already verified)
        console.log('Attempting signup for:', formData.email);
        
        // Use email prefix as name if no first/last name provided
        const emailPrefix = formData.email.split('@')[0];
        const firstName = formData.firstName || emailPrefix;
        const lastName = formData.lastName || '';
        
        const result = await signUpWithPassword(
          formData.email, 
          formData.password,
          firstName,
          lastName
        );
        
        if (result.success) {
          console.log('Signup successful for user:', result.data?.user?.id);
          
          // Wait a moment for profile creation to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          onLogin();
        } else {
          console.error('Signup failed:', result.error);
          setError(result.error || 'Account creation failed');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setUseOTPLogin(false); // Reset OTP login when switching modes
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      otp: ''
    });
    setEmailVerification({
      otpSent: false,
      otpVerified: false,
      isVerifying: false,
      isSendingOtp: false,
      countdown: 0,
      error: null
    });
    setError(null);
  };

  const handleForgotPassword = () => {
    setCurrentView('passwordReset');
  };

  const handleBackFromPasswordReset = () => {
    setCurrentView('login');
  };

  const handleUseOTPLogin = () => {
    setUseOTPLogin(true);
    setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    setError(null);
  };

  const handleBackToPasswordLogin = () => {
    setUseOTPLogin(false);
    setEmailVerification({
      otpSent: false,
      otpVerified: false,
      isVerifying: false,
      isSendingOtp: false,
      countdown: 0,
      error: null
    });
    setFormData(prev => ({ ...prev, otp: '' }));
    setError(null);
  };

  // Show password reset screen
  if (currentView === 'passwordReset') {
    return <PasswordResetScreen onBack={handleBackFromPasswordReset} />;
  }

  const canProceedToPassword = isLogin || emailVerification.otpVerified;
  const showPasswordFields = !useOTPLogin && (isLogin || emailVerification.otpVerified);

  return (
    <div className="auth-screen mobile-screen bg-black">
      <motion.div
        className="mobile-full-height flex items-center justify-center p-4 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-full max-w-md">
          {/* Header with more space above */}
          <div className="text-center mb-6 pt-4">
            <h1 className="text-3xl font-bold text-white mb-2">Zenlit</h1>
            <p className="text-gray-400">Connect with people around you</p>
          </div>

          {/* Login/Signup Form */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white text-center">
                {isLogin ? (useOTPLogin ? 'Sign in with Code' : 'Welcome Back') : 'Create Account'}
              </h2>
              <p className="text-gray-400 text-center mt-2">
                {isLogin 
                  ? (useOTPLogin ? 'Enter your email to receive a sign-in code' : 'Sign in to your account')
                  : 'Join the Zenlit community'
                }
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-900/30 border border-red-700 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email with OTP verification for signup or OTP login */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                  {((useOTPLogin && emailVerification.otpVerified) || (!isLogin && emailVerification.otpVerified)) && (
                    <CheckCircleIcon className="inline w-4 h-4 text-green-500 ml-2" />
                  )}
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                    disabled={(useOTPLogin && emailVerification.otpVerified) || (!isLogin && emailVerification.otpVerified)}
                  />
                  {(useOTPLogin || (!isLogin && !emailVerification.otpVerified)) && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={emailVerification.isSendingOtp || emailVerification.countdown > 0}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed whitespace-nowrap text-sm"
                    >
                      {emailVerification.isSendingOtp ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </div>
                      ) : emailVerification.countdown > 0 ? (
                        `Resend (${emailVerification.countdown}s)`
                      ) : emailVerification.otpSent ? (
                        'Resend Code'
                      ) : (
                        useOTPLogin ? 'Send Code' : 'Get Code'
                      )}
                    </button>
                  )}
                </div>
                {/* Email verification error */}
                {((useOTPLogin || !isLogin) && emailVerification.error && !emailVerification.otpVerified) && (
                  <p className="text-red-400 text-xs mt-1">{emailVerification.error}</p>
                )}
              </div>

              {/* OTP Input (show for signup after OTP is sent, or for OTP login) */}
              {((useOTPLogin && emailVerification.otpSent && !emailVerification.otpVerified) || 
                (!isLogin && emailVerification.otpSent && !emailVerification.otpVerified)) && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Enter Verification Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        handleInputChange('otp', value);
                      }}
                      className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={emailVerification.isVerifying || formData.otp.length !== 6}
                      className="px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 active:scale-95 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed whitespace-nowrap text-sm"
                    >
                      {emailVerification.isVerifying ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Verifying...
                        </div>
                      ) : (
                        'Verify'
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the 6-digit code sent to your email
                  </p>
                  {/* OTP verification error */}
                  {emailVerification.error && (
                    <p className="text-red-400 text-xs mt-1">{emailVerification.error}</p>
                  )}
                </div>
              )}

              {/* Email Verified Message */}
              {((useOTPLogin && emailVerification.otpVerified) || (!isLogin && emailVerification.otpVerified)) && (
                <div className="bg-green-900/30 border border-green-700 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <span className="text-green-400 text-sm font-medium">
                      Email verified successfully!
                    </span>
                  </div>
                </div>
              )}

              {/* Optional Name Fields for Signup */}
              {!isLogin && emailVerification.otpVerified && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Last name"
                    />
                  </div>
                </div>
              )}

              {/* Password (only show for password-based auth) */}
              {showPasswordFields && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                      placeholder="Enter your password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {!isLogin && (
                    <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
                  )}
                </div>
              )}

              {/* Confirm Password for signup */}
              {!isLogin && showPasswordFields && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm your password"
                    required={!isLogin}
                    minLength={6}
                  />
                </div>
              )}

              {/* Auth Options for Login */}
              {isLogin && !useOTPLogin && (
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handleUseOTPLogin}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Sign in with email code
                  </button>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Back to password login option */}
              {isLogin && useOTPLogin && !emailVerification.otpVerified && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleBackToPasswordLogin}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Back to password login
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || (!isLogin && !emailVerification.otpVerified) || (useOTPLogin && !emailVerification.otpVerified)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                  </>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            {/* Toggle between login/signup */}
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={toggleMode}
                  className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>

            {/* Social Login Options */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
                </div>
              </div>

              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  className="w-full max-w-xs bg-gray-800 border border-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
              </div>
            </div>
          </div>

          {/* Terms and Privacy */}
          <div className="mt-6 text-center pb-8">
            <p className="text-xs text-gray-500">
              By continuing, you agree to our{' '}
              <button className="text-blue-400 hover:text-blue-300 transition-colors">
                Terms of Service
              </button>{' '}
              and{' '}
              <button className="text-blue-400 hover:text-blue-300 transition-colors">
                Privacy Policy
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};