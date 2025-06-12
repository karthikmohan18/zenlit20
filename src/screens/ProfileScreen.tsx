import React, { useState, useEffect } from 'react';
import { User, PostWithProfile, postWithProfileToLegacyPost } from '../types';
import { IconBrandInstagram, IconBrandLinkedin, IconBrandX } from '@tabler/icons-react';
import { ChevronLeftIcon, Cog6ToothIcon, UserIcon, ArrowRightOnRectangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { PostsGalleryScreen } from './PostsGalleryScreen';
import { EditProfileScreen } from './EditProfileScreen';
import { PostsService } from '../services/posts.service';
import { useAuth } from '../hooks/useAuth';

interface Props {
  user?: User | null;
  currentUser?: User | null;
  onBack?: () => void;
  onLogout?: () => void;
  onNavigateToCreate?: () => void;
}

export const ProfileScreen: React.FC<Props> = ({ user, currentUser, onBack, onLogout, onNavigateToCreate }) => {
  const { signOut } = useAuth();
  const [showPostsGallery, setShowPostsGallery] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [userPosts, setUserPosts] = useState<PostWithProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const profileData = user || currentUser;
  const isCurrentUser = !user || (currentUser && user.id === currentUser.id);

  useEffect(() => {
    if (profileData && isCurrentUser) {
      loadUserPosts();
    }
  }, [profileData, isCurrentUser]);

  const loadUserPosts = async () => {
    if (!profileData) return;
    
    try {
      setLoading(true);
      const { posts, error: postsError } = await PostsService.getUserPosts(profileData.id);
      
      if (postsError) {
        throw postsError;
      }
      
      setUserPosts(posts);
    } catch (err) {
      console.error('Error loading user posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleMediaClick = () => {
    setShowPostsGallery(true);
  };

  const handleBackFromGallery = () => {
    setShowPostsGallery(false);
  };

  const handleEditProfile = () => {
    setShowSettingsMenu(false);
    setShowEditProfile(true);
  };

  const handleBackFromEdit = () => {
    setShowEditProfile(false);
  };

  const handleLogout = async () => {
    setShowSettingsMenu(false);
    if (confirm('Are you sure you want to log out?')) {
      try {
        await signOut();
        if (onLogout) {
          onLogout();
        }
      } catch (err) {
        console.error('Error signing out:', err);
        setError(err instanceof Error ? err.message : 'Failed to sign out');
      }
    }
  };

  const handleCreatePost = () => {
    if (onNavigateToCreate) {
      onNavigateToCreate();
    }
  };

  if (!profileData) {
    return (
      <div className="h-full bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Profile not found</p>
        </div>
      </div>
    );
  }

  // Count verified social accounts
  const verifiedAccountsCount = [
    profileData.instagramVerified,
    profileData.facebookVerified,
    profileData.linkedInVerified,
    profileData.twitterVerified,
    profileData.googleVerified
  ].filter(Boolean).length;

  if (showEditProfile) {
    return (
      <EditProfileScreen
        user={profileData}
        onBack={handleBackFromEdit}
        onSave={(updatedUser) => {
          // TODO: Implement save functionality
          console.log('Updated user:', updatedUser);
          setShowEditProfile(false);
        }}
      />
    );
  }

  if (showPostsGallery) {
    return (
      <PostsGalleryScreen
        user={profileData}
        posts={userPosts.map(postWithProfileToLegacyPost)}
        onBack={handleBackFromGallery}
        onUserClick={() => {}} // Since we're already viewing this user's profile
      />
    );
  }

  return (
    <div className="h-full bg-black overflow-y-auto">
      {/* Profile Header with Cover Photo */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-b from-blue-900 to-black">
          <img
            src={`https://picsum.photos/800/400?random=${profileData.id}`}
            alt="Profile Cover"
            className="w-full h-full object-cover opacity-60"
          />
          
          {/* Header buttons positioned on cover photo */}
          <div className="absolute top-4 left-0 right-0 flex items-center justify-between px-4">
            {/* Back button (only for other users) */}
            {user && onBack && (
              <button
                onClick={onBack}
                className="bg-black/50 backdrop-blur-sm p-3 rounded-full shadow-lg active:scale-95 transition-transform"
              >
                <ChevronLeftIcon className="w-5 h-5 text-white" />
              </button>
            )}
            
            {/* Spacer for centering when no back button */}
            {(!user || !onBack) && <div className="w-12" />}
            
            {/* Settings button (only for current user) */}
            {isCurrentUser && (
              <div className="relative">
                <button
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  className="bg-black/50 backdrop-blur-sm p-3 rounded-full shadow-lg active:scale-95 transition-transform"
                >
                  <Cog6ToothIcon className="w-5 h-5 text-white" />
                </button>
                
                {/* Settings Dropdown Menu */}
                {showSettingsMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
                    <button
                      onClick={handleEditProfile}
                      className="w-full flex items-center px-4 py-3 text-left text-white hover:bg-gray-800 active:bg-gray-700 transition-colors"
                    >
                      <UserIcon className="w-5 h-5 mr-3 text-gray-400" />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-3 text-left text-white hover:bg-gray-800 active:bg-gray-700 transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3 text-gray-400" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Spacer when viewing other user's profile */}
            {!isCurrentUser && <div className="w-12" />}
          </div>
        </div>
        
        {/* Profile Avatar */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <img
              src={profileData.dpUrl}
              alt={profileData.name}
              className="w-28 h-28 rounded-full border-4 border-black object-cover shadow-xl"
            />
            {/* Verified badge if user has verified accounts */}
            {verifiedAccountsCount > 0 && (
              <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1 border-2 border-black">
                <CheckCircleIcon className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </div>
        
        {/* Click outside to close settings menu */}
        {showSettingsMenu && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowSettingsMenu(false)}
          />
        )}
      </div>

      {/* Profile Content */}
      <div className="mt-16 px-4 pb-8">
        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-900/30 border border-red-700 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-2xl font-bold text-white">{profileData.name}</h1>
            {verifiedAccountsCount > 0 && (
              <CheckCircleIcon className="w-6 h-6 text-blue-500" />
            )}
          </div>
          
          {/* Verification status */}
          {verifiedAccountsCount > 0 && (
            <p className="text-sm text-blue-400 mb-2">
              {verifiedAccountsCount} verified account{verifiedAccountsCount !== 1 ? 's' : ''}
            </p>
          )}
          
          <p className="text-gray-300 mt-2 text-base leading-relaxed">{profileData.bio}</p>
          
          {/* Social Links with verification indicators */}
          <div className="flex justify-center gap-8 mt-8">
            <a
              href={profileData.links.Twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="relative p-3 bg-gray-800 rounded-full text-gray-300 hover:text-white hover:bg-gray-700 transition-all active:scale-95"
            >
              <IconBrandX size={24} />
              {profileData.twitterVerified && (
                <div className="absolute -top-1 -right-1 bg-blue-600 rounded-full p-0.5">
                  <CheckCircleIcon className="w-3 h-3 text-white" />
                </div>
              )}
            </a>
            <a
              href={profileData.links.Instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="relative p-3 bg-gray-800 rounded-full text-gray-300 hover:text-white hover:bg-gray-700 transition-all active:scale-95"
            >
              <IconBrandInstagram size={24} />
              {profileData.instagramVerified && (
                <div className="absolute -top-1 -right-1 bg-blue-600 rounded-full p-0.5">
                  <CheckCircleIcon className="w-3 h-3 text-white" />
                </div>
              )}
            </a>
            <a
              href={profileData.links.LinkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="relative p-3 bg-gray-800 rounded-full text-gray-300 hover:text-white hover:bg-gray-700 transition-all active:scale-95"
            >
              <IconBrandLinkedin size={24} />
              {profileData.linkedInVerified && (
                <div className="absolute -top-1 -right-1 bg-blue-600 rounded-full p-0.5">
                  <CheckCircleIcon className="w-3 h-3 text-white" />
                </div>
              )}
            </a>
          </div>
        </div>
        
        {/* Posts Section */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              {isCurrentUser ? 'My Posts' : 'Posts'}
            </h2>
            {isCurrentUser && userPosts.length > 0 && (
              <span className="text-sm text-gray-400">
                {userPosts.length} post{userPosts.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          {/* Posts Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading posts...</p>
            </div>
          ) : isCurrentUser && userPosts.length > 0 ? (
            <div className="grid grid-cols-3 gap-1">
              {userPosts.slice(0, 9).map((post) => (
                <button
                  key={post.id}
                  onClick={handleMediaClick}
                  className="aspect-square active:scale-95 transition-transform relative group"
                >
                  <img
                    src={post.media_url}
                    alt={post.caption}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg" />
                </button>
              ))}
            </div>
          ) : isCurrentUser ? (
            <div className="text-center py-12">
              <button
                onClick={handleCreatePost}
                className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-gray-700 active:scale-95 transition-all cursor-pointer"
              >
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <p className="text-gray-400 mb-2">No posts yet</p>
              <p className="text-gray-500 text-sm">Share your first post to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {Array.from({ length: 9 }).map((_, index) => (
                <button
                  key={index}
                  onClick={handleMediaClick}
                  className="aspect-square active:scale-95 transition-transform"
                >
                  <img
                    src={`https://picsum.photos/400/400?random=${profileData.id}-${index}`}
                    alt={`Media ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};