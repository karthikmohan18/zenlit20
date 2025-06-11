import { useState, useCallback } from 'react';

interface UseStoryNavigationProps {
  initialIndex: number;
  totalUsers: number;
  onComplete: () => void;
}

export const useStoryNavigation = ({
  initialIndex,
  totalUsers,
  onComplete,
}: UseStoryNavigationProps) => {
  const [currentUserIndex, setCurrentUserIndex] = useState(initialIndex);

  const handleNext = useCallback(() => {
    if (currentUserIndex < totalUsers - 1) {
      setCurrentUserIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  }, [currentUserIndex, totalUsers, onComplete]);

  const handlePrevious = useCallback(() => {
    if (currentUserIndex > 0) {
      setCurrentUserIndex(prev => prev - 1);
    }
  }, [currentUserIndex]);

  return {
    currentUserIndex,
    handleNext,
    handlePrevious,
  };
};