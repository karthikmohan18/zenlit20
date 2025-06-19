import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { ChevronLeftIcon, CameraIcon, CheckIcon } from '@heroicons/react/24/outline';
import { SocialAccountsSection } from '../components/social/SocialAccountsSection';
import { uploadProfileImage, uploadBannerImage } from '../lib/storage';
import { supabase } from '../lib/supabaseClient';
import { transformProfileToUser } from '../../lib/utils';

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
    coverPhotoUrl: user.coverPhotoUrl || '',
    // Social verification data
    instagramUrl: user.instagramUrl,
    instagramVerified: user.instagramVerified,
    facebookUrl: user.facebookUrl,
    facebookVerified: user.facebookVerified,
    linkedInUrl: user.linkedInUrl,
    linkedInVerified: user.linkedInVerified,
    twitterUrl: user.twitterUrl,
    twitterVerified: user.twitterVerified,
  });
  
  const [isEditing, setIsEditing] = useState({
    profilePicture: false,
    coverPhoto: false
  });
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [profileUrl, setProfileUrl] = useState<string>('');
  const [bannerUrl, setBannerUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('profile_photo_url, cover_photo_url')
        .eq('id', user.id)
        .single();
      if (data) {
        setProfileUrl(data.profile_photo_url || '');
        setBannerUrl(data.cover_photo_url || '');
      }
    })();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleUserUpdate = (updatedUser: User) => {
    setFormData(prev => ({
      ...prev,
      instagramUrl: updatedUser.instagramUrl,
      instagramVerified: updatedUser.instagramVerified,
      facebookUrl: updatedUser.facebookUrl,
      facebookVerified: updatedUser.facebookVerified,
      linkedInUrl: updatedUser.linkedInUrl,
      linkedInVerified: updatedUser.linkedInVerified,
      twitterUrl: updatedUser.twitterUrl,
      twitterVerified: updatedUser.twitterVerified,
    }));
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
        } else {
          setFormData(prev => ({ ...prev, coverPhotoUrl: imageUrl }));
        }
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (profileFile) {
        const newProfileUrl = await uploadProfileImage(profileFile);
        await supabase.from('profiles').update({ profile_photo_url: newProfileUrl }).eq('id', user.id);
        setProfileUrl(newProfileUrl);
      }
      if (bannerFile) {
        const newBannerUrl = await uploadBannerImage(bannerFile);
        await supabase.from('profiles').update({ cover_photo_url: newBannerUrl }).eq('id', user.id);
        setBannerUrl(newBannerUrl);
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed – please try again.');
    } finally {
      setLoading(false);
    }
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
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800">
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
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-full font-medium hover:bg-blue-700 active:scale-95 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
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

      {profileUrl && (
        <img
          src={profileUrl}
          alt="Profile Photo"
          style={{ width: 100, height: 100, borderRadius: '50%' }}
        />
      )}
      {bannerUrl && (
        <img
          src={bannerUrl}
          alt="Cover Photo"
          style={{ width: '100%', height: 150, objectFit: 'cover' }}
        />
      )}

      <input
        type="file"
        accept="image/*"
        onChange={e => setProfileFile(e.target.files?.[0] || null)}
      />
      <input
        type="file"
        accept="image/*"
        onChange={e => setBannerFile(e.target.files?.[0] || null)}
      />

      <div className="pb-8">
        {/* Cover Photo Section */}
        <div className="relative h-48 bg-gray-800">
          {formData.coverPhotoUrl ? (
            <img
              src={formData.coverPhotoUrl}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <div className="text-center">
                <CameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Add cover photo</p>
              </div>
            </div>
          )}
          
          <button
            onClick={() => handleImageSelect('cover')}
            className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm p-3 rounded-full text-white hover:bg-black/80 active:scale-95 transition-all z-10"
          >
            <CameraIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Picture Section */}
        <div className="relative -mt-14 mb-6">
          <div className="flex justify-center">
            <div className="relative">
              {formData.dpUrl ? (
                <img
                  src={formData.dpUrl}
                  alt="Profile"
                  className="w-28 h-28 rounded-full border-4 border-black object-cover shadow-xl"
                />
              ) : (
                <div className="w-28 h-28 rounded-full border-4 border-black bg-gray-700 flex items-center justify-center shadow-xl">
                  <CameraIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <button
                onClick={() => handleImageSelect('profile')}
                className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white hover:bg-blue-700 active:scale-95 transition-all shadow-lg z-10"
              >
                <CameraIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 space-y-8">
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

          {/* Social Accounts Authentication Section */}
          <SocialAccountsSection 
            user={{ ...user, ...formData }}
            onUserUpdate={handleUserUpdate}
          />
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