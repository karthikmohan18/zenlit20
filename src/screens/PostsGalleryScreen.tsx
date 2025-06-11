import React from 'react';
import { User, Post } from '../types';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { generatePosts } from '../utils/mockDataGenerator';

interface Props {
  user: User;
  onBack: () => void;
  onUserClick?: (userId: string) => void;
}

export const PostsGalleryScreen: React.FC<Props> = ({ user, onBack, onUserClick }) => {
  const posts = generatePosts(user);

  return (
    <div className="h-full bg-black overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center px-4 py-3">
          <button
            onClick={onBack}
            className="mr-3 p-2 rounded-full hover:bg-gray-800 active:scale-95 transition-all"
          >
            <ChevronLeftIcon className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center">
            <img
              src={user.dpUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500 mr-3"
            />
            <h1 className="text-lg font-semibold text-white">{user.name}'s Posts</h1>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="px-4 py-4 space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-gray-900 rounded-lg overflow-hidden">
            {/* Post Header */}
            <button
              onClick={() => onUserClick?.(post.userId)}
              className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-800 active:bg-gray-700 transition-colors text-left"
            >
              <img
                src={post.userDpUrl}
                alt={post.userName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500"
              />
              <div>
                <h3 className="font-semibold text-white">{post.userName}</h3>
              </div>
            </button>

            {/* Post Image */}
            <img
              src={post.mediaUrl}
              alt={post.title}
              className="w-full aspect-square object-cover"
            />

            {/* Post Content */}
            <div className="p-4">
              <p className="text-gray-200 leading-relaxed">{post.caption}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};