import { useState, useEffect } from 'react';
import { Message, User } from '../../types';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { format } from 'date-fns';

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
  const [scrollToBottom, setScrollToBottom] = useState(false);

  useEffect(() => {
    setScrollToBottom(true);
  }, [messages]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
        <div className="flex items-center gap-3">
          <img 
            src={user.dpUrl} 
            alt={user.name} 
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold">{user.name}</h3>
            <p className="text-sm text-gray-500">Active now</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 sm:p-3"
        ref={(el) => {
          if (scrollToBottom && el) {
            el.scrollTop = el.scrollHeight;
            setScrollToBottom(false);
          }
        }}
      >
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isCurrentUser={message.senderId === currentUserId}
          />
        ))}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-800">
        <MessageInput onSendMessage={onSendMessage} />
      </div>
    </div>
  );
};
