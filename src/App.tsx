import { useState, useEffect } from 'react';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { RadarScreen } from './screens/RadarScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { CreatePostScreen } from './screens/CreatePostScreen';
import { MessagesScreen } from './screens/MessagesScreen';
import { UserGroupIcon, Squares2X2Icon, UserIcon, PlusIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { User, ProfileWithSocial, profileToUser } from './types';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const { user, profile, loading, isAuthenticated } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'login' | 'app'>('welcome');
  const [activeTab, setActiveTab] = useState('radar');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedChatUser, setSelectedChatUser] = useState<User | null>(null);

  // Convert profile to User type for legacy components
  const currentUser: User | null = profile ? profileToUser(profile) : null;

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && profile) {
        setCurrentScreen('app');
      } else {
        setCurrentScreen('welcome');
      }
    }
  }, [loading, isAuthenticated, profile]);

  const handleGetStarted = () => {
    setCurrentScreen('login');
  };

  const handleLogin = () => {
    // Auth state will be handled by useAuth hook
    setCurrentScreen('app');
  };

  const handleLogout = () => {
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

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

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
    <div className="h-screen bg-black text-white overflow-hidden">
      {/* Mobile App Container */}
      <div className="h-full flex flex-col">
        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden">
          {activeTab === 'radar' && (
            <RadarScreen 
              currentUser={currentUser}
              onNavigate={setActiveTab}
              onViewProfile={setSelectedUser}
              onMessageUser={handleMessageUser}
            />
          )}
          {activeTab === 'feed' && <HomeScreen currentUser={currentUser} />}
          {activeTab === 'create' && <CreatePostScreen currentUser={currentUser} />}
          {activeTab === 'messages' && (
            <MessagesScreen 
              currentUser={currentUser}
              selectedUser={selectedChatUser}
              onClearSelectedUser={() => setSelectedChatUser(null)}
              onViewProfile={handleViewProfile}
            />
          )}
          {activeTab === 'profile' && (
            <ProfileScreen 
              user={selectedUser} 
              currentUser={currentUser}
              onBack={() => setSelectedUser(null)}
              onLogout={handleLogout}
              onNavigateToCreate={handleNavigateToCreate}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <nav className="bg-gray-900 border-t border-gray-800 safe-area-inset-bottom">
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