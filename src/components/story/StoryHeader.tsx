import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface Props {
  userDpUrl: string;
  userName: string;
  onClose: () => void;
}

export const StoryHeader: React.FC<Props> = ({ userDpUrl, userName, onClose }) => {
  return (
    <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-4 z-10">
      <div className="flex items-center">
        <img
          src={userDpUrl}
          alt={userName}
          className="w-8 h-8 rounded-full object-cover"
        />
        <span className="ml-2 font-semibold text-white">{userName}</span>
      </div>
      <button 
        onClick={onClose}
        className="text-white hover:text-gray-300 transition-colors"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>
    </div>
  );
};