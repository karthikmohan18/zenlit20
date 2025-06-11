import React from 'react';
import { Post } from '../types';

interface Props {
  posts: Post[];
  onUserClick?: (userId: string) => void;
}

export const PostsFeed: React.FC<Props> = ({ posts, onUserClick }) => {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="bg-gray-900 rounded-lg overflow-hidden">
          {/* Clickable header area */}
          <button
            onClick={() => onUserClick?.(post.userId)}
            className="w-full p-3 flex items-center space-x-3 hover:bg-gray-800 active:bg-gray-700 transition-colors text-left"
          >
            <div className="relative">
              <img
                src={post.userDpUrl}
                alt={post.userName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500"
              />
            </div>
            <div>
              <h3 className="font-semibold text-base">{post.userName}</h3>
            </div>
          </button>
          
          <img
            src={post.mediaUrl}
            alt={post.title}
            className="w-full aspect-video object-cover"
          />
          
          <div className="p-3">
            <p className="text-gray-200">{post.caption}</p>
          </div>
        </div>
      ))}
    </div>
  );
};