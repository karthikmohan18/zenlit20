import { useState, useEffect } from 'react';
import { mockMaleUsers, mockFemaleUsers } from '../data/mockData';
import { ChatList } from '../components/messaging/ChatList';
import { ChatWindow } from '../components/messaging/ChatWindow';
import { User, Message } from '../types';
import { generateMessages } from '../data/mockData';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

interface Props {
  selectedUser?: User | null;
  onClearSelectedUser?: () => void;
}

export const MessagesScreen: React.FC<Props> = ({ 
  selectedUser: initialSelectedUser, 
  onClearSelectedUser 
}) => {
  const [currentUserId] = useState<string>('current-user-id');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(initialSelectedUser || undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    setAllUsers([...mockMaleUsers.slice(0, 10), ...mockFemaleUsers.slice(0, 10)]);
  }, []);

  useEffect(() => {
    if (initialSelectedUser) {
      setSelectedUser(initialSelectedUser);
    }
  }, [initialSelectedUser]);

  useEffect(() => {
    if (selectedUser) {
      const userMessages = generateMessages(currentUserId, [selectedUser]);
      setMessages(userMessages);
    }
  }, [selectedUser, currentUserId]);

  const handleSendMessage = (content: string) => {
    if (!selectedUser) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      receiverId: selectedUser.id,
      content,
      timestamp: new Date().toISOString(),
      read: false
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    if (onClearSelectedUser) {
      onClearSelectedUser();
    }
  };

  const handleBackToList = () => {
    setSelectedUser(undefined);
    if (onClearSelectedUser) {
      onClearSelectedUser();
    }
  };

  return (
    <div className="h-full bg-black flex">
      {/* Mobile: Show either chat list or chat window */}
      {isMobile ? (
        <>
          {!selectedUser ? (
            <div className="w-full">
              <ChatList
                users={allUsers}
                messages={messages}
                selectedUser={selectedUser}
                onSelectUser={handleSelectUser}
              />
            </div>
          ) : (
            <div className="w-full flex flex-col">
              {/* Mobile Chat Header with Back Button */}
              <div className="flex items-center px-4 py-3 bg-gray-900 border-b border-gray-800">
                <button
                  onClick={handleBackToList}
                  className="mr-3 p-2 rounded-full hover:bg-gray-800 active:scale-95 transition-transform"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-white" />
                </button>
                <img 
                  src={selectedUser.dpUrl} 
                  alt={selectedUser.name} 
                  className="w-8 h-8 rounded-full mr-3"
                />
                <div>
                  <h3 className="font-semibold text-white">{selectedUser.name}</h3>
                  <p className="text-xs text-gray-400">Active now</p>
                </div>
              </div>
              
              {/* Chat Content */}
              <div className="flex-1">
                <ChatWindow
                  user={selectedUser}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  currentUserId={currentUserId}
                />
              </div>
            </div>
          )}
        </>
      ) : (
        /* Desktop: Show both panels */
        <>
          <div className="w-80 border-r border-gray-800">
            <ChatList
              users={allUsers}
              messages={messages}
              selectedUser={selectedUser}
              onSelectUser={handleSelectUser}
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
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-gray-400">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};