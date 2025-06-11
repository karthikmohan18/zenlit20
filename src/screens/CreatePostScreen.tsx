import React, { useState } from 'react';
import { CameraIcon, PhotoIcon } from '@heroicons/react/24/outline';

export const CreatePostScreen: React.FC = () => {
  const [caption, setCaption] = useState('');

  const handlePost = () => {
    // Placeholder for post creation logic
    alert('Post creation will be available in a future update!');
    setCaption('');
  };

  return (
    <div className="h-full bg-black overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold text-white">Create Post</h1>
          <button
            onClick={handlePost}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all"
          >
            Share
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Media Upload Area */}
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8">
          <div className="text-center">
            <div className="flex justify-center space-x-4 mb-4">
              <button className="flex flex-col items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-700 active:scale-95 transition-all">
                <CameraIcon className="w-8 h-8 text-gray-300 mb-2" />
                <span className="text-sm text-gray-300">Camera</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-gray-800 rounded-lg hover:bg-gray-700 active:scale-95 transition-all">
                <PhotoIcon className="w-8 h-8 text-gray-300 mb-2" />
                <span className="text-sm text-gray-300">Gallery</span>
              </button>
            </div>
            <p className="text-gray-400 text-sm">Tap to add photos or videos</p>
          </div>
        </div>

        {/* Caption Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Caption
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full h-32 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-400">
              {caption.length}/500 characters
            </span>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Location (Optional)
          </label>
          <input
            type="text"
            placeholder="Add location"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Privacy Settings */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Who can see this post?
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="privacy"
                value="public"
                defaultChecked
                className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 focus:ring-blue-500"
              />
              <span className="ml-3 text-white">Everyone</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="privacy"
                value="nearby"
                className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 focus:ring-blue-500"
              />
              <span className="ml-3 text-white">People nearby</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};