import React, { useState } from 'react';
import { PostsFeed } from '../components/post/PostsFeed';
import { UserProfile } from '../components/profile/UserProfile';
import { mockUsers, generatePosts } from '../utils/mockDataGenerator';
import { getCurrentUserPosts } from '../data/mockData';
import { User } from '../types';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

interface Props {
  userGender: 'male' | 'female';
}

export const HomeScreen: React.FC<Props> = ({ userGender }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const users = userGender === 'male' ? mockUsers.female : mockUsers.male;
  
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
      setSelectedUser(user);
    }
  };

  if (selectedUser) {
    return (
      <div className="h-full bg-black">
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

  return (
    <div className="h-full bg-black overflow-y-auto">
      {/* Header - Now scrolls with content */}
      <div className="bg-black border-b border-gray-800">
        <div className="px-4 py-3 flex items-center">
          <img
            src="https://media.istockphoto.com/id/696912200/vector/radar-scan-or-sonar-communicating-with-transmission-waves-back-and-forth.jpg?s=612x612&w=0&k=20&c=MEM4t0wmdLhl88KW-73N0-4V1KT4CmVgUwJIA52F6-U="
            alt="Sonar"
            className="w-8 h-8 object-contain rounded mr-3"
          />
          <h1 className="text-xl font-bold text-white">Sonar</h1>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="px-4 py-4 space-y-6">
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