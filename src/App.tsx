'use client'
import { useState } from 'react';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { RadarScreen } from './screens/RadarScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { CreatePostScreen } from './screens/CreatePostScreen';
import { MessagesScreen } from './screens/MessagesScreen';
import { UserGroupIcon, Squares2X2Icon, UserIcon, PlusIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { User } from './types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'login' | 'app'>('welcome');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userGender] = useState<'male' | 'female'>('male');
  const [activeTab, setActiveTab] = useState('radar');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedChatUser, setSelectedChatUser] = useState<User | null>(null);

  const handleGetStarted = () => {
    setCurrentScreen('login');
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentScreen('app');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentScreen('welcome');
    setActiveTab('radar');
    setSelectedUser(null);
    setSelectedChatUser(null);
  };

  const handleMessageUser = (user: User) => {
    setSelectedChatUser(user);
  };

  const handleViewProfile = (user: User) => {
    setSelectedUser(user);
    setActiveTab('profile');
  };

  const handleNavigateToCreate = () => {
    setActiveTab('create');
  };

  // Show welcome screen first
  if (currentScreen === 'welcome') {
    return <WelcomeScreen onGetStarted={handleGetStarted} />;
  }

  // Show login screen after get started is clicked
  if (currentScreen === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Show main app after login
  return (
    <div className="h-screen bg-black text-white overflow-hidden flex flex-col">
      {/* Mobile App Container */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative">
          <div className="h-full">
            {activeTab === 'radar' && (
              <div className="h-full overflow-y-auto mobile-scroll">
                <RadarScreen 
                  userGender={userGender} 
                  onNavigate={setActiveTab}
                  onViewProfile={setSelectedUser}
                  onMessageUser={handleMessageUser}
                />
              </div>
            )}
            {activeTab === 'feed' && (
              <div className="h-full overflow-y-auto mobile-scroll">
                <HomeScreen userGender={userGender} />
              </div>
            )}
            {activeTab === 'create' && (
              <div className="h-full overflow-y-auto mobile-scroll">
                <CreatePostScreen />
              </div>
            )}
            {activeTab === 'messages' && (
              <div className="h-full">
                <MessagesScreen 
                  selectedUser={selectedChatUser}
                  onClearSelectedUser={() => setSelectedChatUser(null)}
                  onViewProfile={handleViewProfile}
                />
              </div>
            )}
            {activeTab === 'profile' && (
              <div className="h-full overflow-y-auto mobile-scroll">
                <ProfileScreen 
                  user={selectedUser} 
                  onBack={() => setSelectedUser(null)}
                  onLogout={handleLogout}
                  onNavigateToCreate={handleNavigateToCreate}
                />
              </div>
            )}
          </div>
        </main>

        {/* Bottom Navigation */}
        <nav className="bg-gray-900 border-t border-gray-800 safe-area-inset-bottom flex-shrink-0">
          <div className="flex justify-around items-center py-2 px-4 h-16">
            <button
              onClick={() => setActiveTab('radar')}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                activeTab === 'radar' ? 'text-blue-500' : 'text-gray-400'
              }`}
            >
              <UserGroupIcon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">Radar</span>
            </button>
            
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                activeTab === 'feed' ? 'text-blue-500' : 'text-gray-400'
              }`}
            >
              <Squares2X2Icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">Feed</span>
            </button>

            <button
              onClick={() => setActiveTab('create')}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                activeTab === 'create' ? 'text-blue-500' : 'text-gray-400'
              }`}
            >
              <PlusIcon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">Create</span>
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                activeTab === 'messages' ? 'text-blue-500' : 'text-gray-400'
              }`}
            >
              <ChatBubbleLeftIcon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">Messages</span>
            </button>
            
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                activeTab === 'profile' ? 'text-blue-500' : 'text-gray-400'
              }`}
            >
              <UserIcon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">Profile</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}