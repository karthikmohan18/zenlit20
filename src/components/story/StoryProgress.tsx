import React from 'react';

interface Props {
  totalStories: number;
  currentIndex: number;
  progress: number;
}

export const StoryProgress: React.FC<Props> = ({ totalStories, currentIndex, progress }) => {
  return (
    <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
      {Array.from({ length: totalStories }).map((_, index) => (
        <div key={index} className="flex-1 h-0.5 bg-gray-600 overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-100"
            style={{
              width: `${index === currentIndex ? progress : index < currentIndex ? 100 : 0}%`
            }}
          />
        </div>
      ))}
    </div>
  );
};