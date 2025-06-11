import React from 'react';
import { User } from '../../types';
import { StoryViewer } from './StoryViewer';
import { useStoryNavigation } from '../../hooks/useStoryNavigation';

interface Props {
  users: User[];
  initialUserIndex: number;
  onClose: () => void;
}

export const StoryModal: React.FC<Props> = ({ users, initialUserIndex, onClose }) => {
  const {
    currentUserIndex,
    handleNext,
    handlePrevious,
  } = useStoryNavigation({
    initialIndex: initialUserIndex,
    totalUsers: users.length,
    onComplete: onClose,
  });

  const currentUser = users[currentUserIndex];

  if (!currentUser || !currentUser.stories) return null;

  return (
    <StoryViewer
      user={currentUser}
      onClose={onClose}
      onNext={handleNext}
      onPrevious={handlePrevious}
    />
  );
};