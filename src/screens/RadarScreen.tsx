import React, { useState, useEffect } from 'react';
import { RadarUserCard } from '../components/radar/RadarUserCard';
import { User, ProfileWithSocial, profileToUser } from '../types';
import { ProfileService } from '../services/profile.service';

interface Props {
  currentUser: User | null;
  onNavigate: (tab: string) => void;
  onViewProfile: (user: User) => void;
  onMessageUser?: (user: User) => void;
}

export const RadarScreen: React.FC<Props> = ({ 
  currentUser,
  onNavigate, 
  onViewProfile, 
  onMessageUser 
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, [currentUser]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { profiles, error: profilesError } = await ProfileService.getProfiles(20, 0);
      
      if (profilesError) {
        throw profilesError;
      }
      
      // Filter out current user and convert to User type
      const filteredProfiles = profiles.filter(profile => profile.id !== currentUser?.id);
      const convertedUsers = filteredProfiles.map(profileToUser);
      
      setUsers(convertedUsers);
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

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
    <div className="h-full bg-black overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-white">Nearby People</h1>
          <p className="text-sm text-gray-400 mt-1">Discover people around you</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 bg-red-900/30 border border-red-700 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => {
              setError(null);
              loadUsers();
            }}
            className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
          >
            Try again
          </button>
        </div>
      )}

      {/* Users List */}
      <div className="px-4 py-4 space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Finding people nearby...</p>
          </div>
        ) : users.length > 0 ? (
          users.map((user) => (
            <RadarUserCard
              key={user.id}
              user={user}
              onMessage={handleMessage}
              onViewProfile={() => handleViewProfile(user)}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-400 mb-2">No people found</p>
            <p className="text-gray-500 text-sm">Check back later for new connections</p>
          </div>
        )}
      </div>
    </div>
  );
};