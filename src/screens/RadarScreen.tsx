import React from 'react';
import { RadarUserCard } from '../components/radar/RadarUserCard';
import { mockUsers } from '../utils/mockDataGenerator';
import { User } from '../types';

interface Props {
  userGender: 'male' | 'female';
  onNavigate: (tab: string) => void;
  onViewProfile: (user: User) => void;
}

export const RadarScreen: React.FC<Props> = ({ userGender, onNavigate, onViewProfile }) => {
  const users = userGender === 'male' ? mockUsers.female : mockUsers.male;

  const handleViewProfile = (user: User) => {
    onViewProfile(user);
    onNavigate('profile');
  };

  const handleMessage = () => {
    onNavigate('messages');
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Nearby People</h1>
      <div className="space-y-4">
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