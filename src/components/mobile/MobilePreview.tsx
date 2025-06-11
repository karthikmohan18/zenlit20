import React from 'react';
import { HomeIcon, UserGroupIcon, PlusIcon, ChatBubbleLeftIcon, UserIcon } from '@heroicons/react/24/outline';

export const MobilePreview: React.FC = () => {
  return (
    <div className="w-full max-w-md mx-auto bg-black text-white rounded-lg overflow-hidden">
      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
        <div className="max-w-md mx-auto">
          <div className="flex justify-around p-4">
            <button className="flex flex-col items-center text-blue-600">
              <HomeIcon className="h-6 w-6" />
              <span className="text-xs sm:hidden">Home</span>
            </button>
            
            <button className="flex flex-col items-center text-gray-400">
              <UserGroupIcon className="h-6 w-6" />
              <span className="text-xs sm:hidden">Radar</span>
            </button>

            <button className="flex flex-col items-center text-gray-400">
              <PlusIcon className="h-6 w-6" />
              <span className="text-xs sm:hidden">Create</span>
            </button>

            <button className="flex flex-col items-center text-gray-400">
              <ChatBubbleLeftIcon className="h-6 w-6" />
              <span className="text-xs sm:hidden">Messages</span>
            </button>
            
            <button className="flex flex-col items-center text-gray-400">
              <UserIcon className="h-6 w-6" />
              <span className="text-xs sm:hidden">Profile</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="min-h-screen pb-20">
        {/* Chat Window */}
        <div className="h-[calc(100vh-64px)]">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b">
            <div className="flex items-center gap-3">
              <img 
                src="https://randomuser.me/api/portraits/men/1.jpg" 
                alt="John Smith" 
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h3 className="font-semibold">John Smith</h3>
                <p className="text-sm text-gray-500">Active now</p>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Example Messages */}
            <div className="flex-1">
              <div className="mb-4">
                <div className="px-4 py-2 rounded-lg bg-gray-100">
                  <p className="text-sm">Hi there! How are you?</p>
                  <p className="text-xs text-gray-500 mt-1">15:30</p>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="px-4 py-2 rounded-lg bg-blue-600 text-white">
                  <p className="text-sm">I'm doing great, thanks! How about you?</p>
                  <p className="text-xs text-gray-200 mt-1">15:31</p>
                </div>
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-800">
            <form className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
