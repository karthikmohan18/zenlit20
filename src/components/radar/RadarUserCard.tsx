import React, { useState } from 'react';
import { User } from '../../types';
import { IconBrandInstagram, IconBrandLinkedin, IconBrandX } from '@tabler/icons-react';
import { ChatBubbleLeftIcon, UserIcon } from '@heroicons/react/24/outline';
import { UserProfileModal } from './UserProfileModal';

interface Props {
  user: User;
  onMessage: (user: User) => void;
  onViewProfile: () => void;
}

export const RadarUserCard: React.FC<Props> = ({ user, onMessage, onViewProfile }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
        {/* Top section: Photo and Name */}
        <div className="flex items-start space-x-4 mb-3">
          <button 
            onClick={() => setShowModal(true)} 
            className="flex-shrink-0 active:scale-95 transition-transform"
          >
            <div className="relative">
              <img
                src={user.dpUrl}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-500"
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
            </div>
          </button>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-white truncate">{user.name}</h3>
            {/* Bio directly below name */}
            <p className="text-gray-300 text-sm mt-1 line-clamp-2">{user.bio}</p>
          </div>
        </div>

        {/* Bottom section: Social Links and Action Buttons */}
        <div className="flex items-center justify-between">
          {/* Social Links - Left side */}
          <div className="flex gap-4">
            <a
              href={user.links.Twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors active:scale-95"
            >
              <IconBrandX size={28} />
            </a>
            <a
              href={user.links.Instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors active:scale-95"
            >
              <IconBrandInstagram size={28} />
            </a>
            <a
              href={user.links.LinkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors active:scale-95"
            >
              <IconBrandLinkedin size={28} />
            </a>
          </div>

          {/* Action Buttons - Right side (Profile first, then Chat) */}
          <div className="flex gap-2">
            <button
              onClick={onViewProfile}
              className="bg-gray-700 text-white p-3 rounded-full hover:bg-gray-600 active:scale-95 transition-all"
              title="View full profile"
            >
              <UserIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => onMessage(user)}
              className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 active:scale-95 transition-all"
              title="Send message"
            >
              <ChatBubbleLeftIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <UserProfileModal
          user={user}
          onClose={() => setShowModal(false)}
          onViewProfile={() => {
            setShowModal(false);
            onViewProfile();
          }}
        />
      )}
    </>
  );
};