import React from 'react';
import { User } from '../../types';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface Props {
  user: User;
  onClose: () => void;
  onViewProfile: () => void;
}

export const UserProfileModal: React.FC<Props> = ({ user, onClose, onViewProfile }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="text-center">
          <div className="relative inline-block">
            <img
              src={user.dpUrl}
              alt={user.name}
              className="w-48 h-48 rounded-full mx-auto object-cover"
            />
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-gray-900"></div>
          </div>
        </div>
      </div>
    </div>
  );
};