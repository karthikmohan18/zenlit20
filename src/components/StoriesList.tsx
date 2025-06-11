import React, { useState } from 'react';
import { User } from '../types';
import { StoryViewer } from './StoryViewer';

interface Props {
  users: User[];
}

export const StoriesList: React.FC<Props> = ({ users }) => {
  const [selectedUserIndex, setSelectedUserIndex] = useState<number | null>(null);

  const handleClose = () => {
    setSelectedUserIndex(null);
  };

  const handleNext = () => {
    if (selectedUserIndex !== null && selectedUserIndex < users.length - 1) {
      setSelectedUserIndex(selectedUserIndex + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (selectedUserIndex !== null && selectedUserIndex > 0) {
      setSelectedUserIndex(selectedUserIndex - 1);
    }
  };

  return (
    <div className="flex overflow-x-auto space-x-4 p-4">
      {users.map((user, index) => (
        <button
          key={user.id}
          className="flex-shrink-0 focus:outline-none"
          onClick={() => setSelectedUserIndex(index)}
        >
          <div className="w-16 h-16 rounded-full ring-2 ring-blue-500 p-0.5">
            <img
              src={user.dpUrl}
              alt={user.name}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <p className="mt-1 text-xs text-center truncate w-16">{user.name}</p>
        </button>
      ))}

      {selectedUserIndex !== null && users[selectedUserIndex].stories && (
        <StoryViewer
          stories={users[selectedUserIndex].stories}
          user={users[selectedUserIndex]}
          onClose={handleClose}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      )}
    </div>
  );
}