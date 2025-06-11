import { User, Message } from '../../types';
import { format } from 'date-fns';

interface ChatListProps {
  users: User[];
  messages: Message[];
  selectedUser?: User;
  onSelectUser: (user: User) => void;
}

export const ChatList = ({ 
  users, 
  messages, 
  selectedUser, 
  onSelectUser 
}: ChatListProps) => {
  const getLatestMessage = (userId: string) => {
    return messages
      .filter(msg => msg.senderId === userId || msg.receiverId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .shift();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 bg-white border-b">
        <h2 className="text-lg font-semibold">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2">
        {users.map((user) => {
          const latestMessage = getLatestMessage(user.id);
          const isUnread = latestMessage?.senderId !== selectedUser?.id && !latestMessage?.read;

          return (
            <button
              key={user.id}
              onClick={() => onSelectUser(user)}
              className={`flex items-center px-4 py-3 ${
                selectedUser?.id === user.id 
                  ? 'bg-blue-50' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="relative">
                  <img 
                    src={user.dpUrl} 
                    alt={user.name} 
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{user.name}</h3>
                  {latestMessage && (
                    <p className="text-sm text-gray-600">
                      {latestMessage.content.length > 30 
                        ? `${latestMessage.content.substring(0, 30)}...` 
                        : latestMessage.content}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {latestMessage && (
                    <p className="text-sm text-gray-500">
                      {format(new Date(latestMessage.timestamp), 'HH:mm')}
                    </p>
                  )}
                  {isUnread && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
