import React from 'react';
import { User } from '../types';
import { defaultCurrentUser } from '../data/mockData';
import { IconBrandInstagram, IconBrandLinkedin, IconBrandX } from '@tabler/icons-react';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';

interface Props {
  user?: User | null;
  onBack?: () => void;
}

export const ProfileScreen: React.FC<Props> = ({ user, onBack }) => {
  const profileData = user || defaultCurrentUser;

  return (
    <div className="min-h-screen bg-black">
      {/* Header with back button if viewing other user's profile */}
      {user && onBack && (
        <button
          onClick={onBack}
          className="fixed top-4 left-4 z-50 bg-gray-900 p-2 rounded-full"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
      )}

      {/* Profile Header */}
      <div className="relative">
        <div className="h-40 bg-gradient-to-b from-blue-900 to-black">
          <img
            src={`https://picsum.photos/1200/400?random=${profileData.id}`}
            alt="Profile Cover"
            className="w-full h-full object-cover mix-blend-overlay"
          />
        </div>
        
        {/* Profile Info */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <img
              src={profileData.dpUrl}
              alt={profileData.name}
              className="w-28 h-28 rounded-full border-4 border-black object-cover"
            />
            <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="mt-16 px-4 pb-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{profileData.name}</h1>
          <p className="text-gray-400 mt-2">{profileData.bio}</p>
          <p className="text-gray-500 text-sm mt-1">
            {profileData.age} years • {profileData.distance}m away
          </p>
          
          {/* Interests */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {profileData.interests.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1 bg-blue-900/50 rounded-full text-sm text-blue-200"
              >
                {interest}
              </span>
            ))}
          </div>
          
          {/* Social Links */}
          <div className="flex justify-center gap-6 mt-6">
            <a
              href={profileData.links.Twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <IconBrandX size={24} />
            </a>
            <a
              href={profileData.links.Instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <IconBrandInstagram size={24} />
            </a>
            <a
              href={profileData.links.LinkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <IconBrandLinkedin size={24} />
            </a>
          </div>
        </div>
        
        {/* Media Grid */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Media</h2>
          <div className="grid grid-cols-3 gap-1">
            {Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="aspect-square relative group">
                <img
                  src={`https://picsum.photos/400/400?random=${profileData.id}-${index}`}
                  alt={`Media ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};