import React from 'react';

interface Props {
  onGetStarted: () => void;
}

export const WelcomeScreen: React.FC<Props> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center">
        {/* Logo */}
        <div className="mb-12">
          <img
            src="https://media.istockphoto.com/id/696912200/vector/radar-scan-or-sonar-communicating-with-transmission-waves-back-and-forth.jpg?s=612x612&w=0&k=20&c=MEM4t0wmdLhl88KW-73N0-4V1KT4CmVgUwJIA52F6-U="
            alt="Sonar"
            className="w-32 h-32 mx-auto object-contain rounded-lg mb-8"
          />
          
          <h1 className="text-5xl font-bold text-white">Sonar</h1>
        </div>
        
        {/* Get Started Button */}
        <button
          onClick={onGetStarted}
          className="bg-blue-600 text-white px-12 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 active:scale-95 transition-all shadow-lg"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};