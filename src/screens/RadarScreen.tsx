import React from 'react';
import { RadarUserCard } from '../components/radar/RadarUserCard';
import { mockUsers } from '../utils/mockDataGenerator';
import { User } from '../types';

interface Props {
  userGender: 'male' | 'female';
  onNavigate: (tab: string) => void;
  onViewProfile: (user: User) => void;
  onMessageUser?: (user: User) => void;
}

export const RadarScreen: React.FC<Props> = ({ 
  userGender, 
  onNavigate, 
  onViewProfile, 
  onMessageUser 
}) => {
  const users = userGender === 'male' ? mockUsers.female : mockUsers.male;

  const handleViewProfile = (user: User) => {
    onViewProfile(user);
    onNavigate('profile');
  };

  const handleMessage = (user: User) => {
    if (onMessageUser) {
      onMessageUser(user);
    }
    onNavigate('messages');
  };

  return (
    <div className="min-h-full bg-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-sm border-b border-gray-800">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-white">Nearby People</h1>
          <p className="text-sm text-gray-400 mt-1">Discover people around you</p>
        </div>
      </div>

      {/* Users List */}
      <div className="px-4 py-4 space-y-4 pb-20">
        {users.map((user) => (
          <RadarUserCard
            key={user.id}
            user={user}
            onMessage={handleMessage}
            onViewProfile={() => handleViewProfile(user)}
          />
        ))}
      </div>
    </div>
  );
};