import React from 'react';
import { Post } from '../../types';
import { Avatar } from '../common/Avatar';

interface Props {
  post: Post;
  onUserClick?: () => void;
}

export const PostCard: React.FC<Props> = ({ post, onUserClick }) => {
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {/* Clickable header area */}
      <button
        onClick={onUserClick}
        className="w-full p-3 flex items-center space-x-3 hover:bg-gray-800 active:bg-gray-700 transition-colors text-left"
      >
        <Avatar
          src={post.userDpUrl}
          alt={post.userName}
          size="sm"
        />
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
  );
};