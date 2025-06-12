import React, { useState, useEffect } from 'react';
import { PostsFeed } from '../components/post/PostsFeed';
import { UserProfile } from '../components/profile/UserProfile';
import { User, PostWithProfile, postWithProfileToLegacyPost, profileToUser } from '../types';
import { PostsService } from '../services/posts.service';
import { ProfileService } from '../services/profile.service';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

interface Props {
  currentUser: User | null;
}

export const HomeScreen: React.FC<Props> = ({ currentUser }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const { posts: fetchedPosts, error: postsError } = await PostsService.getFeed(20, 0);
      
      if (postsError) {
        throw postsError;
      }
      
      setPosts(fetchedPosts);
    } catch (err) {
      console.error('Error loading posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async (userId: string) => {
    try {
      const { profile, error: profileError } = await ProfileService.getProfile(userId);
      
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
  };

  if (selectedUser) {
    return (
      <div className="h-full bg-black">
        <button
          onClick={() => setSelectedUser(null)}
          className="fixed top-4 left-4 z-50 bg-gray-900/80 backdrop-blur-sm p-3 rounded-full shadow-lg active:scale-95 transition-transform"
        >
          <ChevronLeftIcon className="w-5 h-5 text-white" />
        </button>
        <UserProfile user={selectedUser} />
      </div>
    );
  }

  return (
    <div className="h-full bg-black overflow-y-auto">
      {/* Header - Now scrolls with content */}
      <div className="bg-black border-b border-gray-800">
        <div className="px-4 py-3 flex items-center">
          <svg className="w-8 h-8 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h1 className="text-xl font-bold text-white">Feed</h1>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 bg-red-900/30 border border-red-700 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => {
              setError(null);
              loadPosts();
            }}
            className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
          >
            Try again
          </button>
        </div>
      )}

      {/* Posts Feed */}
      <div className="px-4 py-4 space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading posts...</p>
          </div>
        ) : posts.length > 0 ? (
          <PostsFeed 
            posts={posts.map(postWithProfileToLegacyPost)} 
            onUserClick={handleUserClick} 
          />
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-gray-400 mb-2">No posts yet</p>
            <p className="text-gray-500 text-sm">Be the first to share something!</p>
          </div>
        )}
      </div>
    </div>
  );
};