import React, { useState, useRef } from 'react';
import { User } from '../types';
import { ChevronLeftIcon, CameraIcon, PhotoIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { IconBrandInstagram, IconBrandLinkedin, IconBrandX } from '@tabler/icons-react';

interface Props {
  user: User;
  onBack: () => void;
  onSave: (updatedUser: User) => void;
}

export const EditProfileScreen: React.FC<Props> = ({ user, onBack, onSave }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio,
    dpUrl: user.dpUrl,
    links: {
      Twitter: user.links.Twitter,
      Instagram: user.links.Instagram,
      LinkedIn: user.links.LinkedIn,
    }
  });
  
  const [isEditing, setIsEditing] = useState({
    profilePicture: false,
    coverPhoto: false
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    setHasChanges(true);
  };

  const handleImageSelect = (type: 'profile' | 'cover') => {
    const input = type === 'profile' ? fileInputRef.current : coverInputRef.current;
    input?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        if (type === 'profile') {
          setFormData(prev => ({ ...prev, dpUrl: imageUrl }));
        }
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate save delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const updatedUser: User = {
      ...user,
      ...formData
    };
    
    onSave(updatedUser);
    setIsSaving(false);
    setShowSuccess(true);
    setHasChanges(false);
    
    // Auto close success message and go back
    setTimeout(() => {
      setShowSuccess(false);
      onBack();
    }, 2000);
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to go back?')) {
        onBack();
      }
    } else {
      onBack();
    }
  };

  // Success Animation Component
  if (showSuccess) {
    return (
      <div className="h-full bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <CheckIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Profile Updated!</h2>
          <p className="text-gray-400">Your changes have been saved</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-black overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleCancel}
            className="p-2 rounded-full hover:bg-gray-800 active:scale-95 transition-all"
          >
            <ChevronLeftIcon className="w-5 h-5 text-white" />
          </button>
          
          <h1 className="text-lg font-semibold text-white">Edit Profile</h1>
          
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="bg-blue-600 text-white px-4 py-2 rounded-full font-medium hover:bg-blue-700 active:scale-95 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>

      <div className="pb-8">
        {/* Cover Photo Section */}
        <div className="relative h-48 bg-gradient-to-b from-blue-900 to-black">
          <img
            src={`https://picsum.photos/800/400?random=${user.id}`}
            alt="Cover"
            className="w-full h-full object-cover opacity-60"
          />
          
          <button
            onClick={() => handleImageSelect('cover')}
            className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm p-3 rounded-full text-white hover:bg-black/80 active:scale-95 transition-all z-50"
          >
            <CameraIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Picture Section */}
        <div className="relative -mt-14 mb-6">
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={formData.dpUrl}
                alt="Profile"
                className="w-28 h-28 rounded-full border-4 border-black object-cover shadow-xl"
              />
              <button
                onClick={() => handleImageSelect('profile')}
                className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white hover:bg-blue-700 active:scale-95 transition-all shadow-lg z-50"
              >
                <CameraIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Basic Information</h2>
            
            {/* Name - Read Only */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={formData.name}
                readOnly
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 cursor-not-allowed"
                placeholder="Enter your name"
              />
              <p className="text-xs text-gray-500 mt-1">
                Display name cannot be changed
              </p>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="w-full h-24 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Tell people about yourself..."
                maxLength={150}
              />
              <div className="flex justify-end mt-1">
                <span className={`text-xs ${formData.bio.length > 140 ? 'text-red-400' : 'text-gray-400'}`}>
                  {formData.bio.length}/150
                </span>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Social Links</h2>
            
            {/* Twitter */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                <IconBrandX size={16} className="mr-2" />
                X (Twitter)
              </label>
              <input
                type="url"
                value={formData.links.Twitter}
                onChange={(e) => handleInputChange('links.Twitter', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://twitter.com/username"
              />
            </div>

            {/* Instagram */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                <IconBrandInstagram size={16} className="mr-2" />
                Instagram
              </label>
              <input
                type="url"
                value={formData.links.Instagram}
                onChange={(e) => handleInputChange('links.Instagram', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://instagram.com/username"
              />
            </div>

            {/* LinkedIn */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                <IconBrandLinkedin size={16} className="mr-2" />
                LinkedIn
              </label>
              <input
                type="url"
                value={formData.links.LinkedIn}
                onChange={(e) => handleInputChange('links.LinkedIn', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e, 'profile')}
          className="hidden"
        />
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e, 'cover')}
          className="hidden"
        />
      </div>
    </div>
  );
};