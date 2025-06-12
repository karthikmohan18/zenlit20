import React, { useState, useEffect } from 'react';
import { User, Story } from '../../types';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface Props {
  user: User;
  onClose: () => void;
}

export const StoryViewer: React.FC<Props> = ({ user, onClose }) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const stories = user.stories || [];

  useEffect(() => {
    if (!stories.length) return;

    const timer = setTimeout(() => {
      if (currentStoryIndex < stories.length - 1) {
        setCurrentStoryIndex(currentStoryIndex + 1);
      } else {
        onClose();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentStoryIndex, stories.length, onClose]);

  if (!stories.length) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="w-full h-full max-w-lg mx-auto relative">
        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
          {stories.map((story: Story, index: number) => (
            <div key={index} className="flex-1 h-0.5 bg-gray-600">
              <div
                className="h-full bg-white transition-all duration-100"
                style={{
                  width: `${index <= currentStoryIndex ? '100%' : '0%'}`
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-4 z-10">
          <div className="flex items-center">
            <img
              src={user.dpUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="ml-2 font-semibold text-white">{user.name}</span>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Story Image */}
        <img
          src={stories[currentStoryIndex].mediaUrl}
          alt="Story"
          className="w-full h-full object-cover"
        />

        {/* Touch Areas */}
        <div className="absolute inset-0 flex">
          <div
            className="w-1/2 h-full cursor-pointer"
            onClick={() => currentStoryIndex > 0 && setCurrentStoryIndex(currentStoryIndex - 1)}
          />
          <div
            className="w-1/2 h-full cursor-pointer"
            onClick={() => {
              if (currentStoryIndex < stories.length - 1) {
                setCurrentStoryIndex(currentStoryIndex + 1);
              } else {
                onClose();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};