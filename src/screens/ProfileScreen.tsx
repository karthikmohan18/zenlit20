import React from 'react';
import { User } from '../types';
import { defaultCurrentUser } from '../data/mockData';
import { IconBrandInstagram, IconBrandLinkedin, IconBrandX } from '@tabler/icons-react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

interface Props {
  user?: User | null;
  onBack?: () => void;
}

export const ProfileScreen: React.FC<Props> = ({ user, onBack }) => {
  const profileData = user || defaultCurrentUser;

  return (
    <div className="h-full bg-black overflow-y-auto">
      {/* Header with back button if viewing other user's profile */}
      {user && onBack && (
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm">
          <button
            onClick={onBack}
            className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-sm p-3 rounded-full shadow-lg active:scale-95 transition-transform"
          >
            <ChevronLeftIcon className="w-5 h-5 text-white" />
          </button>
        </div>
      )}

      {/* Profile Header */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-b from-blue-900 to-black">
          <img
            src={`https://picsum.photos/800/400?random=${profileData.id}`}
            alt="Profile Cover"
            className="w-full h-full object-cover opacity-60"
          />
        </div>
        
        {/* Profile Avatar */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <img
              src={profileData.dpUrl}
              alt={profileData.name}
              className="w-28 h-28 rounded-full border-4 border-black object-cover shadow-xl"
            />
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="mt-16 px-4 pb-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">{profileData.name}</h1>
          <p className="text-gray-300 mt-2 text-base leading-relaxed">{profileData.bio}</p>
          
          {/* Social Links */}
          <div className="flex justify-center gap-8 mt-8">
            <a
              href={profileData.links.Twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-gray-800 rounded-full text-gray-300 hover:text-white hover:bg-gray-700 transition-all active:scale-95"
            >
              <IconBrandX size={24} />
            </a>
            <a
              href={profileData.links.Instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-gray-800 rounded-full text-gray-300 hover:text-white hover:bg-gray-700 transition-all active:scale-95"
            >
              <IconBrandInstagram size={24} />
            </a>
            <a
              href={profileData.links.LinkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-gray-800 rounded-full text-gray-300 hover:text-white hover:bg-gray-700 transition-all active:scale-95"
            >
              <IconBrandLinkedin size={24} />
            </a>
          </div>
        </div>
        
        {/* Media Grid */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-6 text-white">Media</h2>
          <div className="grid grid-cols-3 gap-1">
            {Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="aspect-square">
                <img
                  src={`https://picsum.photos/400/400?random=${profileData.id}-${index}`}
                  alt={`Media ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};