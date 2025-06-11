import React from 'react';
import { MobilePreview } from '../components/mobile/MobilePreview';

export const PreviewScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mobile App Preview</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <MobilePreview />
        </div>
      </div>
    </div>
  );
};
