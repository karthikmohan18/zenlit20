import { useState, useEffect } from 'react';
import { ChatList } from '../components/messaging/ChatList';
import { ChatWindow } from '../components/messaging/ChatWindow';
import { User, Message } from '../types';
import { generateMessages } from '../data/mockData';
import { supabase } from '../lib/supabase';

interface Props {
  selectedUser?: User | null;
  onClearSelectedUser?: () => void;
  onViewProfile?: (user: User) => void;
}

export const MessagesScreen: React.FC<Props> = ({ 
  selectedUser: initialSelectedUser, 
  onClearSelectedUser,
  onViewProfile
}) => {
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(initialSelectedUser || undefined);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [isMobile] = useState(window.innerWidth < 768);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsersAndMessages();
  }, []);

  useEffect(() => {
    if (initialSelectedUser) {
      setSelectedUser(initialSelectedUser);
    }
  }, [initialSelectedUser]);

  const loadUsersAndMessages = async () => {
    try {
      // Check if Supabase is available
      if (!supabase) {
        console.warn('Supabase not available, using offline mode');
        setIsLoading(false);
        return;
      }

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) return;

      setCurrentUserId(currentUser.id);

      // Get users who have completed their profiles for messaging
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', currentUser.id) // Exclude current user
        .not('name', 'is', null)
        .not('bio', 'is', null)
        .limit(10);

      if (error) {
        console.error('Error loading users:', error);
        return;
      }

      // Transform database profiles to User type
      const transformedUsers: User[] = (profiles || []).map(profile => ({
        id: profile.id,
        name: profile.name,
        dpUrl: profile.profile_photo_url || `https://i.pravatar.cc/300?img=${profile.id}`,
        bio: profile.bio,
        gender: profile.gender,
        age: profile.date_of_birth ? 
          new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear() : 25,
        distance: Math.floor(Math.random() * 50) + 1,
        interests: profile.interests || [],
        links: {
          Twitter: profile.twitter_url || '#',
          Instagram: profile.instagram_url || '#',
          LinkedIn: profile.linked_in_url || '#',
        },
        instagramUrl: profile.instagram_url,
        instagramVerified: profile.instagram_verified,
        facebookUrl: profile.facebook_url,
        facebookVerified: profile.facebook_verified,
        linkedInUrl: profile.linked_in_url,
        linkedInVerified: profile.linked_in_verified,
        twitterUrl: profile.twitter_url,
        twitterVerified: profile.twitter_verified,
        googleUrl: profile.google_url,
        googleVerified: profile.google_verified,
      }));

      setAllUsers(transformedUsers);
      
      // Generate messages for all users upfront (this would be replaced with real messages from database)
      const messagesForAllUsers = transformedUsers.flatMap(user => 
        generateMessages(currentUser.id, [user])
      );
      setAllMessages(messagesForAllUsers);
    } catch (error) {
      console.error('Error loading users and messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMessagesForUser = (userId: string): Message[] => {
    return allMessages.filter(msg => 
      msg.senderId === userId || msg.receiverId === userId
    );
  };

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

    setAllMessages(prev => [...prev, newMessage]);
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

  const selectedUserMessages = selectedUser ? getMessagesForUser(selectedUser.id) : [];

  if (isLoading) {
    return (
      <div className="h-full bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-black flex">
      {/* Mobile: Show either chat list or chat window */}
      {isMobile ? (
        <>
          {!selectedUser ? (
            <div className="w-full">
              <ChatList
                users={allUsers}
                messages={allMessages}
                selectedUser={selectedUser}
                onSelectUser={handleSelectUser}
              />
            </div>
          ) : (
            <div className="w-full">
              <ChatWindow
                user={selectedUser}
                messages={selectedUserMessages}
                onSendMessage={handleSendMessage}
                currentUserId={currentUserId}
                onBack={handleBackToList}
                onViewProfile={onViewProfile}
              />
            </div>
          )}
        </>
      ) : (
        /* Desktop: Show both panels */
        <>
          <div className="w-80 border-r border-gray-800">
            <ChatList
              users={allUsers}
              messages={allMessages}
              selectedUser={selectedUser}
              onSelectUser={handleSelectUser}
            />
          </div>
          <div className="flex-1">
            {selectedUser ? (
              <ChatWindow
                user={selectedUser}
                messages={selectedUserMessages}
                onSendMessage={handleSendMessage}
                currentUserId={currentUserId}
                onBack={isMobile ? handleBackToList : undefined}
                onViewProfile={onViewProfile}
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