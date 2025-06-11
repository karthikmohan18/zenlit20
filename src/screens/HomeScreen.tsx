import React, { useState } from 'react';
import { StoriesList } from '../components/story/StoriesList';
import { PostsFeed } from '../components/post/PostsFeed';
import { UserProfile } from '../components/profile/UserProfile';
import { mockUsers, generatePosts } from '../utils/mockDataGenerator';
import { User } from '../types';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

interface Props {
  userGender: 'male' | 'female';
}

export const HomeScreen: React.FC<Props> = ({ userGender }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const users = userGender === 'male' ? mockUsers.female : mockUsers.male;
  const posts = users.flatMap(user => generatePosts(user));

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
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-white">Sonar</h1>
        </div>
      </div>

      {/* Stories Section */}
      <div className="border-b border-gray-800">
        <StoriesList users={users} />
      </div>

      {/* Posts Feed */}
      <div className="px-4 py-4 space-y-6">
        <PostsFeed posts={posts} onUserClick={handleUserClick} />
      </div>
    </div>
  );
};