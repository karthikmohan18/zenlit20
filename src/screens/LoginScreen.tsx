'use client'
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { PasswordResetScreen } from './PasswordResetScreen';
import { sendSignupOTP, verifySignupOTP, signInWithPassword, sendPasswordReset } from '../lib/auth';

interface Props {
  onLogin: () => void;
}

export const LoginScreen: React.FC<Props> = ({ onLogin }) => {
  const [currentView, setCurrentView] = useState<'login' | 'signup' | 'passwordReset'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpState, setOtpState] = useState({
    sent: false,
    verified: false,
    isVerifying: false,
    isSending: false,
    countdown: 0,
    error: null as string | null
  });

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpState.countdown > 0) {
      timer = setTimeout(() => {
        setOtpState(prev => ({
          ...prev,
          countdown: prev.countdown - 1
        }));
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [otpState.countdown]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    if (error) setError(null);
    if (field === 'otp' && otpState.error) {
      setOtpState(prev => ({ ...prev, error: null }));
    }
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      setError('Please enter your email address first');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setOtpState(prev => ({ 
      ...prev, 
      isSending: true, 
      error: null 
    }));
    setError(null);
    
    try {
      const result = await sendSignupOTP(formData.email);
      
      if (result.success) {
        setOtpState(prev => ({ 
          ...prev, 
          sent: true, 
          isSending: false,
          countdown: 60,
          error: null
        }));
        console.log('Signup OTP sent successfully');
      } else {
        setOtpState(prev => ({ 
          ...prev, 
          isSending: false,
          error: result.error || 'Failed to send verification code'
        }));
      }
    } catch (error) {
      console.error('OTP send error:', error);
      setOtpState(prev => ({ 
        ...prev, 
        isSending: false,
        error: 'Network error. Please try again.'
      }));
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.otp || formData.otp.length !== 6) {
      setOtpState(prev => ({ 
        ...prev, 
        error: 'Please enter a valid 6-digit verification code' 
      }));
      return;
    }

    setOtpState(prev => ({ ...prev, isVerifying: true, error: null }));
    
    try {
      const result = await verifySignupOTP(formData.email, formData.otp);
      
      if (result.success) {
        console.log('Signup OTP verified successfully, user is now registered and logged in');
        setOtpState(prev => ({ 
          ...prev, 
          verified: true, 
          isVerifying: false,
          error: null
        }));
        
        // Wait a moment for the session to be established
        await new Promise(resolve => setTimeout(resolve, 1000));
        onLogin();
      } else {
        setOtpState(prev => ({ 
          ...prev, 
          isVerifying: false,
          error: result.error || 'Invalid verification code. Please try again.'
        }));
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setOtpState(prev => ({ 
        ...prev, 
        isVerifying: false,
        error: 'Network error. Please try again.'
      }));
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Attempting password login for:', formData.email);
      const result = await signInWithPassword(formData.email, formData.password);
      
      if (result.success) {
        console.log('Password login successful');
        await new Promise(resolve => setTimeout(resolve, 500));
        onLogin();
      } else {
        console.error('Password login failed:', result.error);
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpState.verified) {
      setError('Please verify your email address first');
      return;
    }

    // OTP verification already completed the signup process
    // This should not be reached, but just in case
    onLogin();
  };

  const switchToSignup = () => {
    setCurrentView('signup');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      otp: ''
    });
    setOtpState({
      sent: false,
      verified: false,
      isVerifying: false,
      isSending: false,
      countdown: 0,
      error: null
    });
    setError(null);
  };

  const switchToLogin = () => {
    setCurrentView('login');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      otp: ''
    });
    setOtpState({
      sent: false,
      verified: false,
      isVerifying: false,
      isSending: false,
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

  // Show password reset screen
  if (currentView === 'passwordReset') {
    return <PasswordResetScreen onBack={handleBackFromPasswordReset} />;
  }

  return (
    <div className="auth-screen mobile-screen bg-black">
      <motion.div
        className="mobile-full-height flex items-center justify-center p-4 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-6 pt-4">
            <h1 className="text-3xl font-bold text-white mb-2">Zenlit</h1>
            <p className="text-gray-400">Connect with people around you</p>
          </div>

          {/* Login/Signup Form */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white text-center">
                {currentView === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-gray-400 text-center mt-2">
                {currentView === 'login' 
                  ? 'Sign in with your password' 
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

            {/* LOGIN FORM */}
            {currentView === 'login' && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>

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
                </div>

                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            )}

            {/* SIGNUP FORM */}
            {currentView === 'signup' && (
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                {/* Email with OTP verification */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                    {otpState.verified && (
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
                      disabled={otpState.verified}
                    />
                    {!otpState.verified && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpState.isSending || otpState.countdown > 0}
                        className="px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed whitespace-nowrap text-sm"
                      >
                        {otpState.isSending ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Sending...
                          </div>
                        ) : otpState.countdown > 0 ? (
                          `Resend (${otpState.countdown}s)`
                        ) : otpState.sent ? (
                          'Resend Code'
                        ) : (
                          'Get Code'
                        )}
                      </button>
                    )}
                  </div>
                  {otpState.error && !otpState.verified && (
                    <p className="text-red-400 text-xs mt-1">{otpState.error}</p>
                  )}
                </div>

                {/* OTP Input */}
                {otpState.sent && !otpState.verified && (
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
                        disabled={otpState.isVerifying || formData.otp.length !== 6}
                        className="px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 active:scale-95 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed whitespace-nowrap text-sm"
                      >
                        {otpState.isVerifying ? (
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
                    {otpState.error && (
                      <p className="text-red-400 text-xs mt-1">{otpState.error}</p>
                    )}
                  </div>
                )}

                {/* Email Verified Message */}
                {otpState.verified && (
                  <div className="bg-green-900/30 border border-green-700 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      <span className="text-green-400 text-sm font-medium">
                        Account created successfully! You are now signed in.
                      </span>
                    </div>
                  </div>
                )}

                {/* Submit Button (hidden since OTP verification completes signup) */}
                {otpState.verified && (
                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 active:scale-95 transition-all"
                  >
                    Continue to App
                  </button>
                )}
              </form>
            )}

            {/* Toggle between login/signup */}
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                {currentView === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={currentView === 'login' ? switchToSignup : switchToLogin}
                  className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  {currentView === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
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