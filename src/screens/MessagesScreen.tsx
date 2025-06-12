import { useState, useEffect } from 'react';
import { ChatList } from '../components/messaging/ChatList';
import { ChatWindow } from '../components/messaging/ChatWindow';
import { User, Message, Conversation, MessageWithProfiles, profileToUser } from '../types';
import { MessagesService } from '../services/messages.service';
import { ProfileService } from '../services/profile.service';

interface Props {
  currentUser: User | null;
  selectedUser?: User | null;
  onClearSelectedUser?: () => void;
  onViewProfile?: (user: User) => void;
}

export const MessagesScreen: React.FC<Props> = ({ 
  currentUser,
  selectedUser: initialSelectedUser, 
  onClearSelectedUser,
  onViewProfile
}) => {
  const [selectedUser, setSelectedUser] = useState<User | undefined>(initialSelectedUser || undefined);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<MessageWithProfiles[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    if (currentUser) {
      loadConversations();
    }
  }, [currentUser]);

  useEffect(() => {
    if (initialSelectedUser) {
      setSelectedUser(initialSelectedUser);
    }
  }, [initialSelectedUser]);

  useEffect(() => {
    if (selectedUser && currentUser) {
      loadMessages(selectedUser.id);
    }
  }, [selectedUser, currentUser]);

  const loadConversations = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const { conversations: fetchedConversations, error: conversationsError } = 
        await MessagesService.getConversations(currentUser.id);
      
      if (conversationsError) {
        throw conversationsError;
      }
      
      setConversations(fetchedConversations);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (otherUserId: string) => {
    if (!currentUser) return;
    
    try {
      const { messages: fetchedMessages, error: messagesError } = 
        await MessagesService.getConversation(currentUser.id, otherUserId);
      
      if (messagesError) {
        throw messagesError;
      }
      
      setMessages(fetchedMessages);
      
      // Mark conversation as read
      await MessagesService.markConversationAsRead(currentUser.id, otherUserId);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedUser || !currentUser) return;

    try {
      const { message: newMessage, error: sendError } = await MessagesService.sendMessage({
        sender_id: currentUser.id,
        receiver_id: selectedUser.id,
        content,
        is_read: false
      });

      if (sendError) {
        throw sendError;
      }

      if (newMessage) {
        // Create a MessageWithProfiles object for display
        const messageWithProfiles: MessageWithProfiles = {
          ...newMessage,
          sender: {
            id: currentUser.id,
            display_name: currentUser.name,
            avatar_url: currentUser.dpUrl
          },
          receiver: {
            id: selectedUser.id,
            display_name: selectedUser.name,
            avatar_url: selectedUser.dpUrl
          }
        };

        setMessages(prev => [...prev, messageWithProfiles]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const handleSelectUser = async (conversationUser: { id: string; display_name: string | null; avatar_url: string | null }) => {
    try {
      // Get full profile for the user
      const { profile, error: profileError } = await ProfileService.getProfile(conversationUser.id);
      
      if (profileError) {
        throw profileError;
      }
      
      if (profile) {
        const user = profileToUser(profile);
        setSelectedUser(user);
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user profile');
    }
    
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

  const handleViewProfile = async (user: User) => {
    if (onViewProfile) {
      onViewProfile(user);
    }
  };

  // Convert MessageWithProfiles to legacy Message format
  const legacyMessages: Message[] = messages.map(msg => ({
    id: msg.id,
    senderId: msg.sender_id,
    receiverId: msg.receiver_id,
    content: msg.content,
    timestamp: msg.created_at,
    read: msg.is_read
  }));

  // Convert conversations to legacy format for ChatList
  const legacyUsers = conversations.map(conv => ({
    id: conv.user.id,
    name: conv.user.display_name || 'User',
    dpUrl: conv.user.avatar_url || `https://i.pravatar.cc/300?u=${conv.user.id}`,
    bio: '',
    gender: 'male' as const,
    age: 25,
    distance: 0,
    interests: [],
    links: {
      Twitter: '',
      Instagram: '',
      LinkedIn: ''
    }
  }));

  if (!currentUser) {
    return (
      <div className="h-full bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Please log in to view messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-black flex">
      {/* Error Message */}
      {error && (
        <div className="absolute top-4 left-4 right-4 z-50 bg-red-900/30 border border-red-700 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Mobile: Show either chat list or chat window */}
      {isMobile ? (
        <>
          {!selectedUser ? (
            <div className="w-full">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading conversations...</p>
                  </div>
                </div>
              ) : (
                <ChatList
                  users={legacyUsers}
                  messages={legacyMessages}
                  selectedUser={selectedUser}
                  onSelectUser={(user) => handleSelectUser({
                    id: user.id,
                    display_name: user.name,
                    avatar_url: user.dpUrl
                  })}
                />
              )}
            </div>
          ) : (
            <div className="w-full">
              <ChatWindow
                user={selectedUser}
                messages={legacyMessages.filter(msg => 
                  msg.senderId === selectedUser.id || msg.receiverId === selectedUser.id
                )}
                onSendMessage={handleSendMessage}
                currentUserId={currentUser.id}
                onBack={handleBackToList}
                onViewProfile={handleViewProfile}
              />
            </div>
          )}
        </>
      ) : (
        /* Desktop: Show both panels */
        <>
          <div className="w-80 border-r border-gray-800">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading conversations...</p>
                </div>
              </div>
            ) : (
              <ChatList
                users={legacyUsers}
                messages={legacyMessages}
                selectedUser={selectedUser}
                onSelectUser={(user) => handleSelectUser({
                  id: user.id,
                  display_name: user.name,
                  avatar_url: user.dpUrl
                })}
              />
            )}
          </div>
          <div className="flex-1">
            {selectedUser ? (
              <ChatWindow
                user={selectedUser}
                messages={legacyMessages.filter(msg => 
                  msg.senderId === selectedUser.id || msg.receiverId === selectedUser.id
                )}
                onSendMessage={handleSendMessage}
                currentUserId={currentUser.id}
                onBack={isMobile ? handleBackToList : undefined}
                onViewProfile={handleViewProfile}
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