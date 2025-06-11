import React from 'react';

interface Props {
  onLogin: () => void;
}

export const LoginScreen: React.FC<Props> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-8">
          <img
            src="https://media.istockphoto.com/id/696912200/vector/radar-scan-or-sonar-communicating-with-transmission-waves-back-and-forth.jpg?s=612x612&w=0&k=20&c=MEM4t0wmdLhl88KW-73N0-4V1KT4CmVgUwJIA52F6-U="
            alt="Sonar"
            className="w-32 h-32 mx-auto object-contain rounded-lg"
          />
          <h1 className="text-4xl font-bold mt-4 text-white">Welcome to Sonar</h1>
        </div>
        
        <button
          onClick={onLogin}
          className="w-full max-w-xs bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};