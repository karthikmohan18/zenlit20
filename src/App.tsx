import { useState } from 'react';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { RadarScreen } from './screens/RadarScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { CreatePostScreen } from './screens/CreatePostScreen';
import { MessagesScreen } from './screens/MessagesScreen';
import { HomeIcon, UserGroupIcon, UserIcon, PlusIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { User } from './types';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userGender] = useState<'male' | 'female'>('male');
  const [activeTab, setActiveTab] = useState('home');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md bg-black text-white rounded-lg overflow-hidden">
        <main className="pb-16 sm:pb-20 md:pb-24">
          {activeTab === 'home' && <HomeScreen userGender={userGender} />}
          {activeTab === 'radar' && (
            <RadarScreen 
              userGender={userGender} 
              onNavigate={setActiveTab}
              onViewProfile={setSelectedUser} 
            />
          )}
          {activeTab === 'create' && <CreatePostScreen />}
          {activeTab === 'messages' && <MessagesScreen />}
          {/* Mobile-friendly padding for content */}
          <div className="px-4 sm:px-0 md:px-4">
            {activeTab === 'profile' && (
              <ProfileScreen 
                user={selectedUser} 
                onBack={() => setSelectedUser(null)}
              />
            )}
          </div>
        </main>
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
          <div className="max-w-md mx-auto">
            <div className="flex justify-around p-4">
              <button
                onClick={() => setActiveTab('home')}
                className={`flex flex-col items-center ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-400'}`}
              >
                <HomeIcon className="h-6 w-6" />
              </button>
              
              <button
                onClick={() => setActiveTab('radar')}
                className={`flex flex-col items-center ${activeTab === 'radar' ? 'text-blue-600' : 'text-gray-400'}`}
              >
                <UserGroupIcon className="h-6 w-6" />
              </button>

              <button
                onClick={() => setActiveTab('create')}
                className={`flex flex-col items-center ${activeTab === 'create' ? 'text-blue-600' : 'text-gray-400'}`}
              >
                <PlusIcon className="h-6 w-6" />
              </button>

              <button
                onClick={() => setActiveTab('messages')}
                className={`flex flex-col items-center ${activeTab === 'messages' ? 'text-blue-600' : 'text-gray-400'}`}
              >
                <ChatBubbleLeftIcon className="h-6 w-6" />
              </button>
              
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex flex-col items-center ${activeTab === 'profile' ? 'text-blue-600' : 'text-gray-400'}`}
              >
                <UserIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}