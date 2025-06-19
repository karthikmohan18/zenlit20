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
  const [useDefaultLocation, setUseDefaultLocation] = useState(false);

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
      console.log('🚀 RADAR DEBUG: Initializing radar screen');
      
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
        await loadRealUsersOnly(user.id, userLocation);
        
        // Start location tracking for dynamic updates
        startLocationTracking(user.id);
      } else {
        console.log('🚀 RADAR DEBUG: User has no location data, trying to get location');
        // Try to get real location first
        const permissionStatus = await checkLocationPermission();
        setLocationPermission(permissionStatus);
        
        if (permissionStatus.granted && isGeolocationSupported() && isSecureContext()) {
          // Try to get real location
          try {
            await handleRequestLocation();
          } catch (error) {
            console.log('🚀 RADAR DEBUG: Real location failed, loading users without location');
            await loadRealUsersOnly(user.id, null);
          }
        } else {
          // Load real users without location
          console.log('🚀 RADAR DEBUG: Location not available, loading users without location');
          await loadRealUsersOnly(user.id, null);
        }
      }
    } catch (error) {
      console.error('🚀 RADAR DEBUG: Error initializing radar:', error);
      // Even if there's an error, try to show users
      if (currentUser) {
        await loadRealUsersOnly(currentUser.id, null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load only real users from database - no more dummy data
  const loadRealUsersOnly = async (currentUserId: string, location: UserLocation | null) => {
    try {
      console.log('🔄 RADAR DEBUG: Loading real users only');
      
      if (!isUpdatingUsers) {
        setIsLoading(true);
      }

      // Get all real users from database
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', currentUserId)
        .not('name', 'is', null)
        .not('bio', 'is', null)
        .limit(50);

      console.log('🔄 RADAR DEBUG: Real profiles from database:', profiles);

      if (error) {
        console.error('Error loading real users:', error);
        if (mountedRef.current) {
          setUsers([]);
        }
        return;
      }

      // Transform profiles and calculate distances if location is available
      const transformedUsers: User[] = (profiles || []).map(profile => {
        const user = transformProfileToUser(profile);
        
        // Calculate real distance if both users have location data
        if (location && profile.latitude && profile.longitude) {
          user.distance = calculateDistance(
            location.latitude,
            location.longitude,
            profile.latitude,
            profile.longitude
          );
          console.log(`🔄 RADAR DEBUG: Real distance for ${user.name}: ${user.distance}km`);
        } else {
          // Show all users but without specific distance
          user.distance = 0; // No distance available
          console.log(`🔄 RADAR DEBUG: No location data for distance calculation: ${user.name}`);
        }
        
        return user;
      }).sort((a, b) => {
        // Sort by distance if available, otherwise by name
        if (a.distance === 0 && b.distance === 0) {
          return a.name.localeCompare(b.name);
        }
        return a.distance - b.distance;
      });

      console.log('🔄 RADAR DEBUG: Final transformed real users:', transformedUsers);

      if (mountedRef.current) {
        setUsers(transformedUsers);
        console.log(`🔄 RADAR DEBUG: Set ${transformedUsers.length} real users`);
      }
    } catch (error) {
      console.error('🔄 RADAR DEBUG: Error in loadRealUsersOnly:', error);
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
      
      console.log('Location changed significantly, updating nearby users...');
      setIsUpdatingUsers(true);
      
      try {
        // Save new location to profile
        await saveUserLocation(currentUser.id, location);
        
        // Update nearby users
        await loadRealUsersOnly(currentUser.id, location);
        
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

    console.log('Starting dynamic location tracking...');
    setIsLocationTracking(true);

    const watchId = watchUserLocation(
      (newLocation: UserLocation) => {
        if (!mountedRef.current) return;

        setCurrentLocation(prevLocation => {
          // Check if location has changed significantly
          if (prevLocation && hasLocationChangedSignificantly(prevLocation, newLocation, 0.1)) {
            console.log('Significant location change detected');
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
        console.log('Location obtained and saved successfully');
        setCurrentLocation(result.location);
        setLocationPermission({ granted: true, denied: false, pending: false });
        setShowLocationModal(false);
        setUseDefaultLocation(false);
        
        // Load nearby users with the new location
        await loadRealUsersOnly(currentUser.id, result.location);
        
        // Start location tracking for dynamic updates
        startLocationTracking(currentUser.id);
      } else {
        console.error('Failed to get location:', result.error);
        setLocationError(result.error || 'Failed to get location');
        
        // Load users without location
        await loadRealUsersOnly(currentUser.id, null);
        
        // Update permission status based on error
        if (result.error?.includes('denied')) {
          setLocationPermission({ granted: false, denied: true, pending: false });
        }
      }
    } catch (error) {
      console.error('Location request error:', error);
      setLocationError('Failed to get location. Showing all users.');
      
      // Load users without location
      await loadRealUsersOnly(currentUser.id, null);
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
      // Just refresh users without location
      handleRefreshLocation();
    }
  };

  const handleRefreshLocation = async () => {
    if (!currentUser || isRequestingLocation) return;
    
    setLocationError(null);
    
    if (isGeolocationSupported() && isSecureContext()) {
      await handleRequestLocation();
    } else {
      // Refresh users without location
      await loadRealUsersOnly(currentUser.id, currentLocation);
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
          <p className="text-gray-400">Finding people nearby...</p>
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
              <h1 className="text-xl font-bold text-white">Nearby People</h1>
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
                    {isLocationTracking ? 'Live tracking' : 
                     currentLocation ? 'Location enabled' : 'No location'}
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
                {users.length > 0 ? `${users.length} people found` : 'Searching for people...'}
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
        <div className="px-4 py-2 bg-blue-900/20 border-b border-blue-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-xs text-blue-400">
                Enable location to see distances and find people nearby
              </span>
            </div>
            {isGeolocationSupported() && isSecureContext() && (
              <button
                onClick={handleEnablePreciseLocation}
                className="text-xs text-blue-400 hover:text-blue-300 underline"
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
              Live location tracking active - radar updates automatically as you move
            </span>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="px-4 py-4 space-y-4 pb-20">
        {users.length > 0 ? (
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
            <p className="text-gray-400 mb-2">No people found</p>
            <p className="text-gray-500 text-sm">
              Users will appear here as they join Zenlit!
            </p>
            {!currentLocation && (
              <div className="mt-4">
                <button
                  onClick={handleEnablePreciseLocation}
                  className="text-blue-400 hover:text-blue-300 text-sm underline"
                >
                  Enable location to find people nearby
                </button>
              </div>
            )}
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