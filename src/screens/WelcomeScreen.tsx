import React from 'react';

interface Props {
  onGetStarted: () => void;
}

export const WelcomeScreen: React.FC<Props> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4">Sonar</h1>
          <p className="text-xl text-gray-300 mb-2">Connect Locally</p>
          <p className="text-gray-400 leading-relaxed">
            Discover people around you, share moments, and build meaningful connections in your community.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-12">
          <div className="flex items-center text-left bg-gray-900/50 rounded-lg p-4">
            <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center mr-4">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Find Nearby People</h3>
              <p className="text-gray-400 text-sm">Connect with people in your area</p>
            </div>
          </div>

          <div className="flex items-center text-left bg-gray-900/50 rounded-lg p-4">
            <div className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center mr-4">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Real-time Messaging</h3>
              <p className="text-gray-400 text-sm">Chat instantly with new connections</p>
            </div>
          </div>

          <div className="flex items-center text-left bg-gray-900/50 rounded-lg p-4">
            <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center mr-4">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Share Moments</h3>
              <p className="text-gray-400 text-sm">Post photos and stories from your life</p>
            </div>
          </div>
        </div>
        
        {/* Get Started Button */}
        <button
          onClick={onGetStarted}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 active:scale-95 transition-all shadow-lg"
        >
          Get Started
        </button>

        {/* Footer */}
        <div className="mt-8">
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
    </div>
  );
};