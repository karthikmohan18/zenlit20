// src/screens/EditProfileScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { ChevronLeftIcon, CameraIcon, CheckIcon } from '@heroicons/react/24/outline';
import { SocialAccountsSection } from '../components/social/SocialAccountsSection';
import { uploadProfileImage } from '../lib/storage';
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
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('profile_photo_url')
        .eq('id', user.id)
        .single();
      if (data) {
        setProfileUrl(data.profile_photo_url || profileUrl);
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

  const handleImageSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setProfileUrl(url);
      setProfileFile(file);
      setHasChanges(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let newDp = profileUrl;

      if (profileFile) {
        newDp = (await uploadProfileImage(profileFile)) || newDp;
        await supabase.from('profiles').update({ profile_photo_url: newDp }).eq('id', user.id);
        setProfileUrl(newDp);
      }

      const updateData = {
        name: formData.name,
        bio: formData.bio,
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
          profile_photo_url: newDp
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

      <div className="relative -mt-14 mb-6 flex justify-center">
        <div className="relative">
          {profileUrl
            ? <img src={profileUrl} alt="Profile" className="w-28 h-28 rounded-full border-4 border-black object-cover shadow-xl" />
            : (
              <div className="w-28 h-28 rounded-full border-4 border-black bg-gray-700 flex items-center justify-center shadow-xl">
                <CameraIcon className="w-8 h-8 text-gray-400" />
              </div>
            )}
          <button
            onClick={handleImageSelect}
            className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full shadow-lg"
          >
            <CameraIcon className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <div className="px-4 space-y-8 pb-8">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Basic Information</h2>
          <textarea
            value={formData.bio}
            onChange={e => handleInputChange('bio', e.target.value)}
            className="w-full h-24 p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
            placeholder="Tell people about yourself…"
            maxLength={150}
          />
          <p className="text-xs text-gray-400 text-right">{formData.bio.length}/150</p>
        </div>

        <SocialAccountsSection user={{ ...user, ...formData }} onUserUpdate={handleUserUpdate} />
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
    </div>
  );
};