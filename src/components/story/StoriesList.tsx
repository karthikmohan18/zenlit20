import React, { useState } from 'react';
import { User } from '../../types';
import { StoryViewer } from './StoryViewer';

interface Props {
  users: User[];
}

export const StoriesList: React.FC<Props> = ({ users }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const usersWithStories = users.slice(0, 10);

  return (
    <div className="relative">
      <div className="flex overflow-x-auto hide-scrollbar space-x-4 p-4">
        {usersWithStories.map((user) => (
          <button
            key={user.id}
            className="flex flex-col items-center space-y-1 flex-shrink-0"
            onClick={() => setSelectedUser(user)}
          >
            <div className="w-16 h-16 rounded-full ring-2 ring-blue-500 p-0.5">
              <img
                src={user.dpUrl}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <span className="text-xs text-gray-300 truncate w-16">
              {user.name.split(' ')[0]}
            </span>
          </button>
        ))}
      </div>

      {selectedUser && (
        <StoryViewer
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};