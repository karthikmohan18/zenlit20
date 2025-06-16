import React, { useState, useEffect } from 'react';
import { PostsFeed } from '../components/post/PostsFeed';
import { UserProfile } from '../components/profile/UserProfile';
import { getCurrentUserPosts } from '../data/mockData';
import { generatePosts } from '../utils/mockDataGenerator';
import { User } from '../types';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';

interface Props {
  userGender: 'male' | 'female';
}

export const HomeScreen: React.FC<Props> = ({ userGender }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadUsers();
  }, [userGender]);

  const loadUsers = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) return;

      // Get all users who have completed their profiles (for posts)
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', currentUser.id) // Exclude current user
        .not('name', 'is', null)
        .not('bio', 'is', null)
        .limit(10);

      if (error) {
        console.error('Error loading users:', error);
        return;
      }

      setUsers(profiles || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Combine current user's posts with other users' posts
  const currentUserPosts = getCurrentUserPosts();
  const otherUsersPosts = users.flatMap(user => generatePosts(user));
  
  // Merge and sort all posts by timestamp (latest first)
  const allPosts = [...currentUserPosts, ...otherUsersPosts].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleUserClick = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      // Transform database profile to User type
      const transformedUser: User = {
        id: user.id,
        name: user.name,
        dpUrl: user.profile_photo_url || `https://i.pravatar.cc/300?img=${user.id}`,
        bio: user.bio,
        gender: user.gender,
        age: user.date_of_birth ? 
          new Date().getFullYear() - new Date(user.date_of_birth).getFullYear() : 25,
        distance: Math.floor(Math.random() * 50) + 1,
        interests: user.interests || [],
        links: {
          Twitter: user.twitter_url || '#',
          Instagram: user.instagram_url || '#',
          LinkedIn: user.linked_in_url || '#',
        },
        instagramUrl: user.instagram_url,
        instagramVerified: user.instagram_verified,
        facebookUrl: user.facebook_url,
        facebookVerified: user.facebook_verified,
        linkedInUrl: user.linked_in_url,
        linkedInVerified: user.linked_in_verified,
        twitterUrl: user.twitter_url,
        twitterVerified: user.twitter_verified,
        googleUrl: user.google_url,
        googleVerified: user.google_verified,
      };
      setSelectedUser(transformedUser);
    }
  };

  if (selectedUser) {
    return (
      <div className="min-h-full bg-black">
        <button
          onClick={() => setSelectedUser(null)}
          className="fixed top-4 left-4 z-50 bg-gray-900/80 backdrop-blur-sm p-3 rounded-full shadow-lg active:scale-95 transition-transform"
        >
          <ChevronLeftIcon className="w-5 h-5 text-white" />
        </button>
        <UserProfile user={selectedUser} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-full bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-black">
      {/* Header */}
      <div className="bg-black border-b border-gray-800">
        <div className="px-4 py-3 flex items-center">
          <svg className="w-8 h-8 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h1 className="text-xl font-bold text-white">Feed</h1>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="px-4 py-4 space-y-6 pb-20">
        {allPosts.length > 0 ? (
          <PostsFeed posts={allPosts} onUserClick={handleUserClick} />
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-gray-400 mb-2">No posts yet</p>
            <p className="text-gray-500 text-sm">Create your first post to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};