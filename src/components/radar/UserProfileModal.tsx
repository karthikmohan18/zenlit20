import React from 'react';
import { User } from '../../types';
import { IconBrandInstagram, IconBrandLinkedin, IconBrandX } from '@tabler/icons-react';
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
              className="w-24 h-24 rounded-full mx-auto object-cover"
            />
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
          </div>

          <h2 className="text-xl font-semibold mt-4">{user.name}</h2>
          <p className="text-gray-400 text-sm mt-1">
            {user.age} years • {user.distance}m away
          </p>
          <p className="text-gray-300 mt-2">{user.bio}</p>

          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {user.interests.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1 bg-blue-900/50 rounded-full text-sm text-blue-200"
              >
                {interest}
              </span>
            ))}
          </div>

          <div className="flex justify-center gap-6 mt-6">
            <a
              href={user.links.Twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <IconBrandX size={24} />
            </a>
            <a
              href={user.links.Instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <IconBrandInstagram size={24} />
            </a>
            <a
              href={user.links.LinkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <IconBrandLinkedin size={24} />
            </a>
          </div>

          <button
            onClick={onViewProfile}
            className="w-full bg-blue-600 text-white rounded-lg py-2 mt-6 hover:bg-blue-700 transition-colors"
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
};