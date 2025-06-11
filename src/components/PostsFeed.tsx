import React from 'react';
import { Post } from '../types';
import { format } from 'date-fns';

interface Props {
  posts: Post[];
}

export const PostsFeed: React.FC<Props> = ({ posts }) => {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="bg-gray-900 rounded-lg overflow-hidden">
          <div className="p-3 flex items-center space-x-3">
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
          </div>
          
          <img
            src={post.mediaUrl}
            alt={post.title}
            className="w-full aspect-video object-cover"
          />
          
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">
                {format(new Date(post.timestamp), 'MMM d, yyyy')}
              </p>
            </div>
            <h4 className="font-semibold mb-2">{post.title}</h4>
            <p className="text-gray-200">{post.caption}</p>
          </div>
        </div>
      ))}
    </div>
  );
};