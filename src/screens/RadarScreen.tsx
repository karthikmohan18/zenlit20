import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RadarUserCard } from '../components/radar/RadarUserCard';
import { LocationPermissionModal } from '../components/radar/LocationPermissionModal';
import { User, UserLocation, LocationPermissionStatus } from '../types';
import { MapPinIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';
import { transformProfileToUser } from '../../lib/utils';
import { 
  requestLocationAndSave, 
  getNearbyUsers, 
  checkLocationPermission,
  isGeolocationSupported,
  isSecureContext,
  watchUserLocation,
  stopWatchingLocation,
  hasLocationChangedSignificantly,
  saveUserLocation,
  createDebouncedLocationUpdate,
  calculateDistance
} from '../lib/location';

interface Props {
  userGender: 'male' | 'female';
  onNavigate: (tab: string) => void;
  onViewProfile: (user: User) => void;
  onMessageUser?: (user: User) => void;
}

export const RadarScreen: React.FC<Props> = ({ 
  userGender, 
  onNavigate, 
  onViewProfile, 
  onMessageUser 
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<UserLocation | null>(null);
  const [locationPermission, setLocationPermission] = useState<LocationPermissionStatus>({
    granted: false,
    denied: false,
    pending: true
  });
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocationTracking, setIsLocationTracking] = useState(false);
  const [lastLocationUpdate, setLastLocationUpdate] = useState<number>(0);
  const [isUpdatingUsers, setIsUpdatingUsers] = useState(false);

  // Refs for cleanup
  const locationWatchId = useRef<number | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    initializeRadar();

    // Cleanup on unmount
    return () => {
      mountedRef.current = false;
      if (locationWatchId.current !== null) {
        stopWatchingLocation(locationWatchId.current);
        locationWatchId.current = null;
      }
    };
  }, []);

  const initializeRadar = async () => {
    try {
      console.log('🚀 RADAR DEBUG: Initializing radar screen with 1km radius');
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('🚀 RADAR DEBUG: User not found:', userError);
        setIsLoading(false);
        return;
      }

      console.log('🚀 RADAR DEBUG: Current user found:', user.id);

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError || !profile) {
        console.error('🚀 RADAR DEBUG: Profile not found:', profileError);
        setIsLoading(false);
        return;
      }

      console.log('🚀 RADAR DEBUG: User profile loaded:', {
        id: profile.id,
        name: profile.name,
        hasLocation: !!(profile.latitude && profile.longitude),
        latitude: profile.latitude,
        longitude: profile.longitude
      });

      setCurrentUser(profile);

      // Check if user already has location data
      if (profile.latitude && profile.longitude) {
        console.log('🚀 RADAR DEBUG: User has existing location data');
        const userLocation: UserLocation = {
          latitude: profile.latitude,
          longitude: profile.longitude,
          timestamp: Date.now()
        };
        setCurrentLocation(userLocation);
        setLocationPermission({ granted: true, denied: false, pending: false });
        await loadUsersWithin1km(user.id, userLocation);
        
        // Start location tracking for dynamic updates
        startLocationTracking(user.id);
      } else {
        console.log('🚀 RADAR DEBUG: User has no location data, need location for 1km radius');
        // Try to get real location first
        const permissionStatus = await checkLocationPermission();
        setLocationPermission(permissionStatus);
        
        if (permissionStatus.granted && isGeolocationSupported() && isSecureContext()) {
          // Try to get real location
          try {
            await handleRequestLocation();
          } catch (error) {
            console.log('🚀 RADAR DEBUG: Real location failed, cannot show users within 1km without location');
            setUsers([]); // No users without location for 1km radius
          }
        } else {
          // Cannot show users within 1km without location
          console.log('🚀 RADAR DEBUG: Location not available, cannot show users within 1km radius');
          setUsers([]);
        }
      }
    } catch (error) {
      console.error('🚀 RADAR DEBUG: Error initializing radar:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load users within 1km radius only
  const loadUsersWithin1km = async (currentUserId: string, location: UserLocation) => {
    try {
      console.log('🔄 RADAR DEBUG: Loading users within 1km radius');
      
      if (!isUpdatingUsers) {
        setIsLoading(true);
      }

      // Use the updated getNearbyUsers function with 1km radius
      const result = await getNearbyUsers(currentUserId, location, 1, 20);

      if (!result.success) {
        console.error('Error loading nearby users:', result.error);
        if (mountedRef.current) {
          setUsers([]);
        }
        return;
      }

      // Transform profiles to User type
      const transformedUsers: User[] = (result.users || []).map(profile => {
        const user = transformProfileToUser(profile);
        user.distance = profile.distance; // Use the calculated distance
        return user;
      });

      console.log('🔄 RADAR DEBUG: Final users within 1km:', transformedUsers);

      if (mountedRef.current) {
        setUsers(transformedUsers);
        console.log(`🔄 RADAR DEBUG: Set ${transformedUsers.length} users within 1km radius`);
      }
    } catch (error) {
      console.error('🔄 RADAR DEBUG: Error in loadUsersWithin1km:', error);
      if (mountedRef.current) {
        setUsers([]);
      }
    } finally {
      if (mountedRef.current && !isUpdatingUsers) {
        setIsLoading(false);
      }
    }
  };

  // Debounced function to update users when location changes
  const debouncedUpdateUsers = useCallback(
    createDebouncedLocationUpdate(async (location: UserLocation) => {
      if (!currentUser || !mountedRef.current) return;
      
      console.log('Location changed significantly, updating users within 1km...');
      setIsUpdatingUsers(true);
      
      try {
        // Save new location to profile
        await saveUserLocation(currentUser.id, location);
        
        // Update nearby users within 1km
        await loadUsersWithin1km(currentUser.id, location);
        
        setLastLocationUpdate(Date.now());
      } catch (error) {
        console.error('Error updating users after location change:', error);
      } finally {
        if (mountedRef.current) {
          setIsUpdatingUsers(false);
        }
      }
    }, 3000), // 3 second debounce
    [currentUser]
  );

  const startLocationTracking = (userId: string) => {
    if (locationWatchId.current !== null) {
      stopWatchingLocation(locationWatchId.current);
    }

    console.log('Starting dynamic location tracking for 1km radius...');
    setIsLocationTracking(true);

    const watchId = watchUserLocation(
      (newLocation: UserLocation) => {
        if (!mountedRef.current) return;

        setCurrentLocation(prevLocation => {
          // Check if location has changed significantly
          if (prevLocation && hasLocationChangedSignificantly(prevLocation, newLocation, 0.1)) {
            console.log('Significant location change detected, updating 1km radius');
            debouncedUpdateUsers(newLocation);
          }
          
          return newLocation;
        });
      },
      (error: string) => {
        if (!mountedRef.current) return;
        
        console.error('Location tracking error:', error);
        setLocationError(error);
        setIsLocationTracking(false);
        
        if (locationWatchId.current !== null) {
          stopWatchingLocation(locationWatchId.current);
          locationWatchId.current = null;
        }
      }
    );

    if (watchId !== null) {
      locationWatchId.current = watchId;
    } else {
      setIsLocationTracking(false);
    }
  };

  const handleRequestLocation = async () => {
    if (!currentUser) return;

    setIsRequestingLocation(true);
    setLocationError(null);

    try {
      const result = await requestLocationAndSave(currentUser.id, currentUser.location);
      
      if (result.success && result.location) {
        console.log('Location obtained and saved successfully for 1km radius');
        setCurrentLocation(result.location);
        setLocationPermission({ granted: true, denied: false, pending: false });
        setShowLocationModal(false);
        
        // Load users within 1km with the new location
        await loadUsersWithin1km(currentUser.id, result.location);
        
        // Start location tracking for dynamic updates
        startLocationTracking(currentUser.id);
      } else {
        console.error('Failed to get location:', result.error);
        setLocationError(result.error || 'Failed to get location');
        
        // Cannot show users without location for 1km radius
        setUsers([]);
        
        // Update permission status based on error
        if (result.error?.includes('denied')) {
          setLocationPermission({ granted: false, denied: true, pending: false });
        }
      }
    } catch (error) {
      console.error('Location request error:', error);
      setLocationError('Failed to get location. Cannot show users within 1km without location.');
      
      // Cannot show users without location
      setUsers([]);
    } finally {
      setIsRequestingLocation(false);
    }
  };

  const handleViewProfile = (user: User) => {
    onViewProfile(user);
    onNavigate('profile');
  };

  const handleMessage = (user: User) => {
    if (onMessageUser) {
      onMessageUser(user);
    }
    onNavigate('messages');
  };

  const handleRetryLocation = () => {
    setLocationError(null);
    if (isGeolocationSupported() && isSecureContext()) {
      setShowLocationModal(true);
    } else {
      setLocationError('Location access is required to find users within 1km radius');
    }
  };

  const handleRefreshLocation = async () => {
    if (!currentUser || isRequestingLocation) return;
    
    setLocationError(null);
    
    if (isGeolocationSupported() && isSecureContext()) {
      await handleRequestLocation();
    } else {
      setLocationError('Location access is required to find users within 1km radius');
    }
  };

  const handleEnablePreciseLocation = () => {
    setShowLocationModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-full bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Finding people within 1km...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-sm border-b border-gray-800">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">People Within 1km</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <MapPinIcon className={`w-4 h-4 ${
                    isLocationTracking ? 'text-green-500' : 
                    currentLocation ? 'text-blue-500' : 'text-gray-500'
                  }`} />
                  <span className={`text-xs ${
                    isLocationTracking ? 'text-green-400' : 
                    currentLocation ? 'text-blue-400' : 'text-gray-400'
                  }`}>
                    {isLocationTracking ? 'Live tracking (1km radius)' : 
                     currentLocation ? 'Location enabled (1km radius)' : 'Location required'}
                  </span>
                </div>
                {isUpdatingUsers && (
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-blue-400">Updating...</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-400">
                {currentLocation ? 
                  (users.length > 0 ? `${users.length} people within 1km` : 'No people within 1km') :
                  'Enable location to find people within 1km'
                }
              </p>
            </div>
            
            {/* Refresh location button */}
            <button
              onClick={handleRefreshLocation}
              disabled={isRequestingLocation}
              className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 active:scale-95 transition-all disabled:bg-gray-600"
              title="Refresh location and update nearby users"
            >
              {isRequestingLocation ? (
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowPathIcon className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Location Status Info */}
      {!currentLocation && (
        <div className="px-4 py-3 bg-blue-900/20 border-b border-blue-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-blue-500" />
              <div>
                <span className="text-sm text-blue-400 font-medium">Location Required</span>
                <p className="text-xs text-blue-300">
                  Enable precise location to find people within 1km radius
                </p>
              </div>
            </div>
            {isGeolocationSupported() && isSecureContext() && (
              <button
                onClick={handleEnablePreciseLocation}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
              >
                Enable
              </button>
            )}
          </div>
        </div>
      )}

      {isLocationTracking && (
        <div className="px-4 py-2 bg-green-900/20 border-b border-green-700/30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-400">
              Live tracking active - finding people within 1km as you move
            </span>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="px-4 py-4 space-y-4 pb-20">
        {currentLocation ? (
          users.length > 0 ? (
            users.map((user) => (
              <RadarUserCard
                key={user.id}
                user={user}
                onMessage={handleMessage}
                onViewProfile={() => handleViewProfile(user)}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPinIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-400 mb-2">No people within 1km</p>
              <p className="text-gray-500 text-sm">
                Move around or check back later to find people nearby!
              </p>
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-400 mb-2">Location Access Required</p>
            <p className="text-gray-500 text-sm mb-4">
              We need your location to find people within 1km radius
            </p>
            <button
              onClick={handleEnablePreciseLocation}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all"
            >
              Enable Location
            </button>
          </div>
        )}
      </div>

      {/* Location Permission Modal */}
      <LocationPermissionModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onRequestLocation={handleRequestLocation}
        isRequesting={isRequestingLocation}
        error={locationError || undefined}
      />
    </div>
  );
};