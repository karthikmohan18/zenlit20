import React, { useState } from 'react';
import { User } from '../../types';
import { IconBrandInstagram, IconBrandLinkedin, IconBrandX } from '@tabler/icons-react';
import { UserProfileModal } from './UserProfileModal';

interface Props {
  user: User;
  onMessage: () => void;
  onViewProfile: () => void;
}

export const RadarUserCard: React.FC<Props> = ({ user, onMessage, onViewProfile }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="bg-gray-900 p-4 rounded-lg">
        <div className="flex items-start space-x-4">
          <button onClick={() => setShowModal(true)} className="flex-shrink-0">
            <div className="relative">
              <img
                src={user.dpUrl}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
            </div>
          </button>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{user.name}</h3>
                <p className="text-gray-400 text-sm">
                  {user.age} y/o • {user.distance}m away
                </p>
              </div>
              <button
                onClick={onMessage}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Message
              </button>
            </div>
            <p className="text-gray-300 mt-2">{user.bio}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {user.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-2 py-0.5 bg-blue-900/50 rounded-full text-xs text-blue-200"
                >
                  {interest}
                </span>
              ))}
            </div>
            <div className="flex gap-4 mt-3">
              <a
                href={user.links.Twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <IconBrandX size={20} />
              </a>
              <a
                href={user.links.Instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <IconBrandInstagram size={20} />
              </a>
              <a
                href={user.links.LinkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <IconBrandLinkedin size={20} />
              </a>
            </div>
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