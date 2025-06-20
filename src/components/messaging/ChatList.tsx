import { useState, useEffect } from 'react';
import { User, Message } from '../../types';
import { format } from 'date-fns';
import { getCurrentLocation, calculateDistance } from '../../lib/geo';

interface Contact extends User {
  latitude?: number;
  longitude?: number;
  hasHistory?: boolean;
  isNearby: boolean;
}

interface ChatMessage extends Message {}

interface ChatListProps {
  users: User[];
  messages: Message[];
  selectedUser?: User & { isNearby?: boolean };
  onSelectUser: (user: User & { isNearby: boolean }) => void;
  searchQuery?: string;
}

export const ChatList = ({
  users,
  messages,
  selectedUser,
  onSelectUser,
  searchQuery = ''
}: ChatListProps) => {
  const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [nearbyContacts, setNearbyContacts] = useState<Contact[]>([]);
  const [historyOnlyContacts, setHistoryOnlyContacts] = useState<Contact[]>([]);

  useEffect(() => {
    let watchId: number | undefined;

    const loadLocation = async () => {
      const loc = await getCurrentLocation();
      if (loc) {
        setCurrentCoords(loc);
      }
    };

    loadLocation();

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition((pos) => {
        setCurrentCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      });
    }

    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  useEffect(() => {
    if (!users || users.length === 0) {
      setNearbyContacts([]);
      setHistoryOnlyContacts([]);
      return;
    }

    if (!currentCoords) {
      setNearbyContacts([]);
      setHistoryOnlyContacts(
        users
          .filter(u => (u as Contact).hasHistory)
          .map(u => ({ ...(u as Contact), isNearby: false })) as Contact[]
      );
      return;
    }

    const nearby: Contact[] = [];
    const history: Contact[] = [];

    users.forEach((u) => {
      const contact = u as Contact;
      if (contact.latitude != null && contact.longitude != null) {
        const d = calculateDistance(currentCoords.latitude, currentCoords.longitude, contact.latitude, contact.longitude);
        if (d <= 1) {
          nearby.push({ ...contact, isNearby: true });
        } else if (contact.hasHistory) {
          history.push({ ...contact, isNearby: false });
        }
      } else if (contact.hasHistory) {
        history.push({ ...contact, isNearby: false });
      }
    });

    setNearbyContacts(nearby);
    setHistoryOnlyContacts(history);
  }, [users, currentCoords]);
  const getLatestMessage = (userId: string) => {
    return messages
      .filter(msg => msg.senderId === userId || msg.receiverId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .shift();
  };

  // Show empty state when searching but no results
  if (searchQuery && users.length === 0) {
    return (
      <div className="flex flex-col h-full bg-black">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-400 mb-2">No users found</p>
            <p className="text-gray-500 text-sm">
              Try searching by name or username
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {nearbyContacts.map((user) => {
          const latestMessage = getLatestMessage(user.id);

          return (
            <button
              key={user.id}
              onClick={() => onSelectUser(user)}
              className={`flex items-center px-4 py-3 w-full text-left transition-colors ${
                selectedUser?.id === user.id 
                  ? 'bg-gray-800' 
                  : 'hover:bg-gray-900'
              }`}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="relative flex-shrink-0">
                  <img 
                    src={user.dpUrl} 
                    alt={user.name} 
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex flex-col min-w-0">
                      <h3 className="font-semibold text-white truncate">{user.name}</h3>
                      {user.username && (
                        <p className="text-xs text-gray-500">@{user.username}</p>
                      )}
                    </div>
                    {latestMessage && (
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {format(new Date(latestMessage.timestamp), 'HH:mm')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    {latestMessage ? (
                      <p className="text-sm text-gray-400 truncate pr-2">
                        {latestMessage.content.length > 35 
                          ? `${latestMessage.content.substring(0, 35)}...` 
                          : latestMessage.content}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 italic">Start a conversation</p>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
        {historyOnlyContacts.length > 0 && (
          <div className="mt-2 border-t border-gray-800 pt-2">
            {historyOnlyContacts.map((user) => {
              const latestMessage = getLatestMessage(user.id);

              return (
                <button
                  key={user.id}
                  onClick={() => onSelectUser(user)}
                  className={`flex items-center px-4 py-3 w-full text-left transition-colors ${
                    selectedUser?.id === user.id ? 'bg-gray-800' : 'hover:bg-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="relative flex-shrink-0 w-11 h-11 bg-gray-700 rounded-full" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex flex-col min-w-0">
                          <h3 className="font-semibold text-gray-400 truncate">Anonymous</h3>
                        </div>
                        {latestMessage && (
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                            {format(new Date(latestMessage.timestamp), 'HH:mm')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        {latestMessage ? (
                          <p className="text-sm text-gray-400 truncate pr-2">
                            {latestMessage.content.length > 35
                              ? `${latestMessage.content.substring(0, 35)}...`
                              : latestMessage.content}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500 italic">Start a conversation</p>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};