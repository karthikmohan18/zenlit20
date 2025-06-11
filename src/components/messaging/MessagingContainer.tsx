import { useState, useEffect } from 'react';
import { User, Message } from '../../types';
import { generateMessages } from '../../data/mockData';
import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';
import { MessageInput } from './MessageInput';

interface MessagingContainerProps {
  users: User[];
  currentUserId: string;
}

export const MessagingContainer = ({ users, currentUserId }: MessagingContainerProps) => {
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (selectedUser) {
      const userMessages = generateMessages(currentUserId, [selectedUser]);
      setMessages(userMessages);
    }
  }, [selectedUser, currentUserId]);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      receiverId: selectedUser!.id,
      content,
      timestamp: new Date().toISOString(),
      read: false
    };

    setMessages(prev => [...prev, newMessage]);
  };

  return (
    <div className="flex h-full">
      <div className="w-64 border-r">
        <ChatList
          users={users}
          messages={messages}
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
        />
      </div>
      <div className="flex-1">
        {selectedUser ? (
          <ChatWindow
            user={selectedUser}
            messages={messages}
            onSendMessage={handleSendMessage}
            currentUserId={currentUserId}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};
