// src/screens/EditProfileScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { ChevronLeftIcon, CameraIcon, CheckIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { SocialAccountsSection } from '../components/social/SocialAccountsSection';
import { uploadProfileImage, uploadBannerImage, deleteImage, extractFilePathFromUrl } from '../lib/storage';
import { supabase } from '../lib/supabaseClient';
import { transformProfileToUser } from '../../lib/utils';
import { validateImageFile } from '../utils/imageUtils';

interface Props {
  user: User;
  onBack: () => void;
  onSave: (updatedUser: User) => void;
}

export const EditProfileScreen: React.FC<Props> = ({ user, onBack, onSave }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio,
    instagramUrl: user.instagramUrl,
    instagramVerified: user.instagramVerified,
    facebookUrl: user.facebookUrl,
    facebookVerified: user.facebookVerified,
    linkedInUrl: user.linkedInUrl,
    linkedInVerified: user.linkedInVerified,
    twitterUrl: user.twitterUrl,
    twitterVerified: user.twitterVerified,
  });
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profileUrl, setProfileUrl] = useState<string>(user.dpUrl);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverUrl, setCoverUrl] = useState<string>(user.coverPhotoUrl || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('profile_photo_url, cover_photo_url')
        .eq('id', user.id)
        .single();
      if (data) {
        setProfileUrl(data.profile_photo_url || profileUrl);
        setCoverUrl(data.cover_photo_url || '');
      }
    })();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleUserUpdate = (u: User) => {
    setFormData(prev => ({
      ...prev,
      instagramUrl: u.instagramUrl,
      instagramVerified: u.instagramVerified,
      facebookUrl: u.facebookUrl,
      facebookVerified: u.facebookVerified,
      linkedInUrl: u.linkedInUrl,
      linkedInVerified: u.linkedInVerified,
      twitterUrl: u.twitterUrl,
      twitterVerified: u.twitterVerified,
    }));
    setHasChanges(true);
  };

  const handleProfileImageSelect = () => {
    profileFileInputRef.current?.click();
  };

  const handleCoverImageSelect = () => {
    coverFileInputRef.current?.click();
  };

  const handleProfileFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file, 5); // 5MB limit
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setProfileUrl(url);
      setProfileFile(file);
      setHasChanges(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCoverFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file, 10); // 10MB limit
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setCoverUrl(url);
      setCoverFile(file);
      setHasChanges(true);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteProfilePhoto = () => {
    if (confirm('Are you sure you want to remove your profile photo?')) {
      setProfileUrl('');
      setProfileFile(null);
      setHasChanges(true);
    }
  };

  const handleDeleteCoverPhoto = () => {
    if (confirm('Are you sure you want to remove your cover photo?')) {
      setCoverUrl('');
      setCoverFile(null);
      setHasChanges(true);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let newProfileUrl = profileUrl;
      let newCoverUrl = coverUrl;

      // Upload new profile photo if selected
      if (profileFile) {
        const uploadedProfileUrl = await uploadProfileImage(profileFile);
        if (uploadedProfileUrl) {
          newProfileUrl = uploadedProfileUrl;
        } else {
          throw new Error('Failed to upload profile photo');
        }
      }

      // Upload new cover photo if selected
      if (coverFile) {
        const uploadedCoverUrl = await uploadBannerImage(coverFile);
        if (uploadedCoverUrl) {
          newCoverUrl = uploadedCoverUrl;
        } else {
          throw new Error('Failed to upload cover photo');
        }
      }

      // Update profile in database
      const updateData = {
        name: formData.name,
        bio: formData.bio,
        profile_photo_url: newProfileUrl || null,
        cover_photo_url: newCoverUrl || null,
        instagram_url: formData.instagramUrl,
        instagram_verified: formData.instagramVerified,
        facebook_url: formData.facebookUrl,
        facebook_verified: formData.facebookVerified,
        linked_in_url: formData.linkedInUrl,
        linked_in_verified: formData.linkedInVerified,
        twitter_url: formData.twitterUrl,
        twitter_verified: formData.twitterVerified,
        updated_at: new Date().toISOString(),
      };

      const { data: updated, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setShowSuccess(true);
      setTimeout(() => {
        onSave(transformProfileToUser({
          ...updated,
          profile_photo_url: newProfileUrl,
          cover_photo_url: newCoverUrl
        }));
      }, 1500);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!hasChanges || confirm('Discard changes?')) onBack();
  };

  if (showSuccess) {
    return (
      <div className="h-full bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <CheckIcon className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Profile Updated!</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-black overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-black/90 backdrop-blur-sm border-b border-gray-800 px-4 py-3 flex items-center justify-between z-50">
        <button onClick={handleCancel} className="p-2 rounded-full hover:bg-gray-800">
          <ChevronLeftIcon className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-lg font-semibold text-white">Edit Profile</h1>
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 px-4 py-2 rounded-full text-white disabled:bg-gray-600 flex items-center gap-2"
        >
          {loading
            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : 'Save'}
        </button>
      </div>

      {/* Cover Photo Section */}
      <div className="relative h-48 bg-gray-800">
        {coverUrl ? (
          <img 
            src={coverUrl} 
            alt="Cover" 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <CameraIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {/* Cover photo controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleCoverImageSelect}
            className="bg-black/50 backdrop-blur-sm p-2 rounded-full text-white hover:bg-black/70 transition-colors"
            title="Change cover photo"
          >
            <CameraIcon className="w-5 h-5" />
          </button>
          {coverUrl && (
            <button
              onClick={handleDeleteCoverPhoto}
              className="bg-black/50 backdrop-blur-sm p-2 rounded-full text-white hover:bg-black/70 transition-colors"
              title="Remove cover photo"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Profile Photo Section */}
      <div className="flex justify-center -mt-14 mb-6 relative z-10">
        <div className="relative">
          {profileUrl ? (
            <img 
              src={profileUrl} 
              alt="Profile" 
              className="w-28 h-28 rounded-full border-4 border-black object-cover shadow-xl" 
            />
          ) : (
            <div className="w-28 h-28 rounded-full border-4 border-black bg-gray-700 flex items-center justify-center shadow-xl">
              <CameraIcon className="w-8 h-8 text-gray-400" />
            </div>
          )}
          
          {/* Profile photo controls */}
          <div className="absolute -bottom-2 -right-2 flex gap-1">
            <button
              onClick={handleProfileImageSelect}
              className="bg-blue-600 p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
              title="Change profile photo"
            >
              <CameraIcon className="w-4 h-4 text-white" />
            </button>
            {profileUrl && (
              <button
                onClick={handleDeleteProfilePhoto}
                className="bg-red-600 p-2 rounded-full shadow-lg hover:bg-red-700 transition-colors"
                title="Remove profile photo"
              >
                <TrashIcon className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="px-4 space-y-8 pb-8">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Basic Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your display name"
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={e => handleInputChange('bio', e.target.value)}
              className="w-full h-24 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Tell people about yourself…"
              maxLength={150}
            />
            <p className="text-xs text-gray-400 text-right mt-1">{formData.bio.length}/150</p>
          </div>
        </div>

        <SocialAccountsSection user={{ ...user, ...formData }} onUserUpdate={handleUserUpdate} />
      </div>

      {/* Hidden file inputs */}
      <input 
        ref={profileFileInputRef} 
        type="file" 
        accept="image/*" 
        onChange={handleProfileFileSelect} 
        className="hidden" 
      />
      <input 
        ref={coverFileInputRef} 
        type="file" 
        accept="image/*" 
        onChange={handleCoverFileSelect} 
        className="hidden" 
      />
    </div>
  );
};