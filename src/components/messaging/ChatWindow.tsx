import { useState, useEffect, useRef } from 'react';
import { Message, User } from '../../types';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';

interface ChatWindowProps {
  user: User;
  messages: Message[];
  onSendMessage: (content: string) => void;
  currentUserId: string;
}

export const ChatWindow = ({ 
  user, 
  messages, 
  onSendMessage, 
  currentUserId 
}: ChatWindowProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <img 
                src={user.dpUrl} 
                alt={user.name} 
                className="w-16 h-16 rounded-full mx-auto mb-4"
              />
              <p className="text-gray-400">Start a conversation with {user.name}</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isCurrentUser={message.senderId === currentUserId}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-800 p-4">
        <MessageInput onSendMessage={onSendMessage} />
      </div>
    </div>
  );
};