import { useState, useEffect } from 'react';
import { mockMaleUsers, mockFemaleUsers } from '../data/mockData';
import { MessagingContainer } from '../components/messaging/MessagingContainer';
import { User } from '../types';

export const MessagesScreen: React.FC = () => {
  const [currentUserId] = useState<string>(Date.now().toString());
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    // Combine male and female users
    setAllUsers([...mockMaleUsers, ...mockFemaleUsers]);
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <MessagingContainer 
        users={allUsers}
        currentUserId={currentUserId}
      />
    </div>
  );
};