import React, { useState } from 'react';
import { StoriesList } from '../components/story/StoriesList';
import { PostsFeed } from '../components/post/PostsFeed';
import { UserProfile } from '../components/profile/UserProfile';
import { mockUsers, generatePosts } from '../utils/mockDataGenerator';
import { User } from '../types';

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
      <div className="relative">
        <button
          onClick={() => setSelectedUser(null)}
          className="fixed top-4 left-4 z-50 bg-gray-900 p-2 rounded-full"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <UserProfile user={selectedUser} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="py-4">
        <StoriesList users={users} />
      </div>
      <div className="mt-6">
        <PostsFeed posts={posts} onUserClick={handleUserClick} />
      </div>
    </div>
  );
};