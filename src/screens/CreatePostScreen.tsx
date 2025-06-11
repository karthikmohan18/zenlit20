import React, { useState } from 'react';
import { CameraIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

export const CreatePostScreen: React.FC = () => {
  const [caption, setCaption] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);

  const handlePost = () => {
    if (!selectedMedia && !caption.trim()) {
      alert('Please add some content to your post');
      return;
    }
    
    // Placeholder for post creation logic
    alert('Post created successfully!');
    setCaption('');
    setSelectedMedia(null);
  };

  const handleMediaSelect = (type: 'camera' | 'gallery') => {
    // Simulate media selection
    setSelectedMedia(`https://picsum.photos/800/600?random=${Date.now()}`);
  };

  const removeMedia = () => {
    setSelectedMedia(null);
  };

  return (
    <div className="h-full bg-black overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold text-white">Create Post</h1>
          <button
            onClick={handlePost}
            className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 active:scale-95 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed"
            disabled={!selectedMedia && !caption.trim()}
          >
            Share
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* User Info */}
        <div className="flex items-center space-x-3">
          <img
            src="https://i.pravatar.cc/300?img=default"
            alt="Your profile"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500"
          />
          <div>
            <h3 className="font-semibold text-white">Alex Johnson</h3>
            <p className="text-sm text-gray-400">Sharing to everyone</p>
          </div>
        </div>

        {/* Caption Input */}
        <div>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What's happening?"
            className="w-full h-32 px-0 py-0 bg-transparent border-none text-white placeholder-gray-400 focus:outline-none resize-none text-lg"
            maxLength={500}
          />
          <div className="flex justify-end mt-2">
            <span className={`text-xs ${caption.length > 450 ? 'text-red-400' : 'text-gray-400'}`}>
              {caption.length}/500
            </span>
          </div>
        </div>

        {/* Selected Media Preview */}
        {selectedMedia && (
          <div className="relative">
            <img
              src={selectedMedia}
              alt="Selected media"
              className="w-full h-64 object-cover rounded-lg"
            />
            <button
              onClick={removeMedia}
              className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm p-2 rounded-full text-white hover:bg-black/80 active:scale-95 transition-all"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Media Upload Options */}
        {!selectedMedia && (
          <div className="border-2 border-dashed border-gray-700 rounded-xl p-8">
            <div className="text-center">
              <div className="flex justify-center space-x-6 mb-4">
                <button 
                  onClick={() => handleMediaSelect('camera')}
                  className="flex flex-col items-center p-6 bg-gray-800 rounded-xl hover:bg-gray-700 active:scale-95 transition-all"
                >
                  <CameraIcon className="w-10 h-10 text-blue-400 mb-3" />
                  <span className="text-sm font-medium text-white">Camera</span>
                  <span className="text-xs text-gray-400 mt-1">Take a photo</span>
                </button>
                <button 
                  onClick={() => handleMediaSelect('gallery')}
                  className="flex flex-col items-center p-6 bg-gray-800 rounded-xl hover:bg-gray-700 active:scale-95 transition-all"
                >
                  <PhotoIcon className="w-10 h-10 text-green-400 mb-3" />
                  <span className="text-sm font-medium text-white">Gallery</span>
                  <span className="text-xs text-gray-400 mt-1">Choose from library</span>
                </button>
              </div>
              <p className="text-gray-400 text-sm">Add photos or videos to your post</p>
            </div>
          </div>
        )}

        {/* Additional Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-900 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-white font-medium">Tag people</span>
            </div>
            <button className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};