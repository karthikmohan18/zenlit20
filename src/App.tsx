'use client'
import { useState, useEffect } from 'react';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { LoginScreen } from './screens/LoginScreen';
import { ProfileSetupScreen } from './screens/ProfileSetupScreen';
import { HomeScreen } from './screens/HomeScreen';
import { RadarScreen } from './screens/RadarScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { CreatePostScreen } from './screens/CreatePostScreen';
import { MessagesScreen } from './screens/MessagesScreen';
import { UserGroupIcon, Squares2X2Icon, UserIcon, PlusIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { User } from './types';
import { supabase } from './lib/supabase';
import { ensureProfileExists } from './lib/auth';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'login' | 'profileSetup' | 'app'>('welcome');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userGender] = useState<'male' | 'female'>('male');
  const [activeTab, setActiveTab] = useState('radar');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedChatUser, setSelectedChatUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if Supabase is available
      if (!supabase) {
        console.warn('Supabase not available, using offline mode');
        setCurrentScreen('welcome');
        setIsLoading(false);
        return;
      }

      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        setCurrentScreen('welcome');
        setIsLoading(false);
        return;
      }

      // Ensure profile exists for this user
      await ensureProfileExists(user);

      // Wait a moment for profile creation to complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if user has a profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      // Only log errors that are not expected "no rows found" scenarios
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileError);
        setCurrentScreen('welcome');
        setIsLoading(false);
        return;
      }

      // If still no profile exists after ensuring it, try one more time
      if (!profile) {
        console.log('Profile not found, retrying...');
        await ensureProfileExists(user);
        
        // Wait a bit more and try again
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: retryProfile, error: retryError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (retryError && retryError.code !== 'PGRST116') {
          console.error('Profile retry fetch error:', retryError);
          setCurrentScreen('profileSetup');
          setIsLoading(false);
          return;
        }

        if (retryProfile) {
          setCurrentUser(retryProfile);
          setIsLoggedIn(true);
          
          // Check if profile has essential fields filled out
          const isProfileComplete = retryProfile.name && 
                                  retryProfile.bio && 
                                  retryProfile.date_of_birth && 
                                  retryProfile.gender;
          
          if (isProfileComplete) {
            setCurrentScreen('app');
          } else {
            setCurrentScreen('profileSetup');
          }
        } else {
          // Still no profile, go to profile setup
          setCurrentScreen('profileSetup');
        }
        setIsLoading(false);
        return;
      }

      setCurrentUser(profile);
      setIsLoggedIn(true);

      // Check if profile has essential fields filled out (not just the profile_completed flag)
      const isProfileComplete = profile.name && 
                               profile.bio && 
                               profile.date_of_birth && 
                               profile.gender;

      if (isProfileComplete) {
        setCurrentScreen('app');
      } else {
        setCurrentScreen('profileSetup');
      }
      
    } catch (error) {
      console.error('Auth check error:', error);
      setCurrentScreen('welcome');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetStarted = () => {
    setCurrentScreen('login');
  };

  const handleLogin = async () => {
    setIsLoggedIn(true);
    
    // Check if user needs to complete profile setup
    try {
      if (!supabase) {
        setCurrentScreen('app');
        return;
      }

      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        setCurrentScreen('welcome');
        return;
      }

      // Ensure profile exists
      await ensureProfileExists(user);

      // Wait a moment for profile creation
      await new Promise(resolve => setTimeout(resolve, 500));

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      // Only log errors that are not expected "no rows found" scenarios
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileError);
        setCurrentScreen('profileSetup');
        return;
      }

      if (!profile) {
        setCurrentScreen('profileSetup');
        return;
      }

      setCurrentUser(profile);

      // Check if profile has essential fields filled out
      const isProfileComplete = profile.name && 
                               profile.bio && 
                               profile.date_of_birth && 
                               profile.gender;

      if (isProfileComplete) {
        setCurrentScreen('app');
      } else {
        setCurrentScreen('profileSetup');
      }
    } catch (error) {
      console.error('Login check error:', error);
      setCurrentScreen('profileSetup');
    }
  };

  const handleProfileSetupComplete = (profileData: any) => {
    // Use the profile data directly from the setup screen
    // This data already includes profile_completed: true
    setCurrentUser(profileData);
    setCurrentScreen('app');
  };

  const handleLogout = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
      setIsLoggedIn(false);
      setCurrentUser(null);
      setCurrentScreen('welcome');
      setActiveTab('radar');
      setSelectedUser(null);
      setSelectedChatUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
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

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
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

  // Show profile setup screen for new users
  if (currentScreen === 'profileSetup') {
    return (
      <ProfileSetupScreen 
        onComplete={handleProfileSetupComplete}
        onBack={() => setCurrentScreen('login')}
      />
    );
  }

  // Show main app after login and profile setup
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
                  currentUser={currentUser}
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