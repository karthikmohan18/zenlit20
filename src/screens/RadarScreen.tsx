import React, { useState, useEffect } from 'react';
import { RadarUserCard } from '../components/radar/RadarUserCard';
import { User } from '../types';
import { supabase } from '../lib/supabase';

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
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNearbyUsers();
  }, [userGender]);

  const loadNearbyUsers = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) return;

      // Get users of opposite gender who have completed their profiles
      const oppositeGender = userGender === 'male' ? 'female' : 'male';
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('gender', oppositeGender)
        .neq('id', currentUser.id) // Exclude current user
        .not('name', 'is', null)
        .not('bio', 'is', null)
        .not('date_of_birth', 'is', null)
        .limit(20);

      if (error) {
        console.error('Error loading users:', error);
        return;
      }

      // Transform database profiles to User type
      const transformedUsers: User[] = (profiles || []).map(profile => ({
        id: profile.id,
        name: profile.name,
        dpUrl: profile.profile_photo_url || `https://i.pravatar.cc/300?img=${profile.id}`,
        bio: profile.bio,
        gender: profile.gender,
        age: profile.date_of_birth ? 
          new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() : 25,
        distance: Math.floor(Math.random() * 50) + 1, // Random distance for now
        interests: profile.interests || [],
        links: {
          Twitter: profile.twitter_url || '#',
          Instagram: profile.instagram_url || '#',
          LinkedIn: profile.linked_in_url || '#',
        },
        instagramUrl: profile.instagram_url,
        instagramVerified: profile.instagram_verified,
        facebookUrl: profile.facebook_url,
        facebookVerified: profile.facebook_verified,
        linkedInUrl: profile.linked_in_url,
        linkedInVerified: profile.linked_in_verified,
        twitterUrl: profile.twitter_url,
        twitterVerified: profile.twitter_verified,
        googleUrl: profile.google_url,
        googleVerified: profile.google_verified,
      }));

      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error loading nearby users:', error);
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="min-h-full bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Finding people nearby...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-sm border-b border-gray-800">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-white">Nearby People</h1>
          <p className="text-sm text-gray-400 mt-1">
            {users.length > 0 ? `${users.length} people found` : 'Discover people around you'}
          </p>
        </div>
      </div>

      {/* Users List */}
      <div className="px-4 py-4 space-y-4 pb-20">
        {users.length > 0 ? (
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
            <p className="text-gray-400 mb-2">No people found nearby</p>
            <p className="text-gray-500 text-sm">Check back later for new connections!</p>
          </div>
        )}
      </div>
    </div>
  );
};